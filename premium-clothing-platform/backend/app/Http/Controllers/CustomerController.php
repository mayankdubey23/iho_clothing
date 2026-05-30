<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\StreamedResponse;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
        // 🚀 SECURE FETCH: Only select non-sensitive columns
        // Using withCount to get orders & tickets without loading all records into memory
        $customers = User::where('role', 'customer')
            ->select('id', 'name', 'email', 'mobile_number', 'status', 'created_at')
            ->withCount(['orders', 'supportTickets']) // Assumes relations 'orders' & 'supportTickets' exist in User model
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%")
                      ->orWhere('mobile_number', 'like', "%{$search}%");
            })
            ->when($request->status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        $stats = [
            'total' => User::where('role', 'customer')->count(),
            'active' => User::where('role', 'customer')->where('status', 'active')->count(),
            'blocked' => User::where('role', 'customer')->where('status', 'blocked')->count(),
            'total_orders' => DB::table('orders')->count(), // Network wide orders
        ];

        return Inertia::render('Admin/Customers', [
            'customers' => $customers,
            'stats' => $stats,
            'filters' => $request->only(['search', 'status'])
        ]);
    }

    // 🚀 Block / Unblock Customer
    public function toggleStatus($id)
    {
        $user = User::where('role', 'customer')->findOrFail($id);
        $user->status = ($user->status === 'active') ? 'blocked' : 'active';
        $user->save();

        $action = $user->status === 'blocked' ? 'Suspended' : 'Reactivated';
        return back()->with('success', "Customer Account {$action} Successfully.");
    }

    // 🚀 View Full Customer Profile
    public function show($id)
    {
        // Customer ki poori history fetch kar rahe hain
        $customer = \App\Models\User::with([
            'orders' => function($query) {
                $query->orderBy('created_at', 'desc')->take(5); // Latest 5 orders
            },
            'supportTickets' => function($query) {
                $query->orderBy('created_at', 'desc')->take(5); // Latest 5 tickets
            }
        ])
        ->where('role', 'customer')
        ->findOrFail($id);

        // Frontend par data bhej rahe hain
        return Inertia::render('Admin/CustomerProfile', [
            'customer' => $customer
        ]);
    }

    // 🚀 Export Customers Data to CSV (Streamed directly to avoid Windows temp file locks)
    public function export()
    {
        $fileName = 'customers_export_' . date('Y-m-d_H-i-s') . '.csv';
        
        // Fetch customers
        $customers = User::where('role', 'customer')->orderBy('created_at', 'desc')->get();

        $headers = [
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=$fileName",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        // Column headings for CSV
        $columns = ['Customer ID', 'Full Name', 'Email Address', 'Mobile Number', 'Status', 'Registered On'];

        $callback = function() use($customers, $columns) {
            // Write directly to output buffer (bypasses temp files completely)
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);

            foreach ($customers as $customer) {
                fputcsv($file, [
                    $customer->id,
                    $customer->name,
                    $customer->email,
                    $customer->mobile_number ?? 'N/A',
                    $customer->status ?? 'Active',
                    $customer->created_at ? $customer->created_at->format('Y-m-d H:i:s') : 'N/A'
                ]);
            }

            fclose($file);
        };

        return new StreamedResponse($callback, 200, $headers);
    }
}