<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

class AdminStockRequestController extends Controller
{
    public function index(Request $request)
    {
        $stockRequests = DB::table('stock_requests')
            ->join('users', 'stock_requests.franchise_id', '=', 'users.id')
            ->select('stock_requests.*', 'users.name as franchise_name', 'users.email')
            ->when($request->search, function ($query, $search) {
                $query->where(function ($inner) use ($search) {
                    $inner->where('stock_requests.id', 'like', "%{$search}%")
                        ->orWhere('stock_requests.request_number', 'like', "%{$search}%")
                        ->orWhere('users.name', 'like', "%{$search}%")
                        ->orWhere('users.email', 'like', "%{$search}%");
                });
            })
            ->when($request->status, fn ($query, $status) => $query->where('stock_requests.status', strtolower($status)))
            ->orderByRaw("CASE stock_requests.status WHEN 'pending' THEN 1 WHEN 'approved' THEN 2 WHEN 'paid' THEN 3 WHEN 'dispatched' THEN 4 ELSE 5 END")
            ->orderByDesc('stock_requests.created_at')
            ->paginate(15)
            ->withQueryString();

        $stockRequests->getCollection()->transform(function ($req) {
            $items = $this->requestItems((int) $req->id);
            $req->items = $items;
            $req->items_count = $items->sum('quantity');
            $req->request_number = $req->request_number ?: 'REQ-' . str_pad($req->id, 5, '0', STR_PAD_LEFT);
            $req->payment_status = $req->payment_status ?: 'unpaid';

            return $req;
        });

        $stats = [
            'pending' => DB::table('stock_requests')->where('status', 'pending')->count(),
            'approved' => DB::table('stock_requests')->whereIn('status', ['approved', 'paid'])->count(),
            'dispatched' => DB::table('stock_requests')->where('status', 'dispatched')->count(),
        ];

        return Inertia::render('Admin/StockRequests', [
            'requests' => $stockRequests,
            'stats' => $stats,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function updateStatus(Request $request, int $id)
    {
        $validated = $request->validate([
            'status' => 'required|string|in:pending,approved,rejected,paid,dispatched,completed,cancelled,Pending,Approved,Rejected,Paid,Dispatched,Completed,Cancelled',
            'admin_notes' => 'nullable|string|max:1000',
        ]);

        $status = strtolower($validated['status']);
        $stockRequest = DB::table('stock_requests')->where('id', $id)->first();

        if (! $stockRequest) {
            return back()->withErrors('Stock request not found.');
        }

        if (in_array(strtolower((string) $stockRequest->status), ['rejected', 'cancelled', 'completed'], true) && $status !== strtolower((string) $stockRequest->status)) {
            return back()->withErrors('This stock request is already closed.');
        }

        try {
            DB::transaction(function () use ($status, $stockRequest, $validated) {
                if ($status === 'dispatched' && strtolower((string) $stockRequest->status) !== 'dispatched') {
                    $this->dispatchStock($stockRequest);
                }

                $payload = [
                    'status' => $status,
                    'updated_at' => now(),
                ];

                if (Schema::hasColumn('stock_requests', 'admin_notes') && array_key_exists('admin_notes', $validated)) {
                    $payload['admin_notes'] = $validated['admin_notes'];
                }

                if (Schema::hasColumn('stock_requests', 'payment_status')) {
                    if ($status === 'paid') {
                        $payload['payment_status'] = 'paid';
                    } elseif ($status === 'approved' && empty($stockRequest->payment_status)) {
                        $payload['payment_status'] = 'unpaid';
                    }
                }

                DB::table('stock_requests')->where('id', $stockRequest->id)->update($payload);
            });
        } catch (\Throwable $e) {
            return back()->withErrors(['status' => $e->getMessage()]);
        }

        return back()->with('success', 'Stock request marked as ' . ucfirst($status) . '.');
    }

    private function dispatchStock(object $stockRequest): void
    {
        $items = $this->requestItems((int) $stockRequest->id);

        if ($items->isEmpty() && $stockRequest->sku_id && $stockRequest->quantity) {
            $productId = DB::table('skus')->where('id', $stockRequest->sku_id)->value('product_id');
            $items = collect([(object) [
                'product_id' => $productId,
                'sku_id' => $stockRequest->sku_id,
                'quantity' => (int) $stockRequest->quantity,
            ]]);
        }

        if ($items->isEmpty()) {
            throw new \RuntimeException('This request has no stock items to dispatch.');
        }

        foreach ($items as $item) {
            $quantity = (int) $item->quantity;
            $skuId = $item->sku_id ?? DB::table('skus')->where('product_id', $item->product_id)->value('id');

            if (! $skuId) {
                throw new \RuntimeException('No SKU found for requested product.');
            }

            $masterInventory = DB::table('inventories')
                ->where('sku_id', $skuId)
                ->whereNull('franchise_id')
                ->lockForUpdate()
                ->first();

            if (! $masterInventory || (int) $masterInventory->stock_quantity < $quantity) {
                $productName = DB::table('products')->where('id', $item->product_id)->value('name') ?: 'requested product';
                throw new \RuntimeException("Not enough master stock for {$productName}.");
            }

            DB::table('inventories')->where('id', $masterInventory->id)->decrement('stock_quantity', $quantity);

            $franchiseInventory = DB::table('inventories')
                ->where('sku_id', $skuId)
                ->where('franchise_id', $stockRequest->franchise_id)
                ->first();

            if ($franchiseInventory) {
                DB::table('inventories')->where('id', $franchiseInventory->id)->increment('stock_quantity', $quantity);
            } else {
                DB::table('inventories')->insert([
                    'sku_id' => $skuId,
                    'franchise_id' => $stockRequest->franchise_id,
                    'stock_quantity' => $quantity,
                    'low_stock_threshold' => 10,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            $this->syncFranchiseProductInventory((int) $stockRequest->franchise_id, (int) $item->product_id, $quantity);
            $this->stockTransaction($skuId, null, 'out', $quantity, 'Dispatched for stock request #' . $stockRequest->id);
            $this->stockTransaction($skuId, (int) $stockRequest->franchise_id, 'in', $quantity, 'Received from master request #' . $stockRequest->id);
        }
    }

    private function syncFranchiseProductInventory(int $franchiseId, int $productId, int $quantity): void
    {
        if (! Schema::hasTable('franchise_inventory')) {
            return;
        }

        $quantityColumn = Schema::hasColumn('franchise_inventory', 'quantity') ? 'quantity' : 'stock_quantity';
        $existing = DB::table('franchise_inventory')
            ->where('franchise_id', $franchiseId)
            ->where('product_id', $productId)
            ->first();

        if ($existing) {
            DB::table('franchise_inventory')->where('id', $existing->id)->increment($quantityColumn, $quantity);
            if (Schema::hasColumn('franchise_inventory', 'received_quantity')) {
                DB::table('franchise_inventory')->where('id', $existing->id)->increment('received_quantity', $quantity);
            }
            return;
        }

        $payload = [
            'franchise_id' => $franchiseId,
            'product_id' => $productId,
            $quantityColumn => $quantity,
            'created_at' => now(),
            'updated_at' => now(),
        ];

        foreach (['low_stock_threshold' => 5, 'received_quantity' => $quantity, 'sold_quantity' => 0, 'returned_quantity' => 0, 'damaged_quantity' => 0] as $column => $value) {
            if (Schema::hasColumn('franchise_inventory', $column)) {
                $payload[$column] = $value;
            }
        }

        if (Schema::hasColumn('franchise_inventory', 'variant_id')) {
            $payload['variant_id'] = null;
        }

        DB::table('franchise_inventory')->insert($payload);
    }

    private function stockTransaction(int $skuId, ?int $franchiseId, string $type, int $quantity, string $reason): void
    {
        if (! Schema::hasTable('stock_transactions')) {
            return;
        }

        DB::table('stock_transactions')->insert([
            'sku_id' => $skuId,
            'franchise_id' => $franchiseId,
            'transaction_type' => $type,
            'quantity' => $quantity,
            'reason' => $reason,
            'performed_by' => auth()->id(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    private function requestItems(int $requestId)
    {
        if (! Schema::hasTable('stock_request_items')) {
            return collect();
        }

        $items = DB::table('stock_request_items')
            ->join('products', 'stock_request_items.product_id', '=', 'products.id')
            ->where('stock_request_items.stock_request_id', $requestId)
            ->select(
                'stock_request_items.*',
                'products.name as product_name'
            )
            ->get();

        return $items->map(function ($item) {
            $item->sku_id = DB::table('skus')->where('product_id', $item->product_id)->value('id');
            return $item;
        });
    }
}
