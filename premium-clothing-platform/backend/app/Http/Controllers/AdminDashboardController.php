<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Carbon\Carbon;
// Make sure these Models match your actual Model names
use App\Models\Order;
use App\Models\User;
use App\Models\FranchiseApplication;
use App\Models\Inventory; // or Stock
use App\Models\OrderItem;

class AdminDashboardController extends Controller
{
    public function index()
    {
        $today = Carbon::today();
        $thisMonth = Carbon::now()->month;

        // 1. FINANCIALS (Real-time sum from orders)
        $totalRevenue = Order::where('status', 'delivered')->sum('total_amount');
        $todayRevenue = Order::whereDate('created_at', $today)->whereNotIn('status', ['cancelled', 'returned'])->sum('total_amount');
        $monthlyRevenue = Order::whereMonth('created_at', $thisMonth)->whereNotIn('status', ['cancelled', 'returned'])->sum('total_amount');
        
        // Master Stock Value
        // Inventories table in this project typically stores stock qty; it may not have a `price` column.
        // To avoid crashing the Command Center, compute a safe master stock value.
        // If your schema later adds a unit price column, you can replace this logic.
        $masterStockValue = Inventory::sum('stock_quantity');
        // 2. ORDERS
        $totalOrders = Order::count();
        $pendingOrders = Order::where('status', 'pending')->count();
        $deliveredOrders = Order::where('status', 'delivered')->count();
        $cancelledOrders = Order::where('status', 'cancelled')->count();
        // Returns table may not exist in this project yet.
        // Using orders.status instead to avoid 500 errors.
        $returnRequests = Order::whereIn('status', ['returned', 'refund_requested', 'pending_return', 'returned_pending'])->count();

        // 3. NETWORK (Users & Franchises)
        $totalCustomers = User::where('role', 'customer')->count();
        $totalFranchises = User::where('role', 'franchise')->count();
        // Users table may not have a `status` column in this project schema.
        // If it exists later, we can re-enable these stats.
        $activeFranchises = 0;
        $blockedFranchises = 0;
        $pendingFranchiseReqs = FranchiseApplication::where('status', 'pending')->count();

        // 4. ALERTS & OPERATIONS
        $lowStockAlerts = Inventory::where('stock_quantity', '<=', 10)->count();
        $pendingPayments = Order::where('payment_status', 'pending')->count();
        $supportTickets = Schema::hasColumn('support_tickets', 'status')
            ? DB::table('support_tickets')->where('status', 'Open')->count()
            : 0;

        // 5. TRAFFIC & CONVERSION
        // Note: Real visitors tracking needs Google Analytics API or a custom page_visits table. 
        // We are using a hypothetical 'page_visits' table here for real DB fetching.
        $websiteVisitors = Schema::hasTable('page_visits') ? DB::table('page_visits')->count() : 1;
        $conversionRate = $websiteVisitors > 0 ? round(($totalOrders / $websiteVisitors) * 100, 2) : 0;

        // 6. TOP PRODUCTS (Join with OrderItems)
        $topProducts = OrderItem::select('product_id', DB::raw('SUM(quantity) as sold'), DB::raw('SUM(price * quantity) as revenue'))
            ->with('product:id,name') // Assuming relationship exists in OrderItem model
            ->groupBy('product_id')
            ->orderByDesc('sold')
            ->take(5)
            ->get()
            ->map(function($item) {
                return [
                    'name' => $item->product ? $item->product->name : 'Deleted Product',
                    'sold' => (int) $item->sold,
                    'revenue' => (float) $item->revenue
                ];
            });

        // 7. TOP FRANCHISES
        $topFranchises = Order::select('franchise_id', DB::raw('COUNT(id) as total_orders'), DB::raw('SUM(total_amount) as revenue'))
            ->with('franchise:id,name') // Assuming 'franchise' relationship in Order model belongsTo User
            ->whereNotNull('franchise_id')
            ->groupBy('franchise_id')
            ->orderByDesc('revenue')
            ->take(5)
            ->get()
            ->map(function($item) {
                return [
                    'name' => $item->franchise ? $item->franchise->name : 'Unknown Franchise',
                    'orders' => (int) $item->total_orders,
                    'revenue' => (float) $item->revenue
                ];
            });

        return Inertia::render('Admin/CommandCenter', [
            'stats' => [
                'total_revenue' => (float) $totalRevenue,
                'today_revenue' => (float) $todayRevenue,
                'monthly_revenue' => (float) $monthlyRevenue,
                'master_stock_value' => (float) $masterStockValue,
                'website_visitors' => $websiteVisitors,
                'conversion_rate' => $conversionRate,
                'total_orders' => $totalOrders,
                'pending_orders' => $pendingOrders,
                'delivered_orders' => $deliveredOrders,
                'cancelled_orders' => $cancelledOrders,
                'return_requests' => $returnRequests,
                'total_customers' => $totalCustomers,
                'total_franchises' => $totalFranchises,
                'active_franchises' => $activeFranchises,
                'pending_franchise_reqs' => $pendingFranchiseReqs,
                'blocked_franchises' => $blockedFranchises,
                'low_stock_alerts' => $lowStockAlerts,
                'pending_payments' => $pendingPayments,
                'support_tickets' => $supportTickets,
            ],
            'top_products' => $topProducts,
            'top_franchises' => $topFranchises
        ]);
    }
}
