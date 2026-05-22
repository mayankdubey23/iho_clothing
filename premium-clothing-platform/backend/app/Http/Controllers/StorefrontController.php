<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Models\Review;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class StorefrontController extends Controller
{
    public function index()
    {
        // 1. Fetch Categories
        $categories = Category::where('is_active', true)->get();

        // 2. Fetch New Arrivals
        $newArrivals = Product::with([
                'category',
                'skus',
                'images' => fn ($query) => $query->orderByDesc('is_primary')->orderBy('sort_order'),
            ])
            ->where('is_active', true)
            ->latest()
            ->take(12)
            ->get()
            ->map(fn (Product $product) => $this->formatStorefrontProduct($product));

        // 3. Fetch Best Sellers (Top 8 by sales_count when that column exists)
        $bestSellersQuery = Product::with([
                'category',
                'skus',
                'images' => fn ($query) => $query->orderByDesc('is_primary')->orderBy('sort_order'),
            ])
            ->where('is_active', true);

        if (Schema::hasColumn('products', 'sales_count')) {
            $bestSellersQuery->orderByDesc('sales_count');
        } elseif (Schema::hasColumn('products', 'is_best_seller')) {
            $bestSellersQuery->orderByDesc('is_best_seller')->latest();
        } else {
            $bestSellersQuery->latest();
        }

        $bestSellers = $bestSellersQuery
            ->take(12)
            ->get()
            ->map(fn (Product $product) => $this->formatStorefrontProduct($product));

        $allProducts = Product::with([
                'category',
                'skus',
                'images' => fn ($query) => $query->orderByDesc('is_primary')->orderBy('sort_order'),
            ])
            ->where('is_active', true)
            ->latest()
            ->take(24)
            ->get()
            ->map(fn (Product $product) => $this->formatStorefrontProduct($product));

        // Fetch active offers
        $offers = DB::table('store_offers')->where('is_active', 1)->get();
        $testimonials = $this->storefrontReviews();

        // Pass everything to React
        return Inertia::render('Storefront', [
            'categories' => $categories,
            'newArrivals' => $newArrivals,
            'bestSellers' => $bestSellers,
            'allProducts' => $allProducts,
            'offers' => $offers,
            'testimonials' => $testimonials,
        ]);
    }

    public function storeReview(Request $request, Product $product)
    {
        $user = $request->user();

        if (! $user) {
            return redirect()->route('login')->with('error', 'Please login to write a review.');
        }

        if (! $this->customerHasPurchasedProduct((int) $user->id, (int) $product->id)) {
            return back()->withErrors([
                'review' => 'Only customers who bought this product can write a review.',
            ]);
        }

        $validated = $request->validate([
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'comment' => ['required', 'string', 'min:5', 'max:1000'],
            'customer_name' => ['nullable', 'string', 'max:255'],
        ]);

        Review::updateOrCreate(
            [
                'product_id' => $product->id,
                'user_id' => $user->id,
            ],
            [
                'customer_name' => $user->name ?: ($validated['customer_name'] ?? 'Customer'),
                'rating' => $validated['rating'],
                'comment' => $validated['comment'],
                'is_approved' => true,
            ]
        );

        return back()->with('success', 'Review submitted successfully.');
    }

    private function formatStorefrontProduct(Product $product): array
    {
        $imagePath = $product->image_path ?: optional($product->images->first(fn ($media) => ($media->media_type ?? 'image') === 'image'))->image_path;

        return [
            'id' => $product->id,
            'name' => $product->name,
            'slug' => $product->slug,
            'description' => $product->description,
            'base_price' => $product->base_price,
            'discount_price' => $product->discount_price ?? null,
            'rating' => $product->rating ?? null,
            'sales' => $product->sales_count ?? null,
            'category' => $product->category->name ?? 'Uncategorized',
            'category_name' => $product->category->name ?? 'Uncategorized',
            'image' => $imagePath ? asset('storage/' . ltrim($imagePath, '/')) : null,
            'skus' => $product->skus,
            'images' => $product->images->map(fn ($image) => [
                'id' => $image->id,
                'image_path' => asset('storage/' . ltrim($image->image_path, '/')),
                'media_type' => $image->media_type ?? 'image',
                'is_primary' => (bool) $image->is_primary,
            ])->values(),
        ];
    }

    private function storefrontReviews()
    {
        $reviews = collect();

        if (Schema::hasTable('reviews')) {
            $reviews = DB::table('reviews')
                ->leftJoin('products', 'reviews.product_id', '=', 'products.id')
                ->when(Schema::hasColumn('reviews', 'is_approved'), fn ($query) => $query->where('reviews.is_approved', true))
                ->select(
                    'reviews.id',
                    'reviews.customer_name',
                    'reviews.rating',
                    'reviews.comment as text',
                    'products.name as product'
                )
                ->latest('reviews.created_at')
                ->take(10)
                ->get();
        }

        if ($reviews->isNotEmpty()) {
            return $reviews;
        }

        if (! Schema::hasTable('testimonials')) {
            return collect();
        }

        return DB::table('testimonials')
            ->where('status', 'active')
            ->latest()
            ->take(10)
            ->get()
            ->map(function ($review) {
                $review->text = $review->review_text ?? $review->review ?? '';
                $review->product = $review->product_purchased ?? 'Verified Purchase';
                return $review;
            });
    }

    private function customerHasPurchasedProduct(int $userId, int $productId): bool
    {
        if (! Schema::hasTable('orders') || ! Schema::hasTable('order_items')) {
            return false;
        }

        if (! Schema::hasColumn('orders', 'user_id') || ! Schema::hasColumn('order_items', 'product_id')) {
            return false;
        }

        return DB::table('orders')
            ->join('order_items', 'orders.id', '=', 'order_items.order_id')
            ->where('orders.user_id', $userId)
            ->where('order_items.product_id', $productId)
            ->when(Schema::hasColumn('orders', 'status'), function ($query) {
                $query->whereNotIn(DB::raw('LOWER(orders.status)'), ['cancelled', 'canceled']);
            })
            ->exists();
    }
}
