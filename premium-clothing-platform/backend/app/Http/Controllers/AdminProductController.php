<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use App\Models\Color;
use App\Models\Size;
use App\Models\Sku;
use App\Models\Inventory;
use App\Models\ProductImage;
use App\Models\StockTransaction;
use Illuminate\Http\Request;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;


class AdminProductController extends Controller
{
    /**
     * Master Catalog page (Inertia)
     */
    public function index(Request $request)
    {
        $filters = $request->only(['search', 'category']);
        $skuColumns = ['id', 'product_id', 'size', 'color'];

        foreach (['code', 'sku_code', 'sku'] as $column) {
            if (Schema::hasColumn('skus', $column)) {
                $skuColumns[] = $column;
            }
        }

        $productsQuery = Product::query()
            ->with([
                'category',
                'skus' => function ($q) use ($skuColumns) {
                    $q->select($skuColumns)->orderBy('id');
                },
                'skus.inventories' => function ($q) {
                    // keep eager load lean
                },
                'images' => function ($q) {
                    $q->orderByDesc('is_primary')->orderBy('sort_order');
                },
            ])
            ->when($filters['search'] ?? null, function ($q, $search) {
                $q->where(function ($qq) use ($search) {
                    $qq->where('name', 'like', "%{$search}%")
                        ->orWhereHas('skus', function ($skuQuery) use ($search) {
                            $skuQuery->where(function ($sub) use ($search) {
                                foreach (['code', 'sku_code', 'sku'] as $column) {
                                    if (Schema::hasColumn('skus', $column)) {
                                        $sub->orWhere($column, 'like', "%{$search}%");
                                    }
                                }
                            });
                        });

                    if (Schema::hasColumn('products', 'sku')) {
                        $qq->orWhere('sku', 'like', "%{$search}%");
                    }

                    if (Schema::hasColumn('products', 'fabric')) {
                        $qq->orWhere('fabric', 'like', "%{$search}%");
                    }
                });
            })
            ->when($filters['category'] ?? null, function ($q, $cat) {
                $q->where('category_id', $cat);
            })
            ->orderByDesc('created_at');

        $perPage = $request->integer('per_page', 12);
        $products = $productsQuery->paginate($perPage)->withQueryString();

        // Build derived fields required by resources/js/Pages/Admin/Products/Index.jsx
        $products->getCollection()->transform(function (Product $product) {
            $product->main_image = optional($product->images->first(fn ($media) => ($media->media_type ?? 'image') === 'image'))->image_path;
            $product->variants = $product->skus;
            $product->sku = $product->sku ?? optional($product->skus->first())->code ?? optional($product->skus->first())->sku_code ?? 'N/A';
            $product->selling_price = (float) ($product->selling_price ?? $product->base_price ?? 0);
            $product->mrp = (float) ($product->mrp ?? $product->selling_price);
            $product->status = ($product->is_active ?? true) ? 'active' : 'inactive';
            $product->is_featured = (bool) ($product->is_featured ?? false);
            $product->is_best_seller = (bool) ($product->is_best_seller ?? false);

            // total_stock = sum of master inventories across all SKUs
            $product->total_stock = $product->skus->sum(function (Sku $sku) {
                return $sku->inventories
                    ->whereNull('franchise_id')
                    ->sum('stock_quantity');
            });

            return $product;
        });

        return inertia('Admin/Products/Index', [
            'products' => $products,
            'categories' => Category::query()->orderBy('name')->get(),
            'brands' => [],
            'filters' => $filters,
        ]);
    }


    public function create()
    {
        $categoriesQuery = Category::query()->where('is_active', true)->orderBy('name');
        if (Schema::hasColumn('categories', 'parent_id')) {
            $categoriesQuery->whereNull('parent_id')->with('children');
        }

        return Inertia::render('Admin/Products/Create', [
            'categories' => $categoriesQuery->get(),
            'brands' => Schema::hasTable('brands')
                ? \App\Models\Brand::select('id', 'name')->get()
                : [],
            'colors' => Schema::hasTable('colors')
                ? Color::where('is_active', true)->orderBy('name')->get()
                : [],
            'sizes' => Schema::hasTable('sizes')
                ? Size::where('is_active', true)
                    ->when(Schema::hasColumn('sizes', 'sort_order'), fn ($q) => $q->orderBy('sort_order'))
                    ->orderBy('name')
                    ->get()
                : [],
        ]);
    }

    public function edit(Product $product)
    {
        $product->load([
            'category',
            'images' => fn ($query) => $query->orderByDesc('is_primary')->orderBy('sort_order'),
            'skus.inventories',
        ]);

        $product->variants = $product->skus->map(function (Sku $sku) {
            return [
                'id' => $sku->id,
                'size' => $sku->size,
                'color' => $sku->color,
                'qty' => (int) $sku->inventories->whereNull('franchise_id')->sum('stock_quantity'),
            ];
        })->values();

        $product->fabric_detail = $product->fabric_detail ?? $product->fabric ?? $product->description;
        $product->d2c_price = $product->base_price;
        $product->b2b_price = $product->franchise_price;
        $product->status = ($product->is_active ?? true) ? 'active' : 'inactive';

        return Inertia::render('Admin/Products/Edit', [
            'product' => $product,
            'categories' => Category::query()
                ->where('is_active', true)
                ->when(Schema::hasColumn('categories', 'parent_id'), fn ($q) => $q->whereNull('parent_id')->with('children'))
                ->orderBy('name')
                ->get(),
            'brands' => Schema::hasTable('brands')
                ? \App\Models\Brand::select('id', 'name')->get()
                : [],
            'colors' => Schema::hasTable('colors')
                ? Color::where('is_active', true)->orderBy('name')->get()
                : [],
            'sizes' => Schema::hasTable('sizes')
                ? Size::where('is_active', true)
                    ->when(Schema::hasColumn('sizes', 'sort_order'), fn ($q) => $q->orderBy('sort_order'))
                    ->orderBy('name')
                    ->get()
                : [],
        ]);
    }

    /**
     * Store new product + SKUs + initial master stock + images.
     */
    public function store(Request $request)
    {
        $brandRule = Schema::hasTable('brands')
            ? ['nullable', 'exists:brands,id']
            : ['nullable'];

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:products,slug'],
            'sku' => ['required', 'string', 'max:255', 'unique:products,sku'],
            'category_id' => ['required', 'exists:categories,id'],
            'brand_id' => $brandRule,
            'custom_brand' => ['nullable', 'string', 'max:255'],
            'gender' => ['nullable', 'in:men,women,unisex'],
            'subcategory_slug' => ['nullable', 'string', 'max:255'],
            'fabric_detail' => ['nullable', 'string'],
            'mrp' => ['required', 'numeric', 'min:0'],
            'd2c_price' => ['required', 'numeric', 'min:0'],
            'b2b_price' => ['required', 'numeric', 'min:0'],
            'description' => ['nullable', 'string'],
            'is_featured' => ['nullable', 'boolean'],
            'is_best_seller' => ['nullable', 'boolean'],
            'show_on_men_page' => ['nullable', 'boolean'],
            'status' => ['nullable', 'in:active,inactive'],
            'images' => ['required', 'array', 'min:1', 'max:5'],
            'images.*' => ['file', 'mimes:jpeg,png,jpg,webp,mp4,webm,mov,qt', 'max:51200'],
            'variants' => ['required', 'array', 'min:1'],
            'variants.*.size' => ['required', 'string', 'max:50'],
            'variants.*.color' => ['required', 'string', 'max:50'],
            'variants.*.color_hex' => ['nullable', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'variants.*.qty' => ['required', 'integer', 'min:0'],
        ]);

        if (empty($validated['brand_id']) && empty($validated['custom_brand'])) {
            return back()->withErrors(['brand_id' => 'Please select a brand or add a custom brand.'])->withInput();
        }

        try {
            DB::transaction(function () use ($request, $validated) {
                $productData = [
                    'name' => $validated['name'],
                    'slug' => $validated['slug'] ?? $this->uniqueProductSlug($validated['name']),
                    'description' => $validated['description'] ?? $validated['fabric_detail'] ?? null,
                    'category_id' => $validated['category_id'],
                    'sku' => $validated['sku'],
                    'mrp' => $validated['mrp'],
                    'base_price' => $validated['d2c_price'],
                    'franchise_price' => $validated['b2b_price'],
                    'is_active' => ($validated['status'] ?? 'active') === 'active',
                ];

                foreach (['gender', 'subcategory_slug', 'show_on_men_page'] as $column) {
                    if (Schema::hasColumn('products', $column)) {
                        $productData[$column] = $validated[$column] ?? ($column === 'show_on_men_page' ? false : null);
                    }
                }

                if (Schema::hasColumn('products', 'is_featured')) {
                    $productData['is_featured'] = $validated['is_featured'] ?? false;
                }

                if (Schema::hasColumn('products', 'is_best_seller')) {
                    $productData['is_best_seller'] = $validated['is_best_seller'] ?? false;
                }

                if (Schema::hasColumn('products', 'brand_id')) {
                    $brandId = $validated['brand_id'] ?? null;
                    if (! $brandId && Schema::hasTable('brands') && ! empty($validated['custom_brand'])) {
                        $brandName = trim($validated['custom_brand']);
                        $brand = \App\Models\Brand::firstOrCreate(
                            ['name' => $brandName],
                            [
                                'slug' => $this->uniqueBrandSlug($brandName),
                                'is_active' => true,
                            ]
                        );
                        $brandId = $brand->id;
                    }
                    $productData['brand_id'] = $brandId;
                }

                if (Schema::hasColumn('products', 'fabric_detail')) {
                    $productData['fabric_detail'] = $validated['fabric_detail'] ?? null;
                } elseif (Schema::hasColumn('products', 'fabric')) {
                    $productData['fabric'] = $validated['fabric_detail'] ?? null;
                }

                $product = Product::create($productData);

                // Images and videos
                foreach ($request->file('images') as $sort => $image) {
                    $mediaType = str_starts_with((string) $image->getMimeType(), 'video/') ? 'video' : 'image';
                    $path = $image->store($mediaType === 'video' ? 'products/videos' : 'products', 'public');

                    $product->images()->create([
                        'image_path' => $path,
                        'media_type' => $mediaType,
                        'is_primary' => $sort === 0 && $mediaType === 'image',
                        'sort_order' => $sort,
                    ]);

                    if ($mediaType === 'image' && ! $product->image_path && Schema::hasColumn('products', 'image_path')) {
                        $product->forceFill(['image_path' => $path])->save();
                    }
                }

                // SKUs (variants) + master stock inventories + stock transaction log
                foreach ($validated['variants'] as $variant) {
                    if (Schema::hasTable('colors') && ! empty($variant['color'])) {
                        Color::updateOrCreate(
                            ['name' => trim($variant['color'])],
                            [
                                'hex_code' => $variant['color_hex'] ?? '#000000',
                                'is_active' => true,
                            ]
                        );
                    }

                    $variantSku = strtoupper($product->sku . '-' . $variant['size'] . '-' . Str::slug($variant['color'], '-'));
                    $skuData = [
                        'size' => $variant['size'],
                        'color' => $variant['color'],
                    ];

                    foreach (['sku_code', 'code', 'sku'] as $column) {
                        if (Schema::hasColumn('skus', $column)) {
                            $skuData[$column] = $variantSku;
                        }
                    }

                    $sku = $product->skus()->create($skuData);

                    // master inventory row
                    $sku->inventory()->create([
                        'stock_quantity' => $variant['qty'],
                        'low_stock_threshold' => 0,
                    ]);

                    StockTransaction::create([
                        'sku_id' => $sku->id,
                        'franchise_id' => null,
                        'transaction_type' => 'in',
                        'quantity' => $variant['qty'],
                        'reason' => 'Initial Product Launch',
                        'performed_by' => optional($request->user())->id,
                    ]);
                }
            });
        } catch (QueryException $e) {
            if (($e->errorInfo[1] ?? null) === 1062) {
                return back()->withErrors([
                    'sku' => 'This SKU or variant combination already exists in the database. Please use a unique SKU.',
                ])->withInput();
            }

            return back()->withErrors([
                'sku' => 'Database Error: ' . $e->getMessage(),
            ])->withInput();
        }

        return redirect()->route('admin.products.index')->with('success', 'Product launched successfully.');
    }

    private function uniqueProductSlug(string $name, ?int $ignoreProductId = null): string
    {
        $baseSlug = Str::slug($name);
        $slug = $baseSlug;
        $counter = 2;

        while (Product::where('slug', $slug)->when($ignoreProductId, fn ($query) => $query->whereKeyNot($ignoreProductId))->exists()) {
            $slug = "{$baseSlug}-{$counter}";
            $counter++;
        }

        return $slug;
    }

    private function uniqueBrandSlug(string $name): string
    {
        $baseSlug = Str::slug($name);
        $slug = $baseSlug;
        $counter = 2;

        while (\App\Models\Brand::where('slug', $slug)->exists()) {
            $slug = "{$baseSlug}-{$counter}";
            $counter++;
        }

        return $slug;
    }

    /**
     * Toggle status for a product (active/inactive)
     */
    public function toggleStatus($id)
    {
        $product = Product::findOrFail($id);
        $product->is_active = !($product->is_active ?? true);
        $product->save();

        return back()->with('success', 'Product status updated.');
    }

    // Keep existing endpoints for API compatibility
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

    public function update(Request $request, Product $product)
    {
        $brandRule = Schema::hasTable('brands')
            ? ['nullable', 'exists:brands,id']
            : ['nullable'];

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:products,slug,' . $product->id],
            'sku' => ['required', 'string', 'max:255', 'unique:products,sku,' . $product->id],
            'category_id' => ['required', 'exists:categories,id'],
            'brand_id' => $brandRule,
            'custom_brand' => ['nullable', 'string', 'max:255'],
            'gender' => ['nullable', 'in:men,women,unisex'],
            'subcategory_slug' => ['nullable', 'string', 'max:255'],
            'fabric_detail' => ['nullable', 'string'],
            'mrp' => ['required', 'numeric', 'min:0'],
            'd2c_price' => ['required', 'numeric', 'min:0'],
            'b2b_price' => ['required', 'numeric', 'min:0'],
            'is_featured' => ['nullable', 'boolean'],
            'is_best_seller' => ['nullable', 'boolean'],
            'show_on_men_page' => ['nullable', 'boolean'],
            'status' => ['nullable', 'in:active,inactive'],
            'images' => ['nullable', 'array', 'max:5'],
            'images.*' => ['file', 'mimes:jpeg,png,jpg,webp,mp4,webm,mov,qt', 'max:51200'],
            'remove_media_ids' => ['nullable', 'array'],
            'remove_media_ids.*' => ['integer', 'exists:product_images,id'],
            'variants' => ['required', 'array', 'min:1'],
            'variants.*.id' => ['nullable', 'integer', 'exists:skus,id'],
            'variants.*.size' => ['required', 'string', 'max:50'],
            'variants.*.color' => ['required', 'string', 'max:50'],
            'variants.*.color_hex' => ['nullable', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'variants.*.qty' => ['required', 'integer', 'min:0'],
        ]);

        if (empty($validated['brand_id']) && empty($validated['custom_brand'])) {
            return back()->withErrors(['brand_id' => 'Please select a brand or add a custom brand.'])->withInput();
        }

        try {
            DB::transaction(function () use ($request, $validated, $product) {
                $productData = [
                    'name' => $validated['name'],
                    'slug' => $validated['slug'] ?? $this->uniqueProductSlug($validated['name'], $product->id),
                    'description' => $validated['fabric_detail'] ?? null,
                    'category_id' => $validated['category_id'],
                    'sku' => $validated['sku'],
                    'mrp' => $validated['mrp'],
                    'base_price' => $validated['d2c_price'],
                    'franchise_price' => $validated['b2b_price'],
                    'is_active' => ($validated['status'] ?? 'active') === 'active',
                ];

                foreach (['gender', 'subcategory_slug', 'show_on_men_page'] as $column) {
                    if (Schema::hasColumn('products', $column)) {
                        $productData[$column] = $validated[$column] ?? ($column === 'show_on_men_page' ? false : null);
                    }
                }

                if (Schema::hasColumn('products', 'is_featured')) {
                    $productData['is_featured'] = $validated['is_featured'] ?? false;
                }

                if (Schema::hasColumn('products', 'is_best_seller')) {
                    $productData['is_best_seller'] = $validated['is_best_seller'] ?? false;
                }

                if (Schema::hasColumn('products', 'brand_id')) {
                    $brandId = $validated['brand_id'] ?? null;
                    if (! $brandId && Schema::hasTable('brands') && ! empty($validated['custom_brand'])) {
                        $brandName = trim($validated['custom_brand']);
                        $brand = \App\Models\Brand::firstOrCreate(
                            ['name' => $brandName],
                            [
                                'slug' => $this->uniqueBrandSlug($brandName),
                                'is_active' => true,
                            ]
                        );
                        $brandId = $brand->id;
                    }
                    $productData['brand_id'] = $brandId;
                }

                if (Schema::hasColumn('products', 'fabric_detail')) {
                    $productData['fabric_detail'] = $validated['fabric_detail'] ?? null;
                } elseif (Schema::hasColumn('products', 'fabric')) {
                    $productData['fabric'] = $validated['fabric_detail'] ?? null;
                }

                $product->update($productData);

                if (! empty($validated['remove_media_ids'])) {
                    $mediaToDelete = $product->images()->whereIn('id', $validated['remove_media_ids'])->get();
                    foreach ($mediaToDelete as $media) {
                        Storage::disk('public')->delete($media->image_path);
                        $media->delete();
                    }
                }

                if ($request->hasFile('images')) {
                    $existingImageCount = $product->images()->count();

                    foreach ($request->file('images') as $index => $image) {
                        $sort = $existingImageCount + $index;
                        $mediaType = str_starts_with((string) $image->getMimeType(), 'video/') ? 'video' : 'image';
                        $path = $image->store($mediaType === 'video' ? 'products/videos' : 'products', 'public');

                        $product->images()->create([
                            'image_path' => $path,
                            'media_type' => $mediaType,
                            'is_primary' => $sort === 0 && $mediaType === 'image',
                            'sort_order' => $sort,
                        ]);

                        if ($mediaType === 'image' && ! $product->image_path && Schema::hasColumn('products', 'image_path')) {
                            $product->forceFill(['image_path' => $path])->save();
                        }
                    }
                }

                if (Schema::hasColumn('products', 'image_path')) {
                    $coverImage = $product->images()
                        ->where(fn ($query) => $query->where('media_type', 'image')->orWhereNull('media_type'))
                        ->orderByDesc('is_primary')
                        ->orderBy('sort_order')
                        ->first();

                    $product->forceFill(['image_path' => $coverImage?->image_path])->save();
                }

                $keptSkuIds = collect($validated['variants'])->pluck('id')->filter()->map(fn ($id) => (int) $id);
                $product->skus()->whereNotIn('id', $keptSkuIds)->delete();

                foreach ($validated['variants'] as $variant) {
                    if (Schema::hasTable('colors') && ! empty($variant['color'])) {
                        Color::updateOrCreate(
                            ['name' => trim($variant['color'])],
                            [
                                'hex_code' => $variant['color_hex'] ?? '#000000',
                                'is_active' => true,
                            ]
                        );
                    }

                    $sku = isset($variant['id'])
                        ? $product->skus()->whereKey($variant['id'])->first()
                        : null;

                    $variantSku = strtoupper($product->sku . '-' . $variant['size'] . '-' . Str::slug($variant['color'], '-'));
                    $skuData = [
                        'size' => $variant['size'],
                        'color' => $variant['color'],
                    ];

                    foreach (['sku_code', 'code', 'sku'] as $column) {
                        if (Schema::hasColumn('skus', $column)) {
                            $skuData[$column] = $variantSku;
                        }
                    }

                    $sku = $sku
                        ? tap($sku)->update($skuData)
                        : $product->skus()->create($skuData);

                    $sku->inventory()->updateOrCreate(
                        ['franchise_id' => null],
                        [
                            'stock_quantity' => $variant['qty'],
                            'low_stock_threshold' => 0,
                        ]
                    );
                }
            });
        } catch (QueryException $e) {
            if (($e->errorInfo[1] ?? null) === 1062) {
                return back()->withErrors([
                    'sku' => 'This SKU or variant combination already exists in the database. Please use a unique SKU.',
                ])->withInput();
            }

            return back()->withErrors([
                'sku' => 'Database Error: ' . $e->getMessage(),
            ])->withInput();
        }

        return redirect()->route('admin.products.index')->with('success', 'Product updated successfully.');
    }

    public function destroy(Product $product)
    {
        $product->delete();

        return response()->json([
            'success' => true,
            'message' => 'Product deleted successfully',
        ]);
    }

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
 
