<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Sku;
use App\Models\Inventory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

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

    public function franchiseCatalog()
    {
        abort_unless(in_array(auth()->user()->role, ['admin', 'franchise', 'franchise_admin']), 403);

        return Inertia::render('Franchise/BuyStock', [
            'products' => Product::with(['category', 'skus.inventory'])
                ->where('is_active', true)
                ->latest()
                ->get(),
        ]);
    }
}
