<?php

namespace App\Http\Controllers;

use App\Models\StockRequest;
use App\Models\Inventory;
use App\Models\Sku;
use App\Models\StockTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class StockController extends Controller
{
    // 👑 SUPER ADMIN: View all requests
    public function index()
    {
        return Inertia::render('Admin/StockRequests', [
            'requests' => StockRequest::with(['franchise', 'sku.product'])->latest()->get()
        ]);
    }

    // 🏢 FRANCHISE: View their own requests
    public function myRequests()
    {
        return Inertia::render('Franchise/StockRequests', [
            'requests' => StockRequest::with('sku.product')->where('franchise_id', auth()->id())->latest()->get()
        ]);
    }

    // 🏢 FRANCHISE: Request new stock
    public function store(Request $request)
    {
    $request->validate([
        'sku_id' => 'required|exists:skus,id',
        'quantity' => 'required|integer|min:1'
    ]);

    // Total amount nikalne ke liye product price fetch karein
    $sku = Sku::with('product')->findOrFail($request->sku_id);
    $totalAmount = $sku->product->franchise_price * $request->quantity;

    StockRequest::create([
        'franchise_id' => auth()->id(),
        'sku_id' => $request->sku_id,
        'quantity' => $request->quantity,
        'total_amount' => $totalAmount,
        'status' => 'pending'
    ]);

    return response()->json(['message' => 'Stock request sent successfully!']);
    }

    // 👑 SUPER ADMIN: Approve Stock & Update Ledger + Wallet
    public function approve(Request $request, $id)
    {
        $stockRequest = StockRequest::findOrFail($id);

        if ($stockRequest->status !== 'pending') {
            return back()->withErrors(['error' => 'This request is already processed.']);
        }

        try {
            DB::beginTransaction();

            // 1. Check Master Inventory
            $masterInventory = Inventory::where('sku_id', $stockRequest->sku_id)
                                        ->whereNull('franchise_id')
                                        ->lockForUpdate()
                                        ->first();

            if (!$masterInventory || $masterInventory->stock_quantity < $stockRequest->quantity) {
                throw new \Exception('Not enough master stock to approve this request.');
            }

            // 2. Transfer Stock
            $masterInventory->decrement('stock_quantity', $stockRequest->quantity);
            
            $franchiseInventory = Inventory::firstOrCreate(
                ['sku_id' => $stockRequest->sku_id, 'franchise_id' => $stockRequest->franchise_id],
                ['stock_quantity' => 0]
            );
            $franchiseInventory->increment('stock_quantity', $stockRequest->quantity);

            // 3. 📝 LEDGER ENTRIES (Transaction Tracking)
            StockTransaction::insert([
                [
                    'sku_id' => $stockRequest->sku_id,
                    'franchise_id' => null, // Master Godown
                    'transaction_type' => 'out',
                    'quantity' => $stockRequest->quantity,
                    'reason' => 'Approved transfer to Franchise #' . $stockRequest->franchise_id,
                    'performed_by' => auth()->id(),
                    'created_at' => now(), 'updated_at' => now()
                ],
                [
                    'sku_id' => $stockRequest->sku_id,
                    'franchise_id' => $stockRequest->franchise_id, // Franchise Godown
                    'transaction_type' => 'in',
                    'quantity' => $stockRequest->quantity,
                    'reason' => 'Received from Master Warehouse',
                    'performed_by' => auth()->id(),
                    'created_at' => now(), 'updated_at' => now()
                ]
            ]);

            // 4. 💰 WALLET UPDATE (Add Pending Dues)
            DB::table('wallets')->where('franchise_id', $stockRequest->franchise_id)
                                ->increment('pending_dues', $stockRequest->total_amount);

            // 5. Mark Request as Approved
            $stockRequest->update(['status' => 'approved']);

            DB::commit();
            return back()->with('success', 'Stock Request Approved! Ledger & Wallet updated.');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }
}