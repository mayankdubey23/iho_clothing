<?php

namespace App\Http\Controllers\Franchise;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class AnalyticsController extends Controller
{
    public function index(Request $request)
    {
        $franchiseId = Auth::id(); // 🛡️ STRICT ISOLATION

        // 1. Time Filters Logic
        $dateFilter = $request->input('dateFilter', 'this_month');
        $startDate = $this->getStartDate($dateFilter);
        $endDate = now();

        // 2. High-Level KPI Cards (Sales, Orders, Profit)
        $salesData = DB::table('orders')
            ->where('franchise_id', $franchiseId)
            ->whereIn('status', ['Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'])
            ->whereBetween('created_at', [$startDate, $endDate])
            ->selectRaw('COUNT(id) as total_orders, SUM(total_amount) as total_revenue')
            ->first();

        // Total B2B spend (Stock Requests) in this period
        $b2bSpend = DB::table('stock_requests')
            ->where('franchise_id', $franchiseId)
            ->where('status', 'Completed')
            ->whereBetween('updated_at', [$startDate, $endDate])
            ->sum('total_amount');

        $estProfit = ($salesData->total_revenue ?? 0) - $b2bSpend;

        // 3. Top Selling Products (Order Items aggregation)
        $topProducts = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->where('orders.franchise_id', $franchiseId)
            ->whereBetween('orders.created_at', [$startDate, $endDate])
            ->select('products.name', 'products.sku', DB::raw('SUM(order_items.quantity) as sold_qty'), DB::raw('SUM(order_items.total_price) as revenue'))
            ->groupBy('products.id', 'products.name', 'products.sku')
            ->orderBy('sold_qty', 'desc')
            ->limit(5)
            ->get();

        // 4. Order Status Distribution (For Donut Chart)
        $orderStatuses = DB::table('orders')
            ->where('franchise_id', $franchiseId)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->select('status', DB::raw('COUNT(id) as count'))
            ->groupBy('status')
            ->get();

        // 5. Recent Returns Activity
        $returnsData = DB::table('returns')
            ->where('franchise_id', $franchiseId)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->select('status', DB::raw('COUNT(id) as count'))
            ->groupBy('status')
            ->get();

        // 6. Current Inventory Health Snapshot
        $inventoryHealth = [
            'healthy' => DB::table('franchise_inventory')->where('franchise_id', $franchiseId)->whereRaw('quantity > low_stock_threshold')->count(),
            'low' => DB::table('franchise_inventory')->where('franchise_id', $franchiseId)->whereRaw('quantity <= low_stock_threshold')->where('quantity', '>', 0)->count(),
            'out' => DB::table('franchise_inventory')->where('franchise_id', $franchiseId)->where('quantity', 0)->count(),
        ];

        return Inertia::render('Franchise/Analytics', [
            'kpis' => [
                'revenue' => $salesData->total_revenue ?? 0,
                'orders' => $salesData->total_orders ?? 0,
                'profit' => $estProfit,
                'b2b_spend' => $b2bSpend
            ],
            'topProducts' => $topProducts,
            'orderStatuses' => $orderStatuses,
            'inventoryHealth' => $inventoryHealth,
            'returnsData' => $returnsData,
            'filters' => [
                'dateFilter' => $dateFilter
            ]
        ]);
    }

    // Helper function for date ranges
    private function getStartDate($filter)
    {
        switch ($filter) {
            case 'today': return Carbon::today();
            case 'yesterday': return Carbon::yesterday();
            case 'last_7_days': return Carbon::now()->subDays(7);
            case 'this_month': return Carbon::now()->startOfMonth();
            case 'last_month': return Carbon::now()->subMonth()->startOfMonth();
            // Custom date ranges can be added later
            default: return Carbon::now()->startOfMonth(); 
        }
    }
}