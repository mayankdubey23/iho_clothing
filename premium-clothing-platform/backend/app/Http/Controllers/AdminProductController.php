<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use App\Models\Sku;
use App\Models\Inventory;
use App\Models\ProductImage;
use App\Models\StockTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
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
            $product->main_image = optional($product->images->first())->image_path;
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
        return Inertia::render('Admin/Products/Create', [
            'categories' => \App\Models\Category::select('id', 'name')->get(),
            'brands' => Schema::hasTable('brands')
                ? \App\Models\Brand::select('id', 'name')->get()
                : [],
        ]);
    }

    /**
     * Store new product + SKUs + initial master stock + images
     * Expected payload (similar to your pasted controller):
     * - name, category_id, sku (base), mrp, selling_price, franchise_price, description?, fabric?, is_featured?, is_best_seller?, status?
     * - images.*
     * - variants: [{ size, color, stock }]
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:products,slug'],
            'category_id' => ['required', 'exists:categories,id'],
            'sku' => ['required', 'string', 'max:255', 'unique:products,sku'],
            'mrp' => ['required', 'numeric', 'min:0'],
            'selling_price' => ['required', 'numeric', 'min:0'],
            'franchise_price' => ['required', 'numeric', 'min:0'],
            'description' => ['nullable', 'string'],
            'fabric' => ['nullable', 'string'],
            'is_featured' => ['nullable', 'boolean'],
            'is_best_seller' => ['nullable', 'boolean'],
            'status' => ['nullable', 'in:active,inactive'],
            'images.*' => ['image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
            'variants' => ['required', 'array'],
            'variants.*.size' => ['required', 'string', 'max:50'],
            'variants.*.color' => ['required', 'string', 'max:50'],
            'variants.*.stock' => ['required', 'numeric', 'min:0'],
        ]);

        DB::transaction(function () use ($request, $validated) {
            $product = Product::create([
                'name' => $validated['name'],
                'slug' => $validated['slug'] ?? Str::slug($validated['name']) . '-' . Str::random(6),
                'description' => $validated['description'] ?? null,
                'category_id' => $validated['category_id'],
                'sku' => $validated['sku'],
                'mrp' => $validated['mrp'],
                // repo uses base_price; frontend expects selling_price
                'base_price' => $validated['selling_price'],
                'franchise_price' => $validated['franchise_price'],
                'fabric' => $validated['fabric'] ?? null,
                'is_featured' => $validated['is_featured'] ?? false,
                'is_best_seller' => $validated['is_best_seller'] ?? false,
                'is_active' => ($validated['status'] ?? 'active') === 'active',
            ]);

            // Images
            if ($request->hasFile('images')) {
                $sort = 0;
                foreach ($request->file('images') as $image) {
                    $path = $image->store('products', 'public');
                    $product->images()->create([
                        'image_path' => $path,
                        'is_primary' => $sort === 0,
                        'sort_order' => $sort,
                    ]);
                    $sort++;
                }
            }

            // SKUs (variants) + master stock inventories + stock transaction log
            foreach ($validated['variants'] as $variant) {
                $variantSku = $product->sku . '-' . $variant['size'] . '-' . $variant['color'];

                $sku = $product->skus()->create([
                    'size' => $variant['size'],
                    'color' => $variant['color'],
                    'sku' => $variantSku,
                ]);

                // master inventory row
                $inventory = $sku->inventory()->create([
                    'stock_quantity' => $variant['stock'],
                    'low_stock_threshold' => 0,
                ]);

                StockTransaction::create([
                    'sku_id' => $sku->id,
                    'franchise_id' => null,
                    'transaction_type' => 'add',
                    'quantity' => $variant['stock'],
                    'reason' => 'Initial Product Launch',
                    'performed_by' => optional($request->user())->id,
                ]);
            }
        });

        return redirect()->route('admin.products')->with('success', 'Product launched successfully!');
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
 
