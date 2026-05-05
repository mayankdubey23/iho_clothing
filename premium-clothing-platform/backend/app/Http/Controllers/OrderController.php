<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
// use App\Models\Order;

class OrderController extends Controller
{
    // A. Customer Naya Order Place Karega
    public function store(Request $request)
    {
        $request->validate([
            'customer_name' => 'required|string',
            'customer_phone' => 'required|string',
            'items' => 'required|array', // Cart mein kaunse kapde hain
            'total_amount' => 'required|numeric'
        ]);

        // Yahan Order create karne ka code aayega...
        // $order = Order::create([...]);

        return response()->json([
            'success' => true,
            'message' => 'Order successfully placed!',
            'order_id' => rand(1000, 9999) // Dummy ID for now
        ], 201);
    }

    // B. Admin Dashboard Par Sales Stats Dikhane Ke Liye
    public function dashboardStats()
    {
        // Yahan aap real database queries likhenge, jaise:
        // $totalRevenue = Order::where('status', 'completed')->sum('total_amount');
        // $totalOrders = Order::count();

        return response()->json([
            'success' => true,
            'data' => [
                'total_revenue' => 125000.00, // Dummy figure
                'total_orders' => 45,
                'pending_franchise_requests' => 3,
                'low_stock_items' => 2
            ]
        ]);
    }
}