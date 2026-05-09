<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use App\Models\Inventory;
use App\Models\Order;
use App\Models\User;

class OrderController extends Controller
{
    public function dashboard(Request $request)
    {
        if ($request->is('franchise-admin*')) {
            $franchiseId = Auth::id();

            $ordersQuery = Order::query()->where('franchise_id', $franchiseId);

            return Inertia::render('Franchise/Dashboard', [
                'stats' => [
                    'revenue' => (float) (clone $ordersQuery)
                        ->whereNotIn('status', ['cancelled', 'returned', 'refunded'])
                        ->sum('total_amount'),
                    'orders_count' => (clone $ordersQuery)->count(),
                    'stock_level' => (int) Inventory::where('franchise_id', $franchiseId)->sum('stock_quantity'),
                    'pending' => (clone $ordersQuery)
                        ->whereIn('status', ['pending', 'confirmed', 'packed'])
                        ->count(),
                ],
                'recent_orders' => (clone $ordersQuery)
                    ->latest()
                    ->take(8)
                    ->get(),
            ]);
        }

        $ordersQuery = Order::query();
        $activeOrdersQuery = Order::query()->whereNotIn('status', ['cancelled', 'returned', 'refunded']);

        $chartData = Order::query()
            ->selectRaw('DATE(created_at) as name, COALESCE(SUM(total_amount), 0) as revenue, COUNT(*) as orders')
            ->where('created_at', '>=', now()->subDays(6)->startOfDay())
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy('name')
            ->get();

        $applicationsCount = Schema::hasTable('franchise_applications')
            ? DB::table('franchise_applications')->where('status', 'pending')->count()
            : 0;

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'total_revenue' => (float) (clone $activeOrdersQuery)->sum('total_amount'),
                'total_orders' => (clone $ordersQuery)->count(),
                'total_customers' => User::where('role', 'customer')->count(),
                'applications' => $applicationsCount,
                'pending_orders' => (clone $ordersQuery)->where('status', 'pending')->count(),
                'low_stock' => Inventory::whereNull('franchise_id')->where('stock_quantity', '<=', 10)->count(),
                'online_sales' => (float) (clone $activeOrdersQuery)
                    ->when(Schema::hasColumn('orders', 'sales_channel'), fn ($query) => $query->where('sales_channel', 'online'))
                    ->sum('total_amount'),
                'offline_sales' => (float) (clone $activeOrdersQuery)
                    ->when(Schema::hasColumn('orders', 'sales_channel'), fn ($query) => $query->where('sales_channel', 'offline'))
                    ->sum('total_amount'),
            ],
            'recent_orders' => Order::with('franchise:id,name')
                ->latest()
                ->take(8)
                ->get(),
            'chart_data' => $chartData,
        ]);
    }

    public function index(Request $request)
    {
        $relations = ['franchise:id,name,city,state'];

        if (Schema::hasColumn('orders', 'user_id')) {
            $relations[] = 'user:id,name,email';
        }

        $ordersQuery = Order::with($relations);

        // Search
        $ordersQuery->when($request->search, function ($q, $search) {
            $q->where(function ($sub) use ($search) {
                $sub->where('id', 'like', "%{$search}%")
                    ->orWhere('razorpay_order_id', 'like', "%{$search}%")
                    ->orWhere('city', 'like', "%{$search}%")
                    ->orWhere('pincode', 'like', "%{$search}%")
                    ->orWhere('customer_name', 'like', "%{$search}%");
            });
        });

        // Status
        $ordersQuery->when($request->status, fn ($q, $status) => $q->where('status', $status));

        // Franchise filter
        $ordersQuery->when($request->franchise_id, function ($q, $franchise_id) {
            if ($franchise_id === 'master') {
                $q->where(function ($sub) {
                    $sub->whereNull('franchise_id')
                        ->orWhere('fulfillment_type', 'master');
                });
            } else {
                $q->where('franchise_id', $franchise_id);
            }
        });

        // City/state filters
        $ordersQuery->when($request->city, fn ($q, $city) => $q->where('city', 'like', "%{$city}%"));
        $ordersQuery->when($request->state, fn ($q, $state) => $q->where('state', 'like', "%{$state}%"));

        // Customer filter
        $ordersQuery->when($request->customer_id, function ($q, $customer_id) {
            $q->where(function ($sub) use ($customer_id) {
                if (Schema::hasColumn('orders', 'user_id')) {
                    $sub->where('user_id', $customer_id);
                }

                $sub->orWhere('customer_email', function ($x) use ($customer_id) {
                    $x->select('email')->from('users')->where('id', $customer_id);
                });
            });
        });

        $orders = $ordersQuery->latest()->paginate(15)->withQueryString();

        $franchises = User::where('role', 'franchise')->select('id', 'name', 'city', 'state')->get();

        $stats = [
            'total' => (clone $ordersQuery)->count(),
            'pending' => (clone $ordersQuery)->where('status', 'pending')->count(),
            'shipped' => (clone $ordersQuery)->whereIn('status', ['shipped', 'out_for_delivery'])->count(),
            'returned' => (clone $ordersQuery)->whereIn('status', ['returned', 'refunded'])->count(),
        ];

        return Inertia::render('Admin/Orders', [
            'orders' => $orders,
            'franchises' => $franchises,
            'filters' => $request->only(['search', 'status', 'franchise_id', 'city', 'state', 'customer_id']),
            'stats' => $stats,
        ]);
    }


    // 🚀 Manual Reassign Logic (Super Admin Tool)
    public function reassignOrder(Request $request, $id)
    {
        $request->validate([
            'franchise_id' => 'nullable|exists:users,id', // null means assigning to Master
        ]);

        $order = Order::findOrFail($id);
        $order->franchise_id = $request->franchise_id;
        $order->fulfillment_type = $request->franchise_id ? 'franchise' : 'master';
        $order->save();

        // Here you would also trigger: Send Notification to new Franchise
        
        return back()->with('success', 'Order reassigned successfully.');
    }

    // Update Order Status
    public function updateStatus(Request $request, $id)
    {
        $request->validate(['status' => 'required|string']);
        
        $order = Order::findOrFail($id);
        $order->status = $request->status;
        $order->save();

        // DB::table('order_status_logs')->insert([...]) logic comes here

        return back()->with('success', 'Order status updated to ' . $request->status);
    }
}
