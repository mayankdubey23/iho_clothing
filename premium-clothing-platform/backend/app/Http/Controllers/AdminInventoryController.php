<?php

namespace App\Http\Controllers;

use App\Models\Inventory;
use App\Models\Sku;
use App\Models\User;
use App\Models\StockTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AdminInventoryController extends Controller
{
    /**
     * 1. GLOBAL STOCK OVERVIEW (Super Admin sees everything)
     */
    public function index(Request $request)
    {
        // Get all SKUs with Master Stock and Total Franchise Stock
        $skus = Sku::with(['product', 'inventory' => function($query) {
            $query->whereNull('franchise_id'); // Master Stock
        }])->withSum('inventories as total_franchise_stock', 'stock_quantity')
          ->paginate(20);

        if ($request->wantsJson() || !$request->hasHeader('X-Inertia')) {
        return response()->json([
            'skus' => $skus
        ]);
        }

        return Inertia::render('Admin/Inventory/Index', [
            'skus' => $skus
        ]);
    }

    /**
     * 2. ADD NEW STOCK TO MASTER WAREHOUSE
     */
    public function addMasterStock(Request $request)
    {
        $request->validate([
            'sku_id' => 'required|exists:skus,id',
            'quantity' => 'required|integer|min:1',
            'reason' => 'required|string|max:255' // e.g., "Received from Manufacturer"
        ]);

        try {
            DB::beginTransaction();

            $inventory = Inventory::firstOrCreate(
                ['sku_id' => $request->sku_id, 'franchise_id' => null],
                ['stock_quantity' => 0]
            );

            $inventory->increment('stock_quantity', $request->quantity);

            // Maintain Ledger
            StockTransaction::create([
                'sku_id' => $request->sku_id,
                'franchise_id' => null,
                'transaction_type' => 'in',
                'quantity' => $request->quantity,
                'reason' => $request->reason,
                'performed_by' => auth()->id()
            ]);

            DB::commit();
            return back()->with('success', 'Master Stock updated successfully!');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to add stock.']);
        }
    }

    /**
     * 3. X-RAY VISION: SEE A SPECIFIC FRANCHISE'S STOCK
     */
    public function viewFranchiseStock($franchise_id)
    {
        $franchise = User::where('role', 'franchise')->findOrFail($franchise_id);
        
        $stock = Inventory::with('sku.product')
                    ->where('franchise_id', $franchise_id)
                    ->paginate(20);

        return Inertia::render('Admin/Inventory/FranchiseStock', [
            'franchise' => $franchise,
            'stock' => $stock
        ]);
    }
    

    /**
     * 4. VIEW FULL LEDGER (History of movements)
     */
    public function stockHistory(Request $request)
{
    $history = StockTransaction::with(['sku.product', 'franchise', 'performer'])
                    ->latest()
                    ->paginate(50);

    // 🎯 Force JSON for Postman
    if ($request->wantsJson() || $request->header('X-Requested-With') === 'XMLHttpRequest') {
        return response()->json($history);
    }

    return Inertia::render('Admin/Inventory/History', [
        'history' => $history
    ]);
    }

}