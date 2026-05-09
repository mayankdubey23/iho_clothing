<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Response;

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

    // 🚀 Export Customer Data (Secure & Sanitized)
    public function exportData()
    {
        // Strict Data Selection: No passwords, no tokens
        $customers = User::where('role', 'customer')
            ->select('id', 'name', 'email', 'mobile_number', 'status', 'created_at')
            ->get()
            ->map(function ($user) {
                return [
                    'Customer ID' => $user->id,
                    'Full Name' => $user->name,
                    'Email Address' => $user->email,
                    'Phone Number' => $user->mobile_number ?? 'N/A',
                    'Account Status' => strtoupper($user->status),
                    'Joined Date' => $user->created_at->format('Y-m-d H:i:s'),
                ];
            });

        $filename = "IHO_Customer_Export_" . date('Ymd') . ".csv";

        $handle = fopen('php://temp', 'w+');
        // Add headers
        fputcsv($handle, ['Customer ID', 'Full Name', 'Email Address', 'Phone Number', 'Account Status', 'Joined Date']);
        
        // Add data
        foreach ($customers as $row) {
            fputcsv($handle, $row);
        }
        
        rewind($handle);
        $csv = stream_get_contents($handle);
        fclose($handle);

        return Response::make($csv, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"$filename\"",
        ]);
    }
}