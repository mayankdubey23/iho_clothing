<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

class AdminAnalyticsController extends Controller
{
    public function index(Request $request)
    {
        $report = $this->buildReport($request, false);
        $franchises = DB::table('users')->where('role', 'franchise')->select('id', 'name')->get();

        return Inertia::render('Admin/Analytics', [
            'stats' => $report['stats'],
            'chartData' => $report['chartData'],
            'tableData' => $report['tableData'],
            'franchises' => $franchises,
            'filters' => $report['filters'],
        ]);
    }

    public function export(Request $request)
    {
        $request->validate([
            'report_type' => 'nullable|in:sales,products,franchises',
            'date_range' => 'nullable|in:today,yesterday,last_7_days,this_month,last_month,custom',
            'franchise_id' => 'nullable',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'format' => 'required|in:csv,pdf',
        ]);

        $report = $this->buildReport($request, true);
        $filename = $this->exportFilename($report['filters']['report_type'], $request->input('format'));

        if ($request->input('format') === 'pdf') {
            $this->logExport($request, $filename, 'Completed');

            return Response::make($this->buildPdf($report), 200, [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            ]);
        }

        $this->logExport($request, $filename, 'Completed');

        return response()->streamDownload(function () use ($report) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, [$report['brand'], $report['title']]);
            fputcsv($handle, ['Generated At', now()->format('d M Y h:i A')]);
            fputcsv($handle, ['Period', $report['period']]);
            fputcsv($handle, ['Franchise', $report['franchiseLabel']]);
            fputcsv($handle, []);
            fputcsv($handle, ['Metric', 'Value']);
            fputcsv($handle, ['Net Revenue', $report['stats']['total_revenue']]);
            fputcsv($handle, ['Total Orders', $report['stats']['total_orders']]);
            fputcsv($handle, ['Discounts Claimed', $report['stats']['discounts_given']]);
            fputcsv($handle, ['Returns Processed', $report['stats']['total_returns']]);
            fputcsv($handle, []);
            fputcsv($handle, $report['headers']);

            foreach ($report['rows'] as $row) {
                fputcsv($handle, $row);
            }

            fclose($handle);
        }, $filename, ['Content-Type' => 'text/csv']);
    }

    private function buildReport(Request $request, bool $forExport): array
    {
        [$startDate, $endDate] = $this->resolveDateRange($request);
        $dateRange = $request->input('date_range', 'this_month');
        $reportType = $request->input('report_type', 'sales');
        $franchiseId = $request->input('franchise_id', 'all');
        $limit = $forExport ? 5000 : 50;

        $ordersQuery = DB::table('orders')->whereBetween('orders.created_at', [$startDate, $endDate]);

        if ($franchiseId !== 'all' && Schema::hasColumn('orders', 'franchise_id')) {
            $ordersQuery->where('orders.franchise_id', $franchiseId);
        }

        $activeOrdersQuery = (clone $ordersQuery)->whereRaw("LOWER(COALESCE(orders.status, '')) NOT IN ('cancelled', 'canceled')");

        $stats = [
            'total_revenue' => (float) (clone $activeOrdersQuery)->sum('orders.total_amount'),
            'total_orders' => (int) (clone $ordersQuery)->count(),
            'total_returns' => Schema::hasTable('returns') ? (int) DB::table('returns')->whereBetween('created_at', [$startDate, $endDate])->count() : 0,
            'discounts_given' => Schema::hasTable('coupon_usages') ? (float) DB::table('coupon_usages')->whereBetween('created_at', [$startDate, $endDate])->sum('discount_applied') : 0,
        ];

        $chartData = (clone $activeOrdersQuery)
            ->selectRaw('DATE(orders.created_at) as date, SUM(orders.total_amount) as revenue, COUNT(orders.id) as orders')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        [$tableData, $headers, $rows, $title] = $this->tableReport($reportType, $startDate, $endDate, $franchiseId, $limit);

        $franchiseLabel = 'Entire Network';
        if ($franchiseId !== 'all') {
            $franchiseLabel = DB::table('users')->where('id', $franchiseId)->value('name') ?: 'Selected Franchise';
        }

        return [
            'brand' => $this->brandName(),
            'title' => $title,
            'period' => $startDate->format('d M Y') . ' - ' . $endDate->format('d M Y'),
            'franchiseLabel' => $franchiseLabel,
            'stats' => $stats,
            'chartData' => $chartData,
            'tableData' => $tableData,
            'headers' => $headers,
            'rows' => $rows,
            'filters' => [
                'date_range' => $dateRange,
                'report_type' => $reportType,
                'franchise_id' => $franchiseId,
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
            ],
        ];
    }

    private function resolveDateRange(Request $request): array
    {
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

        return [$startDate, $endDate];
    }

    private function tableReport(string $reportType, Carbon $startDate, Carbon $endDate, mixed $franchiseId, int $limit): array
    {
        if ($reportType === 'products') {
            $revenueExpression = Schema::hasColumn('order_items', 'total_price')
                ? 'SUM(order_items.total_price)'
                : 'SUM(order_items.quantity * order_items.price)';
            $skuSelect = Schema::hasColumn('products', 'sku') ? 'products.sku' : "'' as sku";
            $skuGroup = Schema::hasColumn('products', 'sku') ? ', products.sku' : '';

            $query = DB::table('order_items')
                ->join('products', 'order_items.product_id', '=', 'products.id')
                ->join('orders', 'order_items.order_id', '=', 'orders.id')
                ->whereBetween('orders.created_at', [$startDate, $endDate])
                ->whereRaw("LOWER(COALESCE(orders.status, '')) NOT IN ('cancelled', 'canceled')");

            if ($franchiseId !== 'all' && Schema::hasColumn('orders', 'franchise_id')) {
                $query->where('orders.franchise_id', $franchiseId);
            }

            $tableData = $query
                ->selectRaw("products.name, {$skuSelect}, SUM(order_items.quantity) as sold_qty, {$revenueExpression} as total_revenue")
                ->groupByRaw('products.id, products.name' . $skuGroup)
                ->orderByDesc('total_revenue')
                ->limit($limit)
                ->get();

            return [
                $tableData,
                ['Product Name', 'SKU', 'Units Sold', 'Generated Revenue'],
                $tableData->map(fn ($row) => [$row->name, $row->sku, $row->sold_qty, number_format((float) $row->total_revenue, 2, '.', '')])->all(),
                'Product Performance Report',
            ];
        }

        if ($reportType === 'franchises') {
            $tableData = DB::table('orders')
                ->join('users', 'orders.franchise_id', '=', 'users.id')
                ->whereBetween('orders.created_at', [$startDate, $endDate])
                ->whereRaw("LOWER(COALESCE(orders.status, '')) NOT IN ('cancelled', 'canceled')")
                ->selectRaw('users.name as franchise_name, COUNT(orders.id) as total_orders, SUM(orders.total_amount) as revenue')
                ->groupBy('users.id', 'users.name')
                ->orderByDesc('revenue')
                ->limit($limit)
                ->get();

            return [
                $tableData,
                ['Franchise Partner', 'Total Orders', 'Total Revenue'],
                $tableData->map(fn ($row) => [$row->franchise_name, $row->total_orders, number_format((float) $row->revenue, 2, '.', '')])->all(),
                'Franchise Performance Report',
            ];
        }

        $query = DB::table('orders')
            ->leftJoin('users as franchise', 'orders.franchise_id', '=', 'franchise.id')
            ->whereBetween('orders.created_at', [$startDate, $endDate]);

        if ($franchiseId !== 'all' && Schema::hasColumn('orders', 'franchise_id')) {
            $query->where('orders.franchise_id', $franchiseId);
        }

        $tableData = $query
            ->select('orders.id', 'orders.created_at', 'orders.total_amount', 'orders.status', 'franchise.name as fulfillment')
            ->orderByDesc('orders.created_at')
            ->limit($limit)
            ->get();

        return [
            $tableData,
            ['Order ID', 'Date', 'Fulfillment Route', 'Status', 'Order Value'],
            $tableData->map(fn ($row) => [
                'ORD-' . $row->id,
                Carbon::parse($row->created_at)->format('d M Y'),
                $row->fulfillment ?: 'Master Stock',
                $row->status,
                number_format((float) $row->total_amount, 2, '.', ''),
            ])->all(),
            'Overall Sales Report',
        ];
    }

    private function buildPdf(array $report): string
    {
        $lines = [
            $report['brand'],
            $report['title'],
            'Generated: ' . now()->format('d M Y h:i A'),
            'Period: ' . $report['period'],
            'Franchise: ' . $report['franchiseLabel'],
            '',
            'Summary',
            'Net Revenue: INR ' . number_format($report['stats']['total_revenue'], 2),
            'Total Orders: ' . $report['stats']['total_orders'],
            'Discounts Claimed: INR ' . number_format($report['stats']['discounts_given'], 2),
            'Returns Processed: ' . $report['stats']['total_returns'],
            '',
            implode(' | ', $report['headers']),
            str_repeat('-', 108),
        ];

        foreach ($report['rows'] as $row) {
            $lines[] = $this->wrapPdfLine(implode(' | ', array_map(fn ($value) => (string) $value, $row)));
        }

        return $this->simplePdf($lines);
    }

    private function simplePdf(array $rawLines): string
    {
        $lines = [];
        foreach ($rawLines as $line) {
            foreach (explode("\n", (string) $line) as $part) {
                $lines[] = $part;
            }
        }

        $pageLines = array_chunk($lines, 44);
        $objects = [];
        $objects[] = '<< /Type /Catalog /Pages 2 0 R >>';
        $kids = [];
        $fontObjectNumber = 3;
        $nextObjectNumber = 4;

        foreach ($pageLines as $pageIndex => $page) {
            $pageObjectNumber = $nextObjectNumber++;
            $contentObjectNumber = $nextObjectNumber++;
            $kids[] = "{$pageObjectNumber} 0 R";

            $content = "0.91 0.31 0.24 rg\n50 790 120 28 re f\nBT /F1 16 Tf 58 799 Td 1 1 1 rg (IHO) Tj ET\n";
            $content .= "BT /F1 8 Tf 50 760 Td 0 0 0 rg\n";
            foreach ($page as $line) {
                $content .= '(' . $this->pdfEscape($line) . ") Tj T*\n";
            }
            $content .= "ET\nBT /F1 8 Tf 500 30 Td 0.45 0.45 0.45 rg (Page " . ($pageIndex + 1) . ') Tj ET';

            $objects[$pageObjectNumber - 1] = "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 {$fontObjectNumber} 0 R >> >> /Contents {$contentObjectNumber} 0 R >>";
            $objects[$contentObjectNumber - 1] = "<< /Length " . strlen($content) . " >>\nstream\n{$content}\nendstream";
        }

        $objects[1] = '<< /Type /Pages /Kids [' . implode(' ', $kids) . '] /Count ' . count($kids) . ' >>';
        $objects[$fontObjectNumber - 1] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>';
        ksort($objects);

        $pdf = "%PDF-1.4\n";
        $offsets = [0];
        foreach ($objects as $index => $object) {
            $number = $index + 1;
            $offsets[$number] = strlen($pdf);
            $pdf .= "{$number} 0 obj\n{$object}\nendobj\n";
        }

        $xrefOffset = strlen($pdf);
        $pdf .= "xref\n0 " . (count($objects) + 1) . "\n0000000000 65535 f \n";
        for ($i = 1; $i <= count($objects); $i++) {
            $pdf .= str_pad((string) $offsets[$i], 10, '0', STR_PAD_LEFT) . " 00000 n \n";
        }
        $pdf .= "trailer\n<< /Size " . (count($objects) + 1) . " /Root 1 0 R >>\nstartxref\n{$xrefOffset}\n%%EOF";

        return $pdf;
    }

    private function wrapPdfLine(string $line): string
    {
        return wordwrap($line, 112, "\n", true);
    }

    private function pdfEscape(string $value): string
    {
        return str_replace(['\\', '(', ')', "\r"], ['\\\\', '\(', '\)', ''], $value);
    }

    private function exportFilename(string $reportType, string $format): string
    {
        return 'IHO_' . ucfirst($reportType) . '_Report_' . now()->format('Ymd_His') . '.' . $format;
    }

    private function brandName(): string
    {
        if (Schema::hasTable('storefront_settings')) {
            return DB::table('storefront_settings')->where('key', 'site_brand_name')->value('value') ?: 'IHO STUDIO';
        }

        return 'IHO STUDIO';
    }

    private function logExport(Request $request, string $filename, string $status): void
    {
        if (! Schema::hasTable('report_exports')) {
            return;
        }

        DB::table('report_exports')->insert([
            'admin_id' => auth()->id(),
            'report_type' => $request->input('report_type', 'sales'),
            'date_range' => $request->input('date_range', 'this_month'),
            'filters_applied' => json_encode($request->except(['_token'])),
            'status' => $status,
            'file_path' => $filename,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
