<?php

namespace App\Http\Controllers\Franchise;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class ReturnController extends Controller
{
    public function index(Request $request)
    {
        $franchiseId = Auth::id();
        $search = $request->input('search', '');

        $returns = DB::table('returns')
            ->leftJoin('orders', 'returns.order_id', '=', 'orders.id')
            ->leftJoin('users', 'returns.user_id', '=', 'users.id')
            ->where('returns.franchise_id', $franchiseId)
            ->select(
                'returns.*', 
                'orders.id as order_ref', 
                'orders.total_amount',
                'users.name as customer_name',
                'users.phone as customer_phone'
            )
            ->when($search, function ($query, $search) {
                $query->where('returns.return_number', 'like', "%{$search}%")
                      ->orWhere('orders.id', 'like', "%{$search}%")
                      ->orWhere('users.name', 'like', "%{$search}%");
            })
            ->orderBy('returns.created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        foreach ($returns as $ret) {
            $ret->items = DB::table('return_items')
                ->join('products', 'return_items.product_id', '=', 'products.id')
                ->where('return_id', $ret->id)
                ->select('return_items.*', 'products.name', 'products.sku')
                ->get();
        }

        return Inertia::render('Franchise/Returns', [
            'returns' => $returns,
            'filters' => ['search' => $search]
        ]);
    }

    // 🚀 Handle Status & Inventory Logic
    public function updateStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|string',
            'franchise_notes' => 'nullable|string',
            'condition' => 'nullable|string|in:Sellable,Damaged' // Required if status is 'Item Received'
        ]);

        $return = DB::table('returns')->where('id', $id)->where('franchise_id', Auth::id())->first();
        if (!$return) abort(403, 'Unauthorized');

        DB::transaction(function () use ($validated, $return, $id) {
            // Update Return Record
            DB::table('returns')->where('id', $id)->update([
                'status' => $validated['status'],
                'franchise_notes' => $validated['franchise_notes'] ?? $return->franchise_notes,
                'updated_at' => now()
            ]);

            // 🧠 CORE LOGIC: If Item is Received back
            if ($validated['status'] === 'Item Received' && isset($validated['condition'])) {
                $items = DB::table('return_items')->where('return_id', $id)->get();
                
                foreach ($items as $item) {
                    // 1. Mark condition in return_items
                    DB::table('return_items')->where('id', $item->id)->update(['condition' => $validated['condition']]);

                    // 2. Adjust Franchise Inventory
                    $invQuery = DB::table('franchise_inventory')
                                  ->where('franchise_id', Auth::id())
                                  ->where('product_id', $item->product_id);
                    
                    if ($item->variant_id) {
                        $invQuery->where('variant_id', $item->variant_id);
                    }

                    if ($validated['condition'] === 'Sellable') {
                        $invQuery->update([
                            'quantity' => DB::raw("quantity + {$item->quantity}"),
                            'returned_quantity' => DB::raw("returned_quantity + {$item->quantity}")
                        ]);
                    } elseif ($validated['condition'] === 'Damaged') {
                        $invQuery->update([
                            'damaged_quantity' => DB::raw("damaged_quantity + {$item->quantity}"),
                            'returned_quantity' => DB::raw("returned_quantity + {$item->quantity}")
                        ]);
                    }

                    // 3. Log Stock Transaction
                    DB::table('franchise_stock_transactions')->insert([
                        'franchise_id' => Auth::id(),
                        'product_id' => $item->product_id,
                        'variant_id' => $item->variant_id,
                        'type' => 'Returned',
                        'quantity' => $item->quantity, // Always positive as it's coming back
                        'reference_id' => $return->return_number,
                        'notes' => "Returned as " . $validated['condition'],
                        'created_at' => now(),
                        'updated_at' => now()
                    ]);
                }
            }

            // If forwarded to Admin for refund processing
            if ($validated['status'] === 'Forwarded to Admin' && $return->return_type === 'Refund') {
                DB::table('refunds')->updateOrInsert(
                    ['return_id' => $id],
                    [
                        'order_id' => $return->order_id,
                        'amount' => DB::table('orders')->where('id', $return->order_id)->value('total_amount'),
                        'status' => 'Pending',
                        'created_at' => now(),
                        'updated_at' => now()
                    ]
                );
            }
        });

        return back()->with('success', "Return status updated to {$validated['status']}.");
    }
}