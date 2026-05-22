<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Inertia\Inertia;
use Illuminate\Http\Request;

class StorefrontController extends Controller
{
    public function index(Request $request)
    {
        // Fetch only active products with their primary images
        $products = Product::with(['images' => function ($query) {
                $query->orderBy('sort_order')->orderByDesc('is_primary');
            }])
            ->where('is_active', true)
            ->latest()
            ->paginate(12);

        // Render the Storefront Collection Page
        return Inertia::render('Storefront/Shop', [
            'products' => $products,
        ]);
    }
}