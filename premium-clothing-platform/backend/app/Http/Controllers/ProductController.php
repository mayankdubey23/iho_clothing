<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Sku;
use App\Models\Inventory;
use App\Models\Color;
use App\Models\Size;
use App\Models\Brand;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $validated = $request->validate([
            'category' => ['nullable', 'string', 'max:255'],
            'gender' => ['nullable', 'string', 'max:50'],
            'subcategory' => ['nullable', 'string', 'max:255'],
            'featured' => ['nullable'],
            'sort' => ['nullable', 'string', 'max:50'],
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
            ->when(Schema::hasColumn('products', 'is_active'), fn ($query) => $query->where(fn ($activeQuery) => $activeQuery->where('is_active', true)->orWhereNull('is_active')))
            ->when($validated['category'] ?? null, function ($query, $category) {
                $query->whereHas('category', fn ($categoryQuery) => $categoryQuery->where('slug', $category));
            })
            ->when($validated['gender'] ?? null, function ($query, $gender) {
                $query->where(function ($genderQuery) use ($gender) {
                    if (Schema::hasColumn('products', 'gender')) {
                        $genderQuery->where('gender', $gender);
                    }

                    $genderQuery->orWhereHas('category', fn ($categoryQuery) => $categoryQuery
                        ->where('slug', 'like', "%{$gender}%")
                        ->orWhere('name', 'like', "%{$gender}%"));
                });
            })
            ->when($validated['subcategory'] ?? null, function ($query, $subcategory) {
                $query->where(function ($subQuery) use ($subcategory) {
                    if (Schema::hasColumn('products', 'subcategory_slug')) {
                        $subQuery->where('subcategory_slug', $subcategory);
                    }

                    $readable = str_replace('-', ' ', $subcategory);
                    $subQuery->orWhereHas('category', fn ($categoryQuery) => $categoryQuery
                        ->where('slug', 'like', "%{$subcategory}%")
                        ->orWhere('name', 'like', "%{$readable}%"));
                });
            })
            ->when(($validated['featured'] ?? null) && Schema::hasColumn('products', 'is_featured'), function ($query) {
                $query->where('is_featured', true);
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
            ->when(($validated['sort'] ?? null) === 'price_asc', fn ($query) => $query->orderBy('base_price'))
            ->when(($validated['sort'] ?? null) === 'price_desc', fn ($query) => $query->orderByDesc('base_price'))
            ->when(($validated['sort'] ?? null) === 'popular' && Schema::hasColumn('products', 'is_best_seller'), fn ($query) => $query->orderByDesc('is_best_seller'))
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
        return \Inertia\Inertia::render('Admin/Products/Create', [
            'categories' => Category::whereNull('parent_id')->get(),
            'brands' => Brand::where('is_active', true)->get(),
            'colors' => Color::where('is_active', true)->get(),
            'sizes' => Size::where('is_active', true)->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $user = $request->user();
        abort_unless($user && $user->role === 'super_admin', 403, 'This action is unauthorized.');

        // 1. Inputs Validate Karein (Image optional hai)
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'mrp' => 'required|numeric',
            'slug' => 'required|string|unique:products,slug',
            'category_id' => 'required|exists:categories,id',
            'base_price' => 'required|numeric',
            'franchise_price' => 'required|numeric',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048' // Real image validation
        ]);

        try {
            DB::beginTransaction();

            // 2. Product Create Karein
            $product = Product::create([
                'name' => $validated['name'],
                'slug' => $validated['slug'],
                'category_id' => $validated['category_id'],
                'base_price' => $validated['base_price'],
                'franchise_price' => $validated['franchise_price'],
                'description' => $validated['description'] ?? '',
                'is_active' => $validated['is_active'] ?? true,
            ]);

            // 3. Image File Upload Logic
            if ($request->hasFile('image')) {
                // Image ko 'storage/app/public/products' mein save karega
                $imagePath = $request->file('image')->store('products', 'public');
                
                $product->images()->create([
                    'image_path' => '/storage/' . $imagePath,
                    'is_primary' => true,
                    'sort_order' => 1
                ]);
            }

            // 4. 🤖 AUTO-SKU ENGINE: Automatically 4 sizes generate karein
            $defaultSizes = ['S', 'M', 'L', 'XL'];
            
            foreach ($defaultSizes as $size) {
                $sku = Sku::create([
                    'product_id' => $product->id,
                    'code' => strtoupper($validated['slug']) . '-' . $size, // Example: TSHIRT-BLACK-XL
                    'size' => $size,
                    'price_adjustment' => 0
                ]);

                // Har naye size ka initial stock 0 set karke Main Warehouse ko assign karein
                Inventory::create([
                    'sku_id' => $sku->id,
                    'franchise_id' => null, 
                    'stock_quantity' => 0
                ]);
            }

            DB::commit();
            return back()->with('success', 'Product with Auto-Sizes & Image created successfully!');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to create product: ' . $e->getMessage()]);
        }
    }

    /**
     * Display the specified resource for frontend and API.
     */
    public function show($slug)
    {
        $product = Product::with([
            'images' => fn ($query) => $query->orderBy('sort_order'),
            'skus' => fn ($query) => $query
                ->when(Schema::hasColumn('skus', 'is_active'), fn ($skuQuery) => $skuQuery->where('is_active', true))
                ->with('inventories'),
            'brand',
            'category',
            'reviews' => fn ($query) => $query->where('is_approved', true)->latest(),
        ])
            ->where('slug', $slug)
            ->when(Schema::hasColumn('products', 'is_active'), fn ($query) => $query->where(fn ($activeQuery) => $activeQuery->where('is_active', true)->orWhereNull('is_active')))
            ->firstOrFail();

        $availableSizes = $product->skus
            ->pluck('size')
            ->filter()
            ->unique()
            ->values();

        $availableColors = $product->skus
            ->pluck('color')
            ->filter()
            ->unique()
            ->values();

        $productData = $product->toArray();
        $productData['available_sizes'] = $availableSizes->map(fn ($size) => ['id' => $size, 'code' => $size]);
        $productData['available_colors'] = $availableColors->map(fn ($color) => ['id' => $color, 'name' => $color]);
        $productData['image_path'] = $this->normalizeStoragePath($product->images->firstWhere('is_primary', true)->image_path ?? $product->image_path);
        $productData['price'] = $product->base_price;
        $productData['compare_at_price'] = $product->mrp;
        $productData['stock'] = (int) $product->skus->sum(function ($sku) {
            return $sku->inventories
                ->whereNull('franchise_id')
                ->sum('stock_quantity');
        });
        $productData['in_stock'] = $productData['stock'] > 0;
        $productData['images'] = $product->images->map(fn ($image) => [
            'id' => $image->id,
            'image_path' => $this->normalizeStoragePath($image->image_path),
            'media_type' => $image->media_type ?? 'image',
            'is_primary' => (bool) $image->is_primary,
        ])->values();

        $reviewCount = $product->reviews->count();
        $avgRating = $reviewCount > 0 ? round($product->reviews->avg('rating'), 1) : 0;
        $ratingBreakdown = collect([5, 4, 3, 2, 1])->mapWithKeys(function ($rating) use ($product) {
            return [$rating => $product->reviews->where('rating', $rating)->count()];
        });
        $reviewInsights = [
            ['label' => 'Fit', 'value' => 'Just Right', 'percent' => 77],
            ['label' => 'Length', 'value' => 'Just Right', 'percent' => 82],
        ];
        $currentUser = auth()->user();
        $canReview = $currentUser
            ? $this->customerHasPurchasedProduct((int) $currentUser->id, (int) $product->id)
            : false;
        $reviewEligibilityMessage = $currentUser
            ? ($canReview ? 'Verified purchase. You can write a review.' : 'Only customers who bought this product can write a review.')
            : 'Please login after purchase to write a review.';

        if (request()->expectsJson() || request()->is('api/*')) {
            return response()->json([
                'success' => true,
                'data' => $productData,
            ]);
        }

        $relatedProducts = Product::with([
                'skus.inventories',
                'images' => fn ($query) => $query->orderBy('sort_order')->orderByDesc('is_primary'),
            ])
            ->where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->when(Schema::hasColumn('products', 'is_active'), fn ($query) => $query->where(fn ($activeQuery) => $activeQuery->where('is_active', true)->orWhereNull('is_active')))
            ->inRandomOrder()
            ->take(4)
            ->get()
            ->map(function ($relatedProduct) {
                $imagePath = $relatedProduct->images->firstWhere('is_primary', true)->image_path ?? $relatedProduct->image_path;
                $stock = (int) $relatedProduct->skus->sum(function ($sku) {
                    return $sku->inventories
                        ->whereNull('franchise_id')
                        ->sum('stock_quantity');
                });
                $relatedData = $relatedProduct->toArray();
                $relatedData['image_path'] = $this->normalizeStoragePath($imagePath);
                $relatedData['price'] = $relatedProduct->base_price;
                $relatedData['compare_at_price'] = $relatedProduct->mrp;
                $relatedData['stock'] = $stock;
                $relatedData['in_stock'] = $stock > 0;
                return $relatedData;
            });

        return \Inertia\Inertia::render('Storefront/ProductDetail', [
            'product' => $productData,
            'availableSizes' => $availableSizes,
            'availableColors' => $availableColors,
            'relatedProducts' => $relatedProducts,
            'reviewCount' => $reviewCount,
            'avgRating' => $avgRating,
            'ratingBreakdown' => $ratingBreakdown,
            'reviewInsights' => $reviewInsights,
            'canReview' => $canReview,
            'reviewEligibilityMessage' => $reviewEligibilityMessage,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($id)
    {
        $product = Product::with(['skus.inventory', 'images'])->findOrFail($id);

        return \Inertia\Inertia::render('Admin/EditProduct', [
            'product' => $product,
            'categories' => Category::whereNull('parent_id')->get(),
            'brands' => Brand::where('is_active', true)->get(),
            'colors' => Color::where('is_active', true)->get(),
            'sizes' => Size::where('is_active', true)->get(),
        ]);
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

    private function normalizeStoragePath(?string $path): ?string
    {
        if (! $path) {
            return null;
        }

        return preg_replace('#^/?storage/#', '', ltrim($path, '/'));
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
