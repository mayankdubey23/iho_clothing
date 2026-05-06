<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use Inertia\Inertia;
use Illuminate\Http\Request;

class StorefrontController extends Controller
{
    public function index()
    {
        // Active Categories fetch karo
        $categories = Category::where('is_active', true)->get();

        // Active Products aur unki category + SKUs fetch karo
        $products = Product::with(['category', 'skus'])
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

        // Data ko Inertia ke zariye React page par bhej do
        return Inertia::render('Storefront', [
            'categories' => $categories,
            'products' => $products
        ]);
    }
}