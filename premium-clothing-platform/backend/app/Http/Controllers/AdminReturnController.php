<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class AdminReturnController extends Controller
{
    public function index(Request $request)
    {
        // 🚀 Fetch Returns with Customer & Order Info
        $returns = DB::table('returns')
            ->join('users', 'returns.user_id', '=', 'users.id')
            ->join('orders', 'returns.order_id', '=', 'orders.id')
            ->select('returns.*', 'users.name as customer_name', 'users.email', 'orders.razorpay_order_id')
            ->when($request->search, function ($query, $search) {
                $query->where('returns.id', 'like', "%{$search}%")
                      ->orWhere('users.name', 'like', "%{$search}%")
                      ->orWhere('orders.razorpay_order_id', 'like', "%{$search}%");
            })
            ->when($request->status, function ($query, $status) {
                $query->where('returns.status', $status);
            })
            ->orderBy('returns.created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        // 🛠️ FIXED: 'type' changed to 'return_type' and 'Received' to 'Item Received'
        $stats = [
            'pending_requests' => DB::table('returns')->where('status', 'Requested')->count(),
            'pending_pickups' => DB::table('returns')->whereIn('status', ['Forwarded to Admin', 'Pickup Scheduled'])->count(),
            'awaiting_refund' => DB::table('returns')->where('status', 'Item Received')->where('return_type', 'Refund')->count(),
        ];

        return Inertia::render('Admin/Returns', [
            'returns' => $returns,
            'stats' => $stats,
            'filters' => $request->only(['search', 'status'])
        ]);
    }

    // 🚀 Update Basic Status
    public function updateStatus(Request $request, $id)
    {
        $request->validate(['status' => 'required|string']);
        
        DB::table('returns')->where('id', $id)->update([
            'status' => $request->status,
            'updated_at' => now()
        ]);

        return back()->with('success', "Return marked as {$request->status}.");
    }

    // 🚀 Master Inspection Logic: When product arrives at Warehouse
    public function processInspection(Request $request, $id)
    {
        $validated = $request->validate([
            'items' => 'required|array',
            'items.*.id' => 'required|exists:return_items,id',
            'items.*.condition' => 'required|in:Good,Damaged,Sellable',
            'items.*.product_id' => 'required',
            'items.*.sku_id' => 'nullable',
            'items.*.quantity' => 'required',
            'refund_action' => 'required|boolean'
        ]);

        $returnReq = DB::table('returns')->where('id', $id)->first();
        if (! $returnReq) {
            return back()->withErrors('Return request not found.');
        }

        DB::transaction(function () use ($validated, $returnReq, $id) {
            foreach ($validated['items'] as $item) {
                
                // 🛠️ FIXED: Map Frontend condition to Database ENUM ('Sellable' or 'Damaged')
                $dbCondition = in_array($item['condition'], ['Good', 'Sellable']) ? 'Sellable' : 'Damaged';

                $returnItem = DB::table('return_items')->where('id', $item['id'])->first();
                $skuId = $item['sku_id'] ?? $returnItem?->variant_id ?? null;

                if (! $skuId && $returnItem?->product_id) {
                    $skuId = DB::table('skus')->where('product_id', $returnItem->product_id)->value('id');
                }

                // 1. Update Return Item Condition (FIXED: 'item_condition' to 'condition')
                DB::table('return_items')->where('id', $item['id'])->update([
                    'condition' => $dbCondition,
                    'updated_at' => now()
                ]);

                // 2. Adjust Master Stock / Damaged Stock
                $inventory = $skuId
                    ? DB::table('inventories')->where('sku_id', $skuId)->whereNull('franchise_id')->first()
                    : null;

                if ($inventory) {
                    if ($dbCondition === 'Sellable') {
                        DB::table('inventories')->where('id', $inventory->id)->increment('stock_quantity', $item['quantity']);
                    } else {
                        if (Schema::hasColumn('inventories', 'damaged_quantity')) {
                            DB::table('inventories')->where('id', $inventory->id)->increment('damaged_quantity', $item['quantity']);
                        }
                    }
                }

                // 3. Log Stock Transaction
                if ($skuId && Schema::hasTable('stock_transactions')) {
                    DB::table('stock_transactions')->insert([
                        'sku_id' => $skuId,
                        'franchise_id' => null,
                        'transaction_type' => 'in',
                        'quantity' => $item['quantity'],
                        'reason' => $dbCondition === 'Sellable'
                            ? "Return Request #{$id} restocked"
                            : "Return Request #{$id} damaged stock",
                        'performed_by' => auth()->id(),
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }

            // 🛠️ FIXED: Update main status to 'Item Received' to match migration ENUM
            DB::table('returns')->where('id', $id)->update(['status' => 'Item Received', 'updated_at' => now()]);

            // Optional: Issue Refund record if requested (FIXED: 'type' to 'return_type')
            if ($validated['refund_action'] && $returnReq->return_type === 'Refund') {
                $orderAmount = DB::table('orders')->where('id', $returnReq->order_id)->value('total_amount') ?? 0;
                
                // FIXED: Matched exact columns in the `refunds` table migration
                DB::table('refunds')->insert([
                    'return_id' => $id,
                    'order_id' => $returnReq->order_id, 
                    'amount' => $orderAmount, 
                    'status' => 'Processed',
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
                
                // Complete the return process
                DB::table('returns')->where('id', $id)->update(['status' => 'Completed']);
            }
        });

        return back()->with('success', 'Items inspected, stock updated, and return processed!');
    }
}