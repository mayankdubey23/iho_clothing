<?php

namespace App\Http\Controllers\Franchise;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
        $franchiseId = Auth::id(); // 🛡️ STRICT ISOLATION
        $search = $request->input('search', '');

        // Securely fetch customers who have ordered from THIS franchise ONLY
        $customers = DB::table('users')
            ->join('orders', 'users.id', '=', 'orders.user_id')
            ->where('orders.franchise_id', $franchiseId)
            ->select(
                'users.id',
                'users.name',
                'users.email',
                'users.phone',
                DB::raw('COUNT(orders.id) as total_orders'),
                DB::raw('SUM(orders.total_amount) as total_spent'),
                DB::raw('MAX(orders.created_at) as last_order_date')
            )
            ->when($search, function ($query, $search) {
                $query->where(function($q) use ($search) {
                    $q->where('users.name', 'like', "%{$search}%")
                      ->orWhere('users.phone', 'like', "%{$search}%")
                      ->orWhere('users.email', 'like', "%{$search}%");
                });
            })
            ->groupBy('users.id', 'users.name', 'users.email', 'users.phone')
            ->orderBy('last_order_date', 'desc')
            ->paginate(15)
            ->withQueryString();

        // Attach primary address to each customer
        foreach ($customers as $customer) {
            $customer->address = DB::table('user_addresses')
                ->where('user_id', $customer->id)
                ->where('is_default', true)
                ->first();
                
            // Fallback: If no default address, get the shipping address from their latest order
            if (!$customer->address) {
                $latestOrder = DB::table('orders')
                    ->where('user_id', $customer->id)
                    ->orderBy('created_at', 'desc')
                    ->first();
                $customer->fallback_address = $latestOrder ? $latestOrder->shipping_address : 'No address provided';
            }
        }

        return Inertia::render('Franchise/Customers', [
            'customers' => $customers,
            'filters' => ['search' => $search]
        ]);
    }
}