<?php

namespace App\Http\Controllers\Franchise;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schema;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        // 🛡️ THE GOLDEN RULE: Strict Tenant Isolation
        $franchiseId = Auth::id(); 
        $today = Carbon::today();
        $thisMonth = Carbon::now()->startOfMonth();

        // 1. 📊 CORE METRICS (Sales & Orders)
        $todaySales = DB::table('orders')->where('franchise_id', $franchiseId)->whereDate('created_at', $today)->sum('total_amount');
        $monthlySales = DB::table('orders')->where('franchise_id', $franchiseId)->where('created_at', '>=', $thisMonth)->sum('total_amount');
        
        $orderStats = DB::table('orders')
            ->where('franchise_id', $franchiseId)
            ->selectRaw("
                COUNT(id) as total_orders,
                SUM(CASE WHEN status IN ('Pending', 'Processing') THEN 1 ELSE 0 END) as pending_orders,
                SUM(CASE WHEN status = 'Delivered' THEN 1 ELSE 0 END) as delivered_orders,
                SUM(CASE WHEN status = 'Cancelled' THEN 1 ELSE 0 END) as cancelled_orders,
                SUM(CASE WHEN status = 'Return Requested' THEN 1 ELSE 0 END) as return_requests
            ")->first();

        // 2. 📦 INVENTORY & STOCK REQUESTS
        $inventoryStats = DB::table('franchise_inventory')
            ->where('franchise_id', $franchiseId)
            ->selectRaw("
                SUM(quantity) as total_stock,
                SUM(CASE WHEN quantity <= low_stock_threshold THEN 1 ELSE 0 END) as low_stock_items
            ")->first();

        $pendingStockRequests = $this->countPendingStockRequests($franchiseId);

        // 3. 👥 CUSTOMERS & SUPPORT
        // Customers are users who have placed at least one order with this franchise
        $totalCustomers = DB::table('orders')->where('franchise_id', $franchiseId)->distinct('user_id')->count('user_id');
        
        $openTickets = $this->countOpenSupportTickets($franchiseId);

        // 4. 💰 FINANCIALS (Assuming wallet logic exists or aggregating pending payments)
        // Note: Replace 'wallets' with actual wallet table name if different
        $walletBalance = DB::table('franchise_payments')->where('franchise_id', $franchiseId)->where('status', 'Completed')->sum('amount'); // Example calculation
        $pendingPayments = DB::table('orders')->where('franchise_id', $franchiseId)->where('payment_status', 'Unpaid')->sum('total_amount');

        // 5. 📈 GRAPHS DATA (Last 7 Days Sales Trend)
        $last7Days = collect(range(6, 0))->map(function ($daysAgo) use ($franchiseId) {
            $date = Carbon::today()->subDays($daysAgo);
            $sales = DB::table('orders')
                ->where('franchise_id', $franchiseId)
                ->whereDate('created_at', $date)
                ->sum('total_amount');
            return [
                'date' => $date->format('M d'),
                'sales' => (float)$sales
            ];
        });

// 🏆 Top Selling Products (Local to this franchise)
        $topProducts = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('products', 'order_items.product_id', '=', 'products.id') // 👈 Yahan JOIN add kiya
            ->where('orders.franchise_id', $franchiseId)
            ->select('products.name as product_name', DB::raw('SUM(order_items.quantity) as total_sold')) // 👈 Yahan products.name select kiya
            ->groupBy('products.id', 'products.name') // 👈 Grouping by ID & Name
            ->orderByDesc('total_sold')
            ->limit(5)
            ->get();

        return Inertia::render('Franchise/Dashboard', [
            'metrics' => [
                'todaySales' => $todaySales,
                'monthlySales' => $monthlySales,
                'totalOrders' => $orderStats->total_orders ?? 0,
                'pendingOrders' => $orderStats->pending_orders ?? 0,
                'deliveredOrders' => $orderStats->delivered_orders ?? 0,
                'cancelledOrders' => $orderStats->cancelled_orders ?? 0,
                'returnRequests' => $orderStats->return_requests ?? 0,
                'totalStock' => $inventoryStats->total_stock ?? 0,
                'lowStockItems' => $inventoryStats->low_stock_items ?? 0,
                'pendingStockRequests' => $pendingStockRequests,
                'totalCustomers' => $totalCustomers,
                'walletBalance' => $walletBalance,
                'pendingPayments' => $pendingPayments,
                'openTickets' => $openTickets,
            ],
            'charts' => [
                'salesTrend' => $last7Days,
                'topProducts' => $topProducts
            ]
        ]);
    }

    private function countPendingStockRequests(int $franchiseId): int
    {
        if (! Schema::hasTable('stock_requests')) {
            return 0;
        }

        $query = DB::table('stock_requests');

        if (Schema::hasColumn('stock_requests', 'franchise_id')) {
            $query->where('franchise_id', $franchiseId);
        }

        if (Schema::hasColumn('stock_requests', 'status')) {
            $query->whereIn(DB::raw('LOWER(status)'), ['pending']);
        }

        return $query->count();
    }

    private function countOpenSupportTickets(int $franchiseId): int
    {
        if (! Schema::hasTable('support_tickets') || ! Schema::hasColumn('support_tickets', 'status')) {
            return 0;
        }

        $ownerColumn = null;

        if (Schema::hasColumn('support_tickets', 'franchise_id')) {
            $ownerColumn = 'franchise_id';
        } elseif (Schema::hasColumn('support_tickets', 'user_id')) {
            $ownerColumn = 'user_id';
        }

        if (! $ownerColumn) {
            return 0;
        }

        return DB::table('support_tickets')
            ->where($ownerColumn, $franchiseId)
            ->whereIn(DB::raw('LOWER(status)'), [
                'open',
                'in progress',
                'waiting for customer',
                'waiting for reply',
            ])
            ->count();
    }
}
