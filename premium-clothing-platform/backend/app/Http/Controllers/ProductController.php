<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $validated = $request->validate([
            'category' => ['nullable', 'string', 'max:255'],
            'size' => ['nullable', 'string', 'max:50'],
            'color' => ['nullable', 'string', 'max:100'],
            'search' => ['nullable', 'string', 'max:255'],
            'min_price' => ['nullable', 'numeric', 'min:0'],
            'max_price' => ['nullable', 'numeric', 'min:0'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:50'],
        ]);

        $perPage = max(1, min($request->integer('per_page', 12), 50));

        $products = Product::query()
            ->with([
                'category',
                'skus.inventory',
                'images' => fn ($query) => $query->orderByDesc('is_primary')->orderBy('sort_order'),
            ])
            ->where('is_active', true)
            ->when($validated['category'] ?? null, function ($query, $category) {
                $query->whereHas('category', fn ($categoryQuery) => $categoryQuery->where('slug', $category));
            })
            ->when($validated['size'] ?? null, function ($query, $size) {
                $query->whereHas('skus', fn ($skuQuery) => $skuQuery->where('size', $size));
            })
            ->when($validated['color'] ?? null, function ($query, $color) {
                $query->whereHas('skus', fn ($skuQuery) => $skuQuery->where('color', $color));
            })
            ->when($validated['search'] ?? null, function ($query, $search) {
                $query->where(function ($searchQuery) use ($search) {
                    $searchQuery
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            })
            ->when($validated['min_price'] ?? null, function ($query, $minPrice) {
                $query->where('base_price', '>=', $minPrice);
            })
            ->when($validated['max_price'] ?? null, function ($query, $maxPrice) {
                $query->where('base_price', '<=', $maxPrice);
            })
            ->latest()
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $products,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Product $product)
    {
        abort_unless($product->is_active, 404);

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
     * Show the form for editing the specified resource.
     */
    public function edit(Product $product)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Product $product)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product)
    {
        //
    }
}
