<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\FeaturedCategoryItem;
use App\Models\Product;
use App\Models\Review;
use App\Models\StorefrontBanner;
use App\Models\StorefrontSetting;
use App\Models\FranchisePlan; // Added this import
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class StorefrontController extends Controller
{
    // ========================================================
    // 🏠 HOMEPAGE LOGIC
    // ========================================================
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

        $offers = $this->activePublicOffers(8);

        $banners = Schema::hasTable('storefront_banners')
            ? StorefrontBanner::where('is_active', true)->orderBy('sort_order')->latest()->get()->map(fn (StorefrontBanner $banner) => [
                'id' => $banner->id,
                'title' => $banner->title,
                'placement_type' => $banner->placement_type,
                'desktop_image' => asset('storage/' . ltrim($banner->desktop_image_path, '/')),
                'mobile_image' => asset('storage/' . ltrim($banner->mobile_image_path, '/')),
                'target_url' => $banner->target_url ?: '/shop',
            ])->values()
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
            'banners' => $banners,
            'testimonials' => $testimonials,
            'cms' => $cms,
        ]);
    }

    // ========================================================
    // 🛍️ MAIN SHOP PAGE & FILTERS LOGIC
    // ========================================================
    public function shop(Request $request)
    {
        $filters = $request->validate([
            'category' => ['nullable', 'string'],
            'gender' => ['nullable', 'string'],
            'subcategory' => ['nullable', 'string'],
            'search' => ['nullable', 'string', 'max:255'],
            'size' => ['nullable', 'string'],
            'color' => ['nullable', 'string'],
            'brand' => ['nullable', 'string'],
            'discount' => ['nullable', 'integer', 'min:0', 'max:100'],
            'min_price' => ['nullable', 'numeric', 'min:0'],
            'max_price' => ['nullable', 'numeric', 'min:0'],
            'sort' => ['nullable', 'string'],
        ]);

        $genderAliases = [
            'men' => ['men', 'male', 'man', 'mens', "men's"],
            'male' => ['men', 'male', 'man', 'mens', "men's"],
            'women' => ['women', 'female', 'woman', 'womens', "women's"],
            'female' => ['women', 'female', 'woman', 'womens', "women's"],
            'unisex' => ['unisex', 'all', 'neutral', 'all-gender', 'all gender'],
        ];

        $selectedGender = strtolower(trim((string) ($filters['gender'] ?? '')));
        $genderTerms = $genderAliases[$selectedGender] ?? ($selectedGender ? [$selectedGender] : []);
        $productGenderTerms = $genderTerms;

        if (in_array($selectedGender, ['men', 'male', 'women', 'female'], true)) {
            $productGenderTerms = array_values(array_unique(array_merge($productGenderTerms, $genderAliases['unisex'])));
        }

        $products = Product::query()
            ->with(['category', 'skus.inventory', 'images' => fn ($q) => $q->orderByDesc('is_primary')])
            ->when(Schema::hasColumn('products', 'is_active'), fn ($q) => $q->where(fn ($query) => $query->where('is_active', true)->orWhereNull('is_active')))
            ->when(($filters['category'] ?? null), function ($q, $slug) {
                $category = Category::where('slug', $slug)->first();

                if (! $category) {
                    $q->whereHas('category', fn ($categoryQuery) => $categoryQuery->where('slug', $slug));
                    return;
                }

                $categoryIds = collect([$category->id]);
                if (Schema::hasColumn('categories', 'parent_id')) {
                    $categoryIds = $categoryIds->merge(Category::where('parent_id', $category->id)->pluck('id'));
                }

                $q->whereIn('category_id', $categoryIds->unique()->values());
            })
            ->when(($filters['gender'] ?? null), function ($q) use ($genderTerms, $productGenderTerms) {
                if (Schema::hasColumn('products', 'gender')) {
                    $q->whereIn(DB::raw('LOWER(TRIM(products.gender))'), $productGenderTerms);
                    return;
                }

                $q->whereHas('category', function ($category) use ($genderTerms) {
                    foreach ($genderTerms as $term) {
                        $category->orWhere('slug', 'like', "%{$term}%")
                            ->orWhere('name', 'like', "%{$term}%");
                    }
                });
            })
            ->when(($filters['subcategory'] ?? null), function ($q, $subcategory) {
                $q->where(function ($query) use ($subcategory) {
                    if (Schema::hasColumn('products', 'subcategory_slug')) {
                        $query->where('subcategory_slug', $subcategory);
                    }

                    $readable = str_replace('-', ' ', $subcategory);
                    $query->orWhereHas('category', fn ($category) => $category
                        ->where('slug', 'like', "%{$subcategory}%")
                        ->orWhere('name', 'like', "%{$readable}%"));
                });
            })
            ->when(($filters['search'] ?? null), fn ($q, $search) => $q->where('name', 'like', "%{$search}%"))
            ->when(($filters['size'] ?? null), fn ($q, $size) => $q->whereHas('skus', fn ($sku) => $sku->where('size', $size)))
            ->when(($filters['color'] ?? null), fn ($q, $color) => $q->whereHas('skus', fn ($sku) => $sku->where('color', $color)))
            ->when(($filters['brand'] ?? null) && Schema::hasColumn('products', 'brand_id') && Schema::hasTable('brands'), function ($q, $brand) {
                $q->whereHas('brand', fn ($brandQuery) => $brandQuery->where('slug', $brand)->orWhere('name', $brand));
            })
            ->when(($filters['discount'] ?? null) && Schema::hasColumn('products', 'mrp'), function ($q, $discount) {
                $q->whereNotNull('mrp')
                    ->whereColumn('mrp', '>', 'base_price')
                    ->whereRaw('((mrp - base_price) / mrp) * 100 >= ?', [(int) $discount]);
            })
            ->when(($filters['min_price'] ?? null), fn ($q, $price) => $q->where('base_price', '>=', $price))
            ->when(($filters['max_price'] ?? null), fn ($q, $price) => $q->where('base_price', '<=', $price))
            ->when(($filters['sort'] ?? null) === 'price_asc', fn ($q) => $q->orderBy('base_price'))
            ->when(($filters['sort'] ?? null) === 'price_desc', fn ($q) => $q->orderByDesc('base_price'))
            ->when(($filters['sort'] ?? null) === 'popular' && Schema::hasColumn('products', 'is_best_seller'), fn ($q) => $q->orderByDesc('is_best_seller'))
            ->latest()
            ->paginate(12)
            ->withQueryString();

        $products->getCollection()->transform(function (Product $product) {
            $imagePath = $product->image_path ?: optional($product->images->first())->image_path;
            $stock = (int) $product->skus->sum(function ($sku) {
                return $sku->inventories
                    ->whereNull('franchise_id')
                    ->sum('stock_quantity');
            });

            $product->image_path = $imagePath ? preg_replace('#^/?storage/#', '', ltrim($imagePath, '/')) : null;
            $product->price = $product->base_price;
            $product->compare_at_price = $product->mrp;
            $product->stock = $stock;
            $product->in_stock = $stock > 0;
            $product->available_sizes = $product->skus->pluck('size')->filter()->unique()->values()->map(fn ($size) => ['id' => $size, 'code' => $size]);
            $product->available_colors = $product->skus->pluck('color')->filter()->unique()->values()->map(fn ($color) => ['id' => $color, 'name' => $color]);

            return $product;
        });

        $pageContent = Schema::hasTable('pages') ? DB::table('pages')->where('slug', 'shop')->first() : null;
        $cmsSettings = Schema::hasTable('storefront_settings') ? StorefrontSetting::pluck('value', 'key')->toArray() : [];
        $categories = Category::query()
            ->where('is_active', true)
            ->when(Schema::hasColumn('categories', 'parent_id'), function ($query) {
                $query->whereNull('parent_id')
                    ->with(['children' => fn ($children) => $children->where('is_active', true)->orderBy('name')]);
            })
            ->orderBy('name')
            ->get();
            
        $colors = Schema::hasTable('colors') ? DB::table('colors')->where('is_active', 1)->orderBy('name')->get() : collect();
        $sizes = Schema::hasTable('sizes') ? DB::table('sizes')->where('is_active', 1)->orderBy('name')->get() : collect();
        $brands = Schema::hasTable('brands') ? DB::table('brands')->where('is_active', 1)->orderBy('name')->get() : collect();

        return Inertia::render('Shop', [
            'filters' => $filters,
            'products' => $products,
            'categories' => $categories,
            'brands' => $brands,
            'colors' => $colors,
            'sizes' => $sizes,
            'pageContent' => $pageContent,
            'cms' => $cmsSettings,
        ]);
    }

    public function offers()
    {
        return Inertia::render('Offers', [
            'offers' => $this->activePublicOffers(),
            'cms' => $this->storefrontSettings(),
        ]);
    }

    // ========================================================
    // 🏋️‍♂️ SPORTS WEAR CUSTOM PAGE LOGIC
    // ========================================================
    public function sportsWear()
    {
        $products = Product::query()
            ->with(['category', 'skus.inventories', 'images' => fn ($q) => $q->orderByDesc('is_primary')->orderBy('sort_order')])
            ->where('is_active', true)
            ->whereHas('category', function ($query) {
                $query->where('slug', 'like', '%sport%')
                    ->orWhere('name', 'like', '%sport%');
            })
            ->latest()
            ->take(8)
            ->get();

        if ($products->isEmpty()) {
            $products = Product::query()
                ->with(['category', 'skus.inventory', 'images' => fn ($q) => $q->orderByDesc('is_primary')])
                ->where('is_active', true)
                ->latest()
                ->take(8)
                ->get();
        }

        return Inertia::render('SportsWear', [
            'products' => $products,
            'categories' => Category::where('is_active', true)->orderBy('name')->get(),
            'plans' => Schema::hasTable('franchise_plans') ? FranchisePlan::orderBy('price')->get() : collect(),
        ]);
    }

    // ========================================================
    // 📝 REVIEWS & HELPER FUNCTIONS
    // ========================================================
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

    private function activeStoreOffers(?int $limit = null)
    {
        if (! Schema::hasTable('store_offers')) {
            return collect();
        }

        $query = DB::table('store_offers')
            ->when(Schema::hasColumn('store_offers', 'is_active'), fn ($offers) => $offers->where('is_active', 1))
            ->latest();

        if ($limit) {
            $query->take($limit);
        }

        return $query->get()->map(function ($offer) {
            $offer->offer_code = $offer->offer_code ?? $offer->code ?? null;
            $offer->code = $offer->code ?? $offer->offer_code ?? null;
            $offer->source = 'store_offer';
            return $offer;
        });
    }

    private function activePublicOffers(?int $limit = null)
    {
        $offers = $this->activeStoreOffers()
            ->merge($this->activeCoupons())
            ->sortByDesc(fn ($offer) => $offer->created_at ?? $offer->updated_at ?? null)
            ->values();

        return $limit ? $offers->take($limit)->values() : $offers;
    }

    private function activeCoupons()
    {
        if (! Schema::hasTable('coupons')) {
            return collect();
        }

        $query = DB::table('coupons');

        if (Schema::hasColumn('coupons', 'status')) {
            $query->where('status', 'active');
        } elseif (Schema::hasColumn('coupons', 'is_active')) {
            $query->where('is_active', true);
        }

        if (Schema::hasColumn('coupons', 'target_audience')) {
            $query->whereIn('target_audience', ['all', 'b2c_customers']);
        }

        $expiryColumn = Schema::hasColumn('coupons', 'expiry_date')
            ? 'expiry_date'
            : (Schema::hasColumn('coupons', 'expires_at') ? 'expires_at' : null);

        if ($expiryColumn) {
            $query->where(function ($expiry) use ($expiryColumn) {
                $expiry->whereNull($expiryColumn)->orWhere($expiryColumn, '>=', now());
            });
        }

        if (Schema::hasColumn('coupons', 'created_at')) {
            $query->latest('created_at');
        }

        return $query->get()->map(function ($coupon) {
            $type = $coupon->type ?? 'percentage';
            $value = $coupon->value ?? null;
            $minOrder = $coupon->min_order_value ?? $coupon->min_cart_amount ?? 0;
            $maxDiscount = $coupon->max_discount_amount ?? null;

            if ($type === 'free_shipping') {
                $title = 'Free Shipping';
            } elseif ($type === 'flat') {
                $title = 'Flat Rs ' . number_format((float) $value, 0) . ' Off';
            } else {
                $title = number_format((float) $value, 0) . '% Off';
            }

            $details = [];
            if ((float) $minOrder > 0) {
                $details[] = 'Min order Rs ' . number_format((float) $minOrder, 0);
            }
            if ((float) $maxDiscount > 0 && $type === 'percentage') {
                $details[] = 'Up to Rs ' . number_format((float) $maxDiscount, 0);
            }

            return (object) [
                'id' => 'coupon-' . $coupon->id,
                'title' => $title,
                'subtitle' => implode(' | ', $details),
                'code' => $coupon->code,
                'offer_code' => $coupon->code,
                'source' => 'coupon',
                'created_at' => $coupon->created_at ?? null,
                'updated_at' => $coupon->updated_at ?? null,
            ];
        });
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
