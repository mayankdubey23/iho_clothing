<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Inventory;
use App\Models\FranchisePincode;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class OrderController extends Controller
{
    /**
     * 🛒 THE SMART CHECKOUT ENGINE
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_phone' => 'required|string|max:20',
            'customer_email' => 'nullable|email',
            'shipping_address' => 'required|string',
            'pincode' => 'required|string|max:10', 
            'total_amount' => 'required|numeric',
            'items' => 'required|array',
            'items.*.product_id' => 'required|integer|exists:products,id',
            'items.*.sku_id' => 'required|integer|exists:skus,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric'
        ]);

        try {
            DB::beginTransaction();

            $franchisePincode = FranchisePincode::where('pincode', $validatedData['pincode'])->first();
            $targetFranchiseId = $franchisePincode ? $franchisePincode->franchise_id : null;

            $finalFulfillerId = $targetFranchiseId; 
            $canFranchiseFulfill = true;

            if ($targetFranchiseId) {
                foreach ($validatedData['items'] as $item) {
                    $franchiseStock = Inventory::where('franchise_id', $targetFranchiseId)
                        ->where('sku_id', $item['sku_id'])
                        ->value('stock_quantity') ?? 0; // Updated to stock_quantity

                    if ($franchiseStock < $item['quantity']) {
                        $canFranchiseFulfill = false;
                        break; 
                    }
                }
            } else {
                $canFranchiseFulfill = false;
            }

            if (!$canFranchiseFulfill) {
                $finalFulfillerId = null; 

                foreach ($validatedData['items'] as $item) {
                    $superAdminStock = Inventory::whereNull('franchise_id')
                        ->where('sku_id', $item['sku_id'])
                        ->value('stock_quantity') ?? 0; // Updated to stock_quantity

                    if ($superAdminStock < $item['quantity']) {
                        throw new \Exception("Sorry! This item is currently out of stock everywhere.");
                    }
                }
            }

            $order = Order::create([
                'customer_name' => $validatedData['customer_name'],
                'customer_phone' => $validatedData['customer_phone'],
                'customer_email' => $validatedData['customer_email'] ?? null,
                'shipping_address' => $validatedData['shipping_address'],
                'total_amount' => $validatedData['total_amount'],
                'status' => 'pending',
                'franchise_id' => $finalFulfillerId 
            ]);

            foreach ($validatedData['items'] as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item['product_id'],
                    'sku_id' => $item['sku_id'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price']
                ]);

                DB::table('inventories')
                    ->where('franchise_id', $finalFulfillerId)
                    ->where('sku_id', $item['sku_id'])
                    ->decrement('stock_quantity', $item['quantity']); // Updated to stock_quantity
            }

            DB::commit();

            $fulfillerName = $finalFulfillerId ? 'Local Franchise' : 'Main Warehouse';
            return redirect()->back()->with('success', "Order placed successfully! It will be fulfilled by our {$fulfillerName}.");

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['error' => 'Order failed: ' . $e->getMessage()]);
        }
    }

    /**
     * 📊 ADMIN DASHBOARD DATA
     */
    public function dashboard(Request $request)
    {
        $user = auth()->user(); 
        
        $query = Order::query();

        if ($user && $user->role === 'franchise') {
            $query->where('franchise_id', $user->id);
        }

        $totalRevenue = (clone $query)->where('status', 'completed')->sum('total_amount');
        $totalOrders = (clone $query)->count();
        $recentOrders = (clone $query)->latest()->take(5)->get();

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'total_revenue' => $totalRevenue,
                'total_orders' => $totalOrders,
                'recent_orders' => $recentOrders,
            ]
        ]);
    }
}