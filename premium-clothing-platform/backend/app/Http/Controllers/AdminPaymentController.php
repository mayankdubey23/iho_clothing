<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class AdminPaymentController extends Controller
{
    public function index(Request $request)
    {
        $tab = $request->input('tab', 'customer');
        $search = $request->input('search', '');
        $data = [];

        // 1. Customer Payments (D2C)
        if ($tab === 'customer') {
            $data = Schema::hasTable('payments')
                ? DB::table('payments')
                ->join('orders', 'payments.order_id', '=', 'orders.id')
                ->leftJoin('users', 'payments.user_id', '=', 'users.id')
                ->select('payments.*', 'orders.razorpay_order_id', 'users.name as customer_name', 'users.email')
                ->when($search, fn($q) => $q->where('payments.transaction_id', 'like', "%{$search}%")->orWhere('users.name', 'like', "%{$search}%"))
                ->orderBy('payments.created_at', 'desc')
                ->paginate(15)->withQueryString()
                : $this->emptyPaginator();
        }
        // 2. Franchise Payments (B2B)
        elseif ($tab === 'franchise') {
            $data = Schema::hasTable('franchise_payments')
                ? DB::table('franchise_payments')
                ->join('users', 'franchise_payments.franchise_id', '=', 'users.id')
                ->select('franchise_payments.*', 'users.name as franchise_name')
                ->when($search, fn($q) => $q->where('franchise_payments.reference_number', 'like', "%{$search}%")->orWhere('users.name', 'like', "%{$search}%"))
                ->orderBy('franchise_payments.created_at', 'desc')
                ->paginate(15)->withQueryString()
                : $this->emptyPaginator();
        }
        // 3. Pending COD & Unpaid
        elseif ($tab === 'pending') {
            $data = Schema::hasTable('payments')
                ? DB::table('payments')
                ->join('orders', 'payments.order_id', '=', 'orders.id')
                ->leftJoin('users', 'payments.user_id', '=', 'users.id')
                ->select('payments.*', 'orders.razorpay_order_id', 'users.name as customer_name')
                ->whereIn('payments.status', ['COD Pending', 'Pending'])
                ->orderBy('payments.created_at', 'desc')
                ->paginate(15)->withQueryString()
                : $this->emptyPaginator();
        }
        // 4. Wallet Transactions
        elseif ($tab === 'wallets') {
            $walletUserColumn = Schema::hasColumn('wallets', 'user_id') ? 'user_id' : 'franchise_id';

            $data = Schema::hasTable('wallet_transactions')
                ? DB::table('wallet_transactions')
                ->join('wallets', 'wallet_transactions.wallet_id', '=', 'wallets.id')
                ->join('users', "wallets.{$walletUserColumn}", '=', 'users.id')
                ->select('wallet_transactions.*', 'users.name as user_name', 'users.role')
                ->orderBy('wallet_transactions.created_at', 'desc')
                ->paginate(15)->withQueryString()
                : $this->emptyPaginator();
        }

        // Global Finance Stats
        $stats = [
            'total_online' => Schema::hasTable('payments')
                ? DB::table('payments')->where('method', 'Online')->where('status', 'Paid')->sum('amount')
                : 0,
            'pending_cod' => Schema::hasTable('payments')
                ? DB::table('payments')->where('status', 'COD Pending')->sum('amount')
                : 0,
            'franchise_revenue' => Schema::hasTable('franchise_payments')
                ? DB::table('franchise_payments')->where('status', 'Paid')->sum('amount')
                : 0,
        ];

        return Inertia::render('Admin/Payments', [
            'tabData' => $data,
            'activeTab' => $tab,
            'stats' => $stats,
            'filters' => ['search' => $search]
        ]);
    }

    // 🚀 Update Payment Status (e.g. Mark COD as Paid)
    public function updateStatus(Request $request, $id)
    {
        $request->validate(['status' => 'required|string', 'type' => 'required|string']);

        if ($request->type === 'customer' && Schema::hasTable('payments')) {
            DB::table('payments')->where('id', $id)->update(['status' => $request->status, 'updated_at' => now()]);
        } elseif (Schema::hasTable('franchise_payments')) {
            DB::table('franchise_payments')->where('id', $id)->update(['status' => $request->status, 'updated_at' => now()]);
        }

        return back()->with('success', "Payment status updated to {$request->status}");
    }

    private function emptyPaginator()
    {
        return new \Illuminate\Pagination\LengthAwarePaginator([], 0, 15);
    }
}
