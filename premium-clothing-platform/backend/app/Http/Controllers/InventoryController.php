<?php

namespace App\Http\Controllers;

use App\Models\Inventory;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

class InventoryController extends Controller
{
    public function index(Request $request)
    {
        $inventory = Inventory::with(['sku.product.category'])
            ->whereNull('franchise_id')
            ->when($request->search, function ($query, $search) {
                $query->whereHas('sku', function ($skuQuery) use ($search) {
                    $skuQuery->where('sku_code', 'like', "%{$search}%")
                        ->orWhereHas('product', fn ($productQuery) => $productQuery->where('name', 'like', "%{$search}%"));
                });
            })
            ->when($request->status, function ($query, $status) {
                if ($status === 'low') {
                    $query->where('stock_quantity', '<=', 10)->where('stock_quantity', '>', 0);
                }

                if ($status === 'out') {
                    $query->where('stock_quantity', 0);
                }
            })
            ->orderBy('stock_quantity')
            ->paginate(15)
            ->withQueryString()
            ->through(function (Inventory $item) {
                $sku = $item->sku;
                $product = $sku?->product;

                return [
                    'id' => $item->id,
                    'name' => $product?->name ?? 'Deleted Product',
                    'category' => $product?->category,
                    'sku' => $sku?->sku_code ?? 'N/A',
                    'stock_quantity' => (int) $item->stock_quantity,
                    'damaged_quantity' => (int) ($item->damaged_quantity ?? 0),
                    'image' => $product?->image_path ? asset('storage/' . ltrim($product->image_path, '/')) : null,
                ];
            });

        $stats = [
            'total_items' => Product::count(),
            'total_stock' => Inventory::whereNull('franchise_id')->sum('stock_quantity') ?? 0,
            'low_stock' => Inventory::whereNull('franchise_id')->where('stock_quantity', '<=', 10)->count() ?? 0,
            'damaged_stock' => Schema::hasColumn('inventories', 'damaged_quantity') ? Inventory::whereNull('franchise_id')->sum('damaged_quantity') : 0,
        ];

        $franchises = User::whereIn('role', ['franchise', 'franchise_owner', 'franchise_admin'])
            ->when(Schema::hasColumn('users', 'status'), fn ($query) => $query->where('status', 'active'))
            ->select('id', 'name', 'city')
            ->get();

        return Inertia::render('Admin/MasterStock', [
            'inventory' => $inventory,
            'franchises' => $franchises,
            'filters' => $request->only(['search', 'status']),
            'stats' => $stats,
        ]);
    }

    public function adjustStock(Request $request, $inventory_id)
    {
        $request->validate([
            'type' => 'required|in:add,reduce,damaged',
            'quantity' => 'required|integer|min:1',
            'reason' => 'nullable|string',
        ]);

        $stock = Inventory::whereNull('franchise_id')->findOrFail($inventory_id);

        DB::transaction(function () use ($request, $stock) {
            if ($request->type === 'add') {
                $stock->stock_quantity += $request->quantity;
            } elseif ($request->type === 'damaged') {
                $stock->stock_quantity = max(0, $stock->stock_quantity - $request->quantity);
                if (Schema::hasColumn('inventories', 'damaged_quantity')) {
                    $stock->damaged_quantity = (int) ($stock->damaged_quantity ?? 0) + (int) $request->quantity;
                }
            } else {
                $stock->stock_quantity = max(0, $stock->stock_quantity - $request->quantity);
            }

            $stock->save();

            DB::table('stock_transactions')->insert([
                'sku_id' => $stock->sku_id,
                'franchise_id' => null,
                'transaction_type' => $request->type === 'add' ? 'in' : 'out',
                'quantity' => $request->quantity,
                'reason' => $request->reason ?? ucfirst($request->type) . ' stock adjustment',
                'performed_by' => auth()->id(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        });

        return back()->with('success', 'Stock updated successfully!');
    }

    public function transferStock(Request $request, $inventory_id)
    {
        $request->validate([
            'franchise_id' => 'required|exists:users,id',
            'quantity' => 'required|integer|min:1',
        ]);

        $masterStock = Inventory::whereNull('franchise_id')->findOrFail($inventory_id);

        if ($masterStock->stock_quantity < $request->quantity) {
            return back()->withErrors(['quantity' => 'Not enough master stock available!']);
        }

        DB::transaction(function () use ($request, $masterStock) {
            $masterStock->decrement('stock_quantity', $request->quantity);

            $franchiseStock = Inventory::firstOrCreate(
                ['sku_id' => $masterStock->sku_id, 'franchise_id' => $request->franchise_id],
                ['stock_quantity' => 0]
            );
            $franchiseStock->increment('stock_quantity', $request->quantity);

            $productId = DB::table('skus')->where('id', $masterStock->sku_id)->value('product_id');
            if ($productId && Schema::hasTable('franchise_inventory')) {
                $quantityColumn = Schema::hasColumn('franchise_inventory', 'quantity') ? 'quantity' : 'stock_quantity';
                $existing = DB::table('franchise_inventory')
                    ->where('franchise_id', $request->franchise_id)
                    ->where('product_id', $productId)
                    ->first();

                if ($existing) {
                    DB::table('franchise_inventory')->where('id', $existing->id)->increment($quantityColumn, $request->quantity);
                    if (Schema::hasColumn('franchise_inventory', 'received_quantity')) {
                        DB::table('franchise_inventory')->where('id', $existing->id)->increment('received_quantity', $request->quantity);
                    }
                } else {
                    $payload = [
                        'franchise_id' => $request->franchise_id,
                        'product_id' => $productId,
                        $quantityColumn => $request->quantity,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];

                    foreach (['low_stock_threshold' => 5, 'received_quantity' => $request->quantity, 'sold_quantity' => 0, 'returned_quantity' => 0, 'damaged_quantity' => 0] as $column => $value) {
                        if (Schema::hasColumn('franchise_inventory', $column)) {
                            $payload[$column] = $value;
                        }
                    }

                    if (Schema::hasColumn('franchise_inventory', 'variant_id')) {
                        $payload['variant_id'] = null;
                    }

                    DB::table('franchise_inventory')->insert($payload);
                }
            }

            DB::table('stock_transactions')->insert([
                'sku_id' => $masterStock->sku_id,
                'franchise_id' => null,
                'transaction_type' => 'out',
                'quantity' => $request->quantity,
                'reason' => 'Transfer to Franchise',
                'performed_by' => auth()->id(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::table('stock_transactions')->insert([
                'sku_id' => $masterStock->sku_id,
                'franchise_id' => $request->franchise_id,
                'transaction_type' => 'in',
                'quantity' => $request->quantity,
                'reason' => 'Received from Master Warehouse',
                'performed_by' => auth()->id(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        });

        return back()->with('success', 'Stock transferred to franchise successfully!');
    }
}
