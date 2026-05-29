<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\FeaturedCategoryItem;
use App\Models\Product;
use App\Models\Review;
use App\Models\StorefrontSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class StorefrontController extends Controller
{
    public function index()
    {
        $cms = $this->storefrontSettings();

        $categories = Category::where('is_active', true)
            ->orderBy('name')
            ->get()
            ->map(fn (Category $category) => $this->formatCategory($category));

        $featuredCategories = $this->featuredCategories($categories);

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

        $bestSellersQuery = Product::with([
                'category',
                'skus',
                'images' => fn ($query) => $query->orderByDesc('is_primary')->orderBy('sort_order'),
            ])
            ->where('is_active', true);

        if (Schema::hasColumn('products', 'is_best_seller')) {
            $bestSellersQuery->where('is_best_seller', true);
        }

        if (Schema::hasColumn('products', 'sales_count')) {
            $bestSellersQuery->orderByDesc('sales_count');
        } else {
            $bestSellersQuery->latest();
        }

        $bestSellers = $bestSellersQuery
            ->take(12)
            ->get()
            ->map(fn (Product $product) => $this->formatStorefrontProduct($product));

        $gymProducts = $this->gymProducts();

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

        $offers = Schema::hasTable('store_offers')
            ? DB::table('store_offers')->where('is_active', 1)->latest()->take(8)->get()
            : collect();

        $testimonials = $this->storefrontReviews();

        return Inertia::render('Storefront', [
            'categories' => $categories,
            'featuredCategories' => $featuredCategories,
            'newArrivals' => $newArrivals,
            'bestSellers' => $bestSellers,
            'gymProducts' => $gymProducts,
            'allProducts' => $allProducts,
            'offers' => $offers,
            'testimonials' => $testimonials,
            'cms' => $cms,
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
        $sellingPrice = $product->discount_price ?: ($product->d2c_price ?? $product->base_price);
        $mrp = $product->mrp ?? null;

        return [
            'id' => $product->id,
            'name' => $product->name,
            'slug' => $product->slug,
            'description' => $product->description,
            'base_price' => $product->base_price,
            'selling_price' => $sellingPrice,
            'mrp' => $mrp,
            'discount_price' => $product->discount_price ?? null,
            'rating' => $product->rating ?? null,
            'sales' => $product->sales_count ?? null,
            'gender' => $product->gender ?? null,
            'is_featured' => (bool) ($product->is_featured ?? false),
            'is_best_seller' => (bool) ($product->is_best_seller ?? false),
            'category' => $product->category->name ?? 'Uncategorized',
            'category_name' => $product->category->name ?? 'Uncategorized',
            'category_slug' => $product->category->slug ?? null,
            'image' => $imagePath ? asset('storage/' . ltrim($imagePath, '/')) : null,
            'image_alt' => $product->name,
            'is_available' => $this->productIsAvailable($product),
            'available_sizes' => $product->skus->pluck('size')->filter()->unique()->values(),
            'available_colors' => $product->skus->pluck('color')->filter()->unique()->values(),
            'skus' => $product->skus,
            'images' => $product->images->map(fn ($image) => [
                'id' => $image->id,
                'image_path' => asset('storage/' . ltrim($image->image_path, '/')),
                'media_type' => $image->media_type ?? 'image',
                'is_primary' => (bool) $image->is_primary,
            ])->values(),
        ];
    }

    private function storefrontSettings(): array
    {
        if (! Schema::hasTable('storefront_settings')) {
            return [];
        }

        return StorefrontSetting::query()
            ->pluck('value', 'key')
            ->map(fn ($value) => is_string($value) ? trim($value) : $value)
            ->toArray();
    }

    private function featuredCategories($activeCategories)
    {
        if (Schema::hasTable('featured_category_items')) {
            return FeaturedCategoryItem::active()
                ->get()
                ->map(fn (FeaturedCategoryItem $item) => [
                    'id' => $item->id,
                    'name' => $item->name,
                    'slug' => $item->slug,
                    'image' => $item->image_path ? asset('storage/' . ltrim($item->image_path, '/')) : null,
                    'image_alt' => $item->name,
                    'sort_order' => $item->sort_order,
                ])
                ->values();
        }

        return $activeCategories->take(8)->values();
    }

    private function formatCategory(Category $category): array
    {
        $imagePath = $category->image ?? $category->image_path ?? null;

        return [
            'id' => $category->id,
            'name' => $category->name,
            'slug' => $category->slug,
            'description' => $category->description,
            'image' => $imagePath ? asset('storage/' . ltrim($imagePath, '/')) : null,
            'image_alt' => $category->name,
        ];
    }

    private function gymProducts()
    {
        return Product::with([
                'category',
                'skus',
                'images' => fn ($query) => $query->orderByDesc('is_primary')->orderBy('sort_order'),
            ])
            ->where('is_active', true)
            ->where(function ($query) {
                $query->whereHas('category', function ($categoryQuery) {
                    $categoryQuery
                        ->where('slug', 'like', '%gym%')
                        ->orWhere('name', 'like', '%gym%')
                        ->orWhere('slug', 'like', '%training%')
                        ->orWhere('name', 'like', '%training%');
                });

                if (Schema::hasColumn('products', 'subcategory_slug')) {
                    $query->orWhere('subcategory_slug', 'like', '%gym%')
                        ->orWhere('subcategory_slug', 'like', '%training%');
                }
            })
            ->latest()
            ->take(12)
            ->get()
            ->map(fn (Product $product) => $this->formatStorefrontProduct($product));
    }

    private function productIsAvailable(Product $product): bool
    {
        if ($product->skus->isEmpty()) {
            return true;
        }

        return $product->skus->contains(function ($sku) {
            if (isset($sku->is_active) && ! $sku->is_active) {
                return false;
            }

            return ! isset($sku->stock_quantity) || (int) $sku->stock_quantity > 0;
        });
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
