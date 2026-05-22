<?php

namespace App\Http\Controllers\Franchise;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $franchiseId = Auth::id(); // 🛡️ STRICT ISOLATION
        $search = $request->input('search', '');
        $statusFilter = $request->input('status', 'all');

        $orders = DB::table('orders')
            ->leftJoin('users', 'orders.user_id', '=', 'users.id')
            ->where('orders.franchise_id', $franchiseId)
            ->select('orders.*', 'users.name as customer_name', 'users.phone as customer_phone', 'users.email as customer_email')
            ->when($search, function ($query, $search) {
                $query->where(function($q) use ($search) {
                    $q->where('orders.id', 'like', "%{$search}%")
                      ->orWhere('users.name', 'like', "%{$search}%")
                      ->orWhere('users.phone', 'like', "%{$search}%");
                });
            })
            ->when($statusFilter !== 'all', function ($query) use ($statusFilter) {
                $query->where('orders.status', $statusFilter);
            })
            ->orderBy('orders.created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        // Attach items, tracking, and logs to each order for the modal view
        foreach ($orders as $order) {
            $order->items = DB::table('order_items')
                ->join('products', 'order_items.product_id', '=', 'products.id')
                ->where('order_id', $order->id)
                ->select('order_items.*', 'products.name', 'products.sku')
                ->get();
                
            $order->tracking = DB::table('shipments')->where('order_id', $order->id)->first();
            
            $order->logs = DB::table('order_status_logs')
                ->where('order_id', $order->id)
                ->orderBy('created_at', 'desc')
                ->get();
        }

        return Inertia::render('Franchise/Orders', [
            'orders' => $orders,
            'filters' => [
                'search' => $search,
                'status' => $statusFilter
            ]
        ]);
    }

    // 🚀 Update Status & Log Timeline
    public function updateStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|string|in:Pending,Confirmed,Packed,Shipped,Out for Delivery,Delivered,Cancelled Request',
            'notes' => 'nullable|string'
        ]);

        $order = DB::table('orders')->where('id', $id)->where('franchise_id', Auth::id())->first();
        if (!$order) abort(403, 'Unauthorized Action.');

        DB::transaction(function () use ($validated, $id, $order) {
            // 1. Update Main Order Table (Visible to Super Admin & Customer instantly)
            DB::table('orders')->where('id', $id)->update([
                'status' => $validated['status'],
                'updated_at' => now()
            ]);

            // 2. Add to Timeline Log
            DB::table('order_status_logs')->insert([
                'order_id' => $id,
                'status' => $validated['status'],
                'updated_by_role' => 'Franchise Admin',
                'updated_by' => Auth::id(),
                'notes' => $validated['notes'] ?? 'Status updated by Franchise',
                'created_at' => now(),
                'updated_at' => now()
            ]);

            DB::table('activity_logs')->insert([
                'user_id' => Auth::id(),
                'module' => 'Orders',
                'action' => 'Order Status Updated',
                'description' => "Updated order #ORD-{$id} status to {$validated['status']}.",
                'ip_address' => request()->ip(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            
            // 3. If Delivered, complete payment if it was COD
            if($validated['status'] === 'Delivered' && $order->payment_method === 'COD') {
                 DB::table('orders')->where('id', $id)->update(['payment_status' => 'Paid']);
            }

            // 4. If Delivered, reduce franchise inventory and log stock movement once
            if ($validated['status'] === 'Delivered' && $order->status !== 'Delivered') {
                $orderItems = DB::table('order_items')->where('order_id', $id)->get();

                foreach ($orderItems as $item) {
                    $variantId = property_exists($item, 'variant_id') ? $item->variant_id : null;

                    $inventoryQuery = DB::table('franchise_inventory')
                        ->where('franchise_id', Auth::id())
                        ->where('product_id', $item->product_id);

                    if ($variantId) {
                        $inventoryQuery->where('variant_id', $variantId);
                    }

                    $inventoryQuery->update([
                        'quantity' => DB::raw("quantity - {$item->quantity}"),
                        'sold_quantity' => DB::raw("sold_quantity + {$item->quantity}"),
                        'updated_at' => now(),
                    ]);

                    DB::table('franchise_stock_transactions')->insert([
                        'franchise_id' => Auth::id(),
                        'product_id' => $item->product_id,
                        'variant_id' => $variantId,
                        'type' => 'Sold',
                        'quantity' => -$item->quantity,
                        'reference_id' => 'ORD-' . $id,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        });

        return back()->with('success', "Order marked as {$validated['status']}");
    }

    // 🚀 Update Tracking Details
    public function updateTracking(Request $request, $id)
    {
        $validated = $request->validate([
            'courier_partner' => 'required|string',
            'tracking_number' => 'required|string'
        ]);

        $order = DB::table('orders')->where('id', $id)->where('franchise_id', Auth::id())->first();
        if (!$order) abort(403, 'Unauthorized');

        DB::table('shipments')->updateOrInsert(
            ['order_id' => $id],
            [
                'tracking_number' => $validated['tracking_number'],
                'courier_id' => DB::table('courier_partners')->where('name', $validated['courier_partner'])->value('id') ?? null, // If couriers table exists
                'delivery_status' => 'Shipped',
                'shipped_at' => now(),
                'updated_at' => now()
            ]
        );

        DB::table('activity_logs')->insert([
            'user_id' => Auth::id(),
            'module' => 'Orders',
            'action' => 'Tracking Updated',
            'description' => "Updated tracking for order #ORD-{$id}.",
            'ip_address' => $request->ip(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Auto-update order status to Shipped
        $this->updateStatus(new Request(['status' => 'Shipped', 'notes' => 'Tracking ID added.']), $id);

        return back()->with('success', 'Tracking details added successfully.');
    }

    // 🚀 Print Invoice (Simulated logic for now, usually returns PDF)
    public function printInvoice($id)
    {
        $order = DB::table('orders')->where('id', $id)->where('franchise_id', Auth::id())->first();
        if (!$order) abort(404);

        DB::table('activity_logs')->insert([
            'user_id' => Auth::id(),
            'module' => 'Orders',
            'action' => 'Invoice Printed',
            'description' => "Generated invoice for order #ORD-{$id}.",
            'ip_address' => request()->ip(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        
        // In a real app, you'd use laravel-dompdf here.
        return back()->with('success', 'Invoice generation triggered. Downloading...');
    }
}
