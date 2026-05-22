<?php

namespace App\Http\Controllers\Franchise;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class CatalogController extends Controller
{
    public function index(Request $request)
    {
        $franchiseId = Auth::id(); // 🛡️ STRICT ISOLATION
        $search = $request->input('search', '');

        // Fetch ONLY products assigned to this franchise, joining master product data & local inventory
        $products = DB::table('franchise_products')
            ->join('products', 'franchise_products.product_id', '=', 'products.id')
            ->leftJoin('categories', 'products.category_id', '=', 'categories.id')
            ->leftJoin('franchise_inventory', function($join) use ($franchiseId) {
                $join->on('franchise_products.product_id', '=', 'franchise_inventory.product_id')
                     ->where('franchise_inventory.franchise_id', '=', $franchiseId);
            })
            ->where('franchise_products.franchise_id', $franchiseId)
            ->select(
                'franchise_products.id as mapping_id',
                'franchise_products.local_selling_price',
                'franchise_products.is_active_locally',
                'products.id as master_product_id',
                'products.name',
                DB::raw("COALESCE((SELECT sku_code FROM skus WHERE skus.product_id = products.id ORDER BY id ASC LIMIT 1), products.slug) as sku"),
                DB::raw('COALESCE(products.mrp, products.base_price) as mrp'),
                'products.franchise_price as b2b_price', // What franchise pays to Super Admin
                DB::raw("(SELECT image_path FROM product_images WHERE product_images.product_id = products.id ORDER BY is_primary DESC, sort_order ASC, id ASC LIMIT 1) as master_image"),
                'categories.name as category_name',
                DB::raw('COALESCE(franchise_inventory.quantity, 0) as available_stock')
            )
            ->when($search, function ($query, $search) {
                $query->where(function ($subQuery) use ($search) {
                    $subQuery->where('products.name', 'like', "%{$search}%")
                        ->orWhere('products.slug', 'like', "%{$search}%")
                        ->orWhereExists(function ($skuQuery) use ($search) {
                            $skuQuery->select(DB::raw(1))
                                ->from('skus')
                                ->whereColumn('skus.product_id', 'products.id')
                                ->where('skus.sku_code', 'like', "%{$search}%");
                        });
                });
            })
            ->orderBy('products.name', 'asc')
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Franchise/Catalog', [
            'products' => $products,
            'filters' => ['search' => $search]
        ]);
    }

    // 🚀 Update Local Store Price
    public function updatePrice(Request $request, $mappingId)
    {
        $validated = $request->validate([
            'local_selling_price' => 'required|numeric|min:0'
        ]);

        // Security Check: Ensure this mapping belongs to the logged-in franchise
        $mapping = DB::table('franchise_products')
            ->where('id', $mappingId)
            ->where('franchise_id', Auth::id())
            ->first();

        if (!$mapping) abort(403, 'Unauthorized');

        DB::table('franchise_products')->where('id', $mappingId)->update([
            'local_selling_price' => $validated['local_selling_price'],
            'updated_at' => now()
        ]);

        return back()->with('success', 'Local selling price updated successfully!');
    }

    // 🚀 Toggle Local Visibility
    public function toggleVisibility($mappingId)
    {
        $mapping = DB::table('franchise_products')
            ->where('id', $mappingId)
            ->where('franchise_id', Auth::id())
            ->first();

        if (!$mapping) abort(403, 'Unauthorized');

        DB::table('franchise_products')->where('id', $mappingId)->update([
            'is_active_locally' => !$mapping->is_active_locally,
            'updated_at' => now()
        ]);

        return back()->with('success', 'Product visibility toggled for your store.');
    }
}
