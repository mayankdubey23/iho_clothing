<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use App\Models\User;

class AdminStockRequestController extends Controller
{
    public function index(Request $request)
    {
        // Fetch Stock Requests with Franchise and Items details
        $stockRequests = DB::table('stock_requests')
            ->join('users', 'stock_requests.franchise_id', '=', 'users.id')
            ->select('stock_requests.*', 'users.name as franchise_name', 'users.email')
            ->when($request->search, function ($query, $search) {
                $query->where('stock_requests.id', 'like', "%{$search}%")
                      ->orWhere('users.name', 'like', "%{$search}%");
            })
            ->when($request->status, function ($query, $status) {
                $query->where('stock_requests.status', $status);
            })
            ->orderBy('stock_requests.created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        // Get items count for each request
        foreach ($stockRequests as $req) {
            $req->items_count = DB::table('stock_request_items')->where('stock_request_id', $req->id)->sum('quantity');
        }

        $stats = [
            'pending' => DB::table('stock_requests')->where('status', 'pending')->count(),
            'approved' => DB::table('stock_requests')->where('status', 'approved')->count(),
            'dispatched' => DB::table('stock_requests')->where('status', 'dispatched')->count(),
        ];

        return Inertia::render('Admin/StockRequests', [
            'requests' => $stockRequests,
            'stats' => $stats,
            'filters' => $request->only(['search', 'status'])
        ]);
    }

    // 🚀 The Master Logic: Handle Status & Inventory Movement
    public function updateStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|string|in:pending,approved,rejected,paid,dispatched,completed,cancelled,Pending,Approved,Rejected,Paid,Dispatched,Completed,Cancelled'
        ]);

        $status = strtolower($validated['status']);

        $stockRequest = DB::table('stock_requests')->where('id', $id)->first();
        if (!$stockRequest) return back()->withErrors('Request not found.');

        DB::transaction(function () use ($status, $stockRequest, $id) {
            
            // Step A: Update Status
            $requestUpdate = [
                'status' => $status,
                'updated_at' => now()
            ];

            // If marked as Paid, also update payment_status
            if ($status === 'paid' && Schema::hasColumn('stock_requests', 'payment_status')) {
                $requestUpdate['payment_status'] = 'paid';
            }

            DB::table('stock_requests')->where('id', $id)->update($requestUpdate);

            // Step B: INVENTORY TRANSFER LOGIC (Triggers when Dispatched or Completed depending on your exact biz flow. I'm tying it to 'Dispatched')
            if ($status === 'dispatched') {
                $items = DB::table('stock_request_items')->where('stock_request_id', $id)->get();

                foreach ($items as $item) {
                    // 1. Reduce from Master Stock (Inventories table)
                    $skuId = DB::table('skus')->where('product_id', $item->product_id)->value('id');
                    if (Schema::hasColumn('inventories', 'product_id')) {
                        DB::table('inventories')->where('product_id', $item->product_id)->decrement('stock_quantity', $item->quantity);
                    } elseif ($skuId) {
                        DB::table('inventories')
                            ->where('sku_id', $skuId)
                            ->whereNull('franchise_id')
                            ->decrement('stock_quantity', $item->quantity);
                    }

                    // 2. Increase in Franchise Inventory
                    $franchiseStock = DB::table('franchise_inventory')
                        ->where('franchise_id', $stockRequest->franchise_id)
                        ->where('product_id', $item->product_id)
                        ->first();

                    if ($franchiseStock) {
                        DB::table('franchise_inventory')->where('id', $franchiseStock->id)->increment($this->franchiseInventoryQuantityColumn(), $item->quantity);
                    } else {
                        $inventoryPayload = [
                            'franchise_id' => $stockRequest->franchise_id,
                            'product_id' => $item->product_id,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ];

                        $inventoryPayload[$this->franchiseInventoryQuantityColumn()] = $item->quantity;

                        if (Schema::hasColumn('franchise_inventory', 'variant_id')) {
                            $inventoryPayload['variant_id'] = null;
                        }

                        if (Schema::hasColumn('franchise_inventory', 'low_stock_threshold')) {
                            $inventoryPayload['low_stock_threshold'] = 5;
                        }

                        DB::table('franchise_inventory')->insert($inventoryPayload);
                    }

                    // 3. Create Transaction Log
                    if (Schema::hasTable('stock_transactions')) {
                        $transactionPayload = [
                            'franchise_id' => $stockRequest->franchise_id,
                            'type' => 'b2b_transfer',
                            'quantity' => $item->quantity,
                            'reason' => 'Franchise Stock Request #' . $id,
                            'created_at' => now(),
                        ];

                        if (Schema::hasColumn('stock_transactions', 'product_id')) {
                            $transactionPayload['product_id'] = $item->product_id;
                        }

                        if (Schema::hasColumn('stock_transactions', 'user_id')) {
                            $transactionPayload['user_id'] = auth()->id();
                        }

                        if (Schema::hasColumn('stock_transactions', 'sku_id') && $skuId) {
                            $transactionPayload['sku_id'] = $skuId;
                        }

                        DB::table('stock_transactions')->insert($transactionPayload);
                    }
                }
            }
        });

        return back()->with('success', 'Stock Request marked as ' . ucfirst($status) . '!');
    }

    private function franchiseInventoryQuantityColumn(): string
    {
        return Schema::hasColumn('franchise_inventory', 'quantity') ? 'quantity' : 'stock_quantity';
    }
}
