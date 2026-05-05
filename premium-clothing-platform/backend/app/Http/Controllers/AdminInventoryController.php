<?php

namespace App\Http\Controllers;

use App\Models\Inventory;
use App\Models\Product;
use App\Models\Sku;
use Illuminate\Http\Request;

class AdminInventoryController extends Controller
{
    /**
     * Get inventory for a SKU.
     */
    public function show(Sku $sku)
    {
        $inventory = $sku->inventory;

        return response()->json([
            'success' => true,
            'data' => $inventory,
        ]);
    }

    /**
     * Update inventory stock quantity.
     */
    public function updateStock(Request $request, Sku $sku)
    {
        $validated = $request->validate([
            'stock_quantity' => ['required', 'integer', 'min:0'],
            'reorder_level' => ['integer', 'min:0'],
        ]);

        $inventory = $sku->inventory();

        if (!$inventory->exists()) {
            $inventory->create([
                'stock_quantity' => $validated['stock_quantity'],
                'reorder_level' => $validated['reorder_level'] ?? 10,
            ]);
        } else {
            $inventory->update($validated);
        }

        return response()->json([
            'success' => true,
            'message' => 'Inventory updated successfully',
            'data' => $inventory->first(),
        ]);
    }

    /**
     * Get inventory status for all products.
     */
    public function status(Request $request)
    {
        $lowStock = $request->boolean('low_stock', false);

        $query = Sku::with(['product', 'inventory'])
            ->whereHas('inventory');

        if ($lowStock) {
            $query->whereHas('inventory', function ($q) {
                $q->whereColumn('stock_quantity', '<=', 'reorder_level');
            });
        }

        $skus = $query->get();

        return response()->json([
            'success' => true,
            'data' => $skus,
        ]);
    }
}
