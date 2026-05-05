<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;

class AdminProductController extends Controller
{
    /**
     * Get all products (admin view with all details).
     */
    public function index(Request $request)
    {
        $perPage = $request->integer('per_page', 15);

        $products = Product::with([
            'category',
            'skus.inventory',
            'images' => fn ($query) => $query->orderByDesc('is_primary')->orderBy('sort_order'),
        ])
        ->latest()
        ->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $products,
        ]);
    }

    /**
     * Create a new product.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:products'],
            'description' => ['nullable', 'string'],
            'category_id' => ['required', 'exists:categories,id'],
            'base_price' => ['required', 'numeric', 'min:0'],
            'franchise_price' => ['required', 'numeric', 'min:0'],
            'is_active' => ['boolean'],
        ]);

        $product = Product::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Product created successfully',
            'data' => $product,
        ], 201);
    }

    /**
     * Get product details.
     */
    public function show(Product $product)
    {
        $product->load([
            'category',
            'skus.inventory',
            'images' => fn ($query) => $query->orderByDesc('is_primary')->orderBy('sort_order'),
        ]);

        return response()->json([
            'success' => true,
            'data' => $product,
        ]);
    }

    /**
     * Update a product.
     */
    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name' => ['string', 'max:255'],
            'slug' => ['string', 'max:255', 'unique:products,slug,' . $product->id],
            'description' => ['nullable', 'string'],
            'category_id' => ['exists:categories,id'],
            'base_price' => ['numeric', 'min:0'],
            'franchise_price' => ['numeric', 'min:0'],
            'is_active' => ['boolean'],
        ]);

        $product->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Product updated successfully',
            'data' => $product,
        ]);
    }

    /**
     * Delete a product.
     */
    public function destroy(Product $product)
    {
        $product->delete();

        return response()->json([
            'success' => true,
            'message' => 'Product deleted successfully',
        ]);
    }

    /**
     * Bulk update product status.
     */
    public function bulkUpdateStatus(Request $request)
    {
        $validated = $request->validate([
            'product_ids' => ['required', 'array'],
            'product_ids.*' => ['exists:products,id'],
            'is_active' => ['required', 'boolean'],
        ]);

        Product::whereIn('id', $validated['product_ids'])->update([
            'is_active' => $validated['is_active'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Products updated successfully',
        ]);
    }
}
