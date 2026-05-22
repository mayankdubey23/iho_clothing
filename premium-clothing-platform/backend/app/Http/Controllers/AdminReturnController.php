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

        $stats = [
            'pending_requests' => DB::table('returns')->where('status', 'Requested')->count(),
            'pending_pickups' => DB::table('returns')->whereIn('status', ['Approved', 'Pickup Scheduled'])->count(),
            'awaiting_refund' => DB::table('returns')->where('status', 'Received')->where('type', 'Refund')->count(),
        ];

        return Inertia::render('Admin/Returns', [
            'returns' => $returns,
            'stats' => $stats,
            'filters' => $request->only(['search', 'status'])
        ]);
    }

    // 🚀 Update Basic Status (Requested -> Approved -> Pickup Scheduled)
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
            'items.*.condition' => 'required|in:Good,Damaged',
            'items.*.product_id' => 'required',
            'items.*.sku_id' => 'nullable',
            'items.*.quantity' => 'required',
            'refund_action' => 'required|boolean' // If true, process refund automatically
        ]);

        $returnReq = DB::table('returns')->where('id', $id)->first();
        if (! $returnReq) {
            return back()->withErrors('Return request not found.');
        }

        DB::transaction(function () use ($validated, $returnReq, $id) {
            foreach ($validated['items'] as $item) {
                $returnItem = DB::table('return_items')->where('id', $item['id'])->first();
                $skuId = $item['sku_id'] ?? $returnItem?->sku_id;

                if (! $skuId && $returnItem?->order_item_id) {
                    $skuId = DB::table('order_items')->where('id', $returnItem->order_item_id)->value('sku_id');
                }

                if (! $skuId) {
                    $skuId = DB::table('skus')->where('product_id', $item['product_id'])->value('id');
                }

                // 1. Update Return Item Condition
                DB::table('return_items')->where('id', $item['id'])->update([
                    'item_condition' => $item['condition'],
                    'sku_id' => $skuId,
                    'is_restocked' => true,
                    'updated_at' => now()
                ]);

                // 2. Adjust Master Stock / Damaged Stock
                $inventory = $skuId
                    ? DB::table('inventories')->where('sku_id', $skuId)->whereNull('franchise_id')->first()
                    : null;

                if ($inventory) {
                    if ($item['condition'] === 'Good') {
                        DB::table('inventories')->where('id', $inventory->id)->increment('stock_quantity', $item['quantity']);
                    } else {
                        DB::table('inventories')->where('id', $inventory->id)->increment('damaged_quantity', $item['quantity']);
                    }
                }

                // 3. Log Stock Transaction
                if ($skuId && Schema::hasTable('stock_transactions')) {
                    DB::table('stock_transactions')->insert([
                        'sku_id' => $skuId,
                        'franchise_id' => null,
                        'transaction_type' => 'in',
                        'quantity' => $item['quantity'],
                        'reason' => $item['condition'] === 'Good'
                            ? "Return Request #{$id} restocked"
                            : "Return Request #{$id} damaged stock",
                        'performed_by' => auth()->id(),
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }

            // Update main status to Received
            DB::table('returns')->where('id', $id)->update(['status' => 'Received', 'updated_at' => now()]);

            // Optional: Issue Refund record if requested
            if ($validated['refund_action'] && $returnReq->type === 'Refund') {
                $payment = DB::table('payments')->where('order_id', $returnReq->order_id)->first();
                if($payment) {
                    DB::table('refunds')->insert([
                        'return_id' => $id,
                        'payment_id' => $payment->id,
                        'amount' => $returnReq->total_refund_amount,
                        'status' => 'Processed',
                        'created_at' => now(),
                        'updated_at' => now()
                    ]);
                    DB::table('returns')->where('id', $id)->update(['status' => 'Refunded']);
                    DB::table('payments')->where('id', $payment->id)->update(['status' => 'Refunded']);
                }
            }
        });

        return back()->with('success', 'Items inspected, stock updated, and return processed!');
    }
}
