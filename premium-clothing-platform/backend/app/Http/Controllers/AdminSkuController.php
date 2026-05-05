<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Sku;
use Illuminate\Http\Request;

class AdminSkuController extends Controller
{
    /**
     * Get all SKUs for a product.
     */
    public function index(Product $product)
    {
        $skus = $product->skus()->with('inventory')->get();

        return response()->json([
            'success' => true,
            'data' => $skus,
        ]);
    }

    /**
     * Create a new SKU.
     */
    public function store(Request $request, Product $product)
    {
        $validated = $request->validate([
            'sku_code' => ['required', 'string', 'unique:skus'],
            'size' => ['required', 'string', 'max:50'],
            'color' => ['required', 'string', 'max:100'],
            'stock_quantity' => ['required', 'integer', 'min:0'],
        ]);

        $sku = $product->skus()->create([
            'sku_code' => $validated['sku_code'],
            'size' => $validated['size'],
            'color' => $validated['color'],
        ]);

        // Create inventory record
        $sku->inventory()->create([
            'stock_quantity' => $validated['stock_quantity'],
            'reorder_level' => 10,
        ]);

        $sku->load('inventory');

        return response()->json([
            'success' => true,
            'message' => 'SKU created successfully',
            'data' => $sku,
        ], 201);
    }

    /**
     * Update a SKU.
     */
    public function update(Request $request, Product $product, Sku $sku)
    {
        // Verify SKU belongs to product
        if ($sku->product_id !== $product->id) {
            return response()->json([
                'success' => false,
                'message' => 'SKU not found',
            ], 404);
        }

        $validated = $request->validate([
            'sku_code' => ['string', 'unique:skus,sku_code,' . $sku->id],
            'size' => ['string', 'max:50'],
            'color' => ['string', 'max:100'],
            'stock_quantity' => ['integer', 'min:0'],
        ]);

        $sku->update($validated);

        // Update inventory if stock_quantity provided
        if (isset($validated['stock_quantity'])) {
            $sku->inventory()->update([
                'stock_quantity' => $validated['stock_quantity'],
            ]);
        }

        $sku->load('inventory');

        return response()->json([
            'success' => true,
            'message' => 'SKU updated successfully',
            'data' => $sku,
        ]);
    }

    /**
     * Delete a SKU.
     */
    public function destroy(Product $product, Sku $sku)
    {
        if ($sku->product_id !== $product->id) {
            return response()->json([
                'success' => false,
                'message' => 'SKU not found',
            ], 404);
        }

        $sku->delete();

        return response()->json([
            'success' => true,
            'message' => 'SKU deleted successfully',
        ]);
    }
}
