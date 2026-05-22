<?php

namespace App\Http\Controllers\Franchise;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class InventoryController extends Controller
{
    public function index(Request $request)
    {
        $franchiseId = Auth::id();
        $filter = $request->input('filter', 'all');
        $search = $request->input('search', '');

        $inventory = DB::table('franchise_inventory')
            ->join('products', 'franchise_inventory.product_id', '=', 'products.id')
            ->leftJoin('product_variants', 'franchise_inventory.variant_id', '=', 'product_variants.id')
            ->where('franchise_inventory.franchise_id', $franchiseId)
            ->select(
                'franchise_inventory.*', 
                'products.name as product_name', 
                'products.sku as master_sku',
                'product_variants.size', 
                'product_variants.color',
                'product_variants.sku as variant_sku'
            )
            ->when($search, function ($query, $search) {
                $query->where('products.name', 'like', "%{$search}%")
                      ->orWhere('product_variants.sku', 'like', "%{$search}%");
            })
            ->when($filter === 'low', function ($query) {
                $query->whereRaw('franchise_inventory.quantity <= franchise_inventory.low_stock_threshold');
            })
            ->orderBy('franchise_inventory.quantity', 'asc')
            ->paginate(15)
            ->withQueryString();

        $stats = [
            'total_available' => DB::table('franchise_inventory')->where('franchise_id', $franchiseId)->sum('quantity'),
            'total_sold' => DB::table('franchise_inventory')->where('franchise_id', $franchiseId)->sum('sold_quantity'),
            'total_damaged' => DB::table('franchise_inventory')->where('franchise_id', $franchiseId)->sum('damaged_quantity'),
            'low_stock_items' => DB::table('franchise_inventory')->where('franchise_id', $franchiseId)->whereRaw('quantity <= low_stock_threshold')->count(),
        ];

        return Inertia::render('Franchise/Inventory', [
            'inventory' => $inventory,
            'stats' => $stats,
            'filters' => ['search' => $search, 'filter' => $filter]
        ]);
    }

    // 🚀 Mark Stock as Damaged
    public function markDamaged(Request $request, $inventoryId)
    {
        $validated = $request->validate([
            'quantity' => 'required|integer|min:1',
            'notes' => 'nullable|string|max:255'
        ]);

        $franchiseId = Auth::id();
        $inv = DB::table('franchise_inventory')->where('id', $inventoryId)->where('franchise_id', $franchiseId)->first();

        if (!$inv || $inv->quantity < $validated['quantity']) {
            return back()->withErrors('Invalid quantity or unauthorized action.');
        }

        DB::transaction(function () use ($inv, $validated, $franchiseId) {
            // 1. Update Inventory Table
            DB::table('franchise_inventory')->where('id', $inv->id)->update([
                'quantity' => $inv->quantity - $validated['quantity'],
                'damaged_quantity' => $inv->damaged_quantity + $validated['quantity'],
                'updated_at' => now()
            ]);

            // 2. Log in Audit Trail
            DB::table('franchise_stock_transactions')->insert([
                'franchise_id' => $franchiseId,
                'product_id' => $inv->product_id,
                'variant_id' => $inv->variant_id,
                'type' => 'Damaged',
                'quantity' => -$validated['quantity'],
                'notes' => $validated['notes'] ?? 'Marked as damaged by franchise',
                'created_at' => now(),
                'updated_at' => now()
            ]);
        });

        return back()->with('success', 'Stock marked as damaged successfully.');
    }
}