<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class StorefrontController extends Controller
{
    public function index()
    {
        // Cache Active Categories for 60 minutes (3600 seconds)
        $categories = Cache::remember('storefront_active_categories', 3600, function () {
            return Category::where('is_active', true)->get();
        });

        // Cache Active Products (with eager loaded relationships) for 60 minutes
        $products = Cache::remember('storefront_active_products', 3600, function () {
            return Product::with(['category', 'skus'])
                ->where('is_active', true)
                ->get()
                ->map(function ($product) {
                    return [
                        'id' => $product->id,
                        'name' => $product->name,
                        'slug' => $product->slug,
                        'description' => $product->description,
                        'base_price' => $product->base_price,
                        'category_name' => $product->category->name ?? 'Uncategorized',
                        // Dummy high-quality image lagayi hai jab tak aap real images upload na karein
                        'image' => 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop'
                    ];
                });
        });

        // Data ko Inertia ke zariye React page par bhej do
        return Inertia::render('Storefront', [
            'categories' => $categories,
            'products' => $products
        ]);
    }
}