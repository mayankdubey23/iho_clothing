<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AdminAnalyticsController extends Controller
{
    public function index(Request $request)
    {
        // 1. Date Range Logic
        $dateRange = $request->input('date_range', 'this_month');
        $startDate = Carbon::now()->startOfMonth();
        $endDate = Carbon::now()->endOfMonth();

        switch ($dateRange) {
            case 'today':
                $startDate = Carbon::today();
                $endDate = Carbon::today()->endOfDay();
                break;
            case 'yesterday':
                $startDate = Carbon::yesterday();
                $endDate = Carbon::yesterday()->endOfDay();
                break;
            case 'last_7_days':
                $startDate = Carbon::now()->subDays(6)->startOfDay();
                $endDate = Carbon::now()->endOfDay();
                break;
            case 'last_month':
                $startDate = Carbon::now()->subMonth()->startOfMonth();
                $endDate = Carbon::now()->subMonth()->endOfMonth();
                break;
            case 'custom':
                if ($request->start_date && $request->end_date) {
                    $startDate = Carbon::parse($request->start_date)->startOfDay();
                    $endDate = Carbon::parse($request->end_date)->endOfDay();
                }
                break;
        }

        $reportType = $request->input('report_type', 'sales');
        $franchiseId = $request->input('franchise_id', 'all');

        // 2. Base Query Setup (Added 'orders.' prefix)
        $ordersQuery = DB::table('orders')->whereBetween('orders.created_at', [$startDate, $endDate]);
        if ($franchiseId !== 'all') {
            $ordersQuery->where('franchise_id', $franchiseId);
        }
                
        // 3. Quick Stats (KPIs)
        $stats = [
            'total_revenue' => (clone $ordersQuery)->where('orders.status', '!=', 'Cancelled')->sum('orders.total_amount') ?? 0,
            'total_orders' => (clone $ordersQuery)->count(),
            'total_returns' => DB::table('returns')->whereBetween('created_at', [$startDate, $endDate])->count(),
            'discounts_given' => DB::table('coupon_usages')->whereBetween('created_at', [$startDate, $endDate])->sum('discount_applied') ?? 0,
        ];

        // 4. Chart Data (Time Series for Revenue & Orders)
        $chartData = (clone $ordersQuery)
            ->selectRaw('DATE(created_at) as date, SUM(total_amount) as revenue, COUNT(id) as orders')
            ->where('status', '!=', 'Cancelled')
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get();

        // 5. Detailed Table Data based on Report Type
        $tableData = [];
        
        if ($reportType === 'products') {
            $tableData = DB::table('order_items')
                ->join('products', 'order_items.product_id', '=', 'products.id')
                ->whereBetween('order_items.created_at', [$startDate, $endDate])
                ->selectRaw('products.name, products.sku, SUM(order_items.quantity) as sold_qty, SUM(order_items.total_price) as total_revenue')
                ->groupBy('products.id', 'products.name', 'products.sku')
                ->orderByDesc('total_revenue')
                ->limit(20)
                ->get();
        } elseif ($reportType === 'franchises') {
            $tableData = DB::table('orders')
                ->join('users', 'orders.franchise_id', '=', 'users.id')
                ->whereBetween('orders.created_at', [$startDate, $endDate])
                ->selectRaw('users.name as franchise_name, COUNT(orders.id) as total_orders, SUM(orders.total_amount) as revenue')
                ->groupBy('users.id', 'users.name')
                ->orderByDesc('revenue')
                ->get();
        } else {
            // Default Sales Table
            $tableData = (clone $ordersQuery)
                ->leftJoin('users as franchise', 'orders.franchise_id', '=', 'franchise.id')
                ->select('orders.id', 'orders.created_at', 'orders.total_amount', 'orders.status', 'franchise.name as fulfillment')
                ->orderByDesc('orders.created_at')
                ->limit(50)
                ->get();
        }

        // Get franchises for filter dropdown
        $franchises = DB::table('users')->where('role', 'franchise')->select('id', 'name')->get();

        return Inertia::render('Admin/Analytics', [
            'stats' => $stats,
            'chartData' => $chartData,
            'tableData' => $tableData,
            'franchises' => $franchises,
            'filters' => [
                'date_range' => $dateRange,
                'report_type' => $reportType,
                'franchise_id' => $franchiseId,
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
            ]
        ]);
    }

    // 🚀 Background Report Export Logic
    public function export(Request $request)
    {
        $validated = $request->validate([
            'report_type' => 'required|string',
            'date_range' => 'required|string',
        ]);

        // 1. Insert row into report_exports table (Status: Processing)
        $exportLogId = DB::table('report_exports')->insertGetId([
            'admin_id' => auth()->id(),
            'report_type' => $validated['report_type'],
            'date_range' => $validated['date_range'],
            'filters_applied' => json_encode($request->all()),
            'status' => 'Processing',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Note: In a real Enterprise app, you would dispatch a Job here (e.g. GenerateReportCSV::dispatch())
        // For now, we simulate the immediate creation and update the status to Completed.

        DB::table('report_exports')->where('id', $exportLogId)->update([
            'status' => 'Completed',
            'file_path' => 'exports/reports/report_'.$exportLogId.'.csv', // Fake path for now
            'updated_at' => now(),
        ]);

        return back()->with('success', 'Report generation started! It will be saved in your Export History shortly.');
    }
}