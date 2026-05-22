<?php

namespace App\Http\Controllers\Franchise;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class WalletController extends Controller
{
    public function index()
    {
        $franchiseId = Auth::id();

        // 1. Ensure Wallet Exists (Create if missing)
        $wallet = DB::table('wallets')->where('user_id', $franchiseId)->first();
        if (!$wallet) {
            $walletId = DB::table('wallets')->insertGetId([
                'user_id' => $franchiseId,
                'balance' => 0,
                'created_at' => now(),
                'updated_at' => now()
            ]);
            $wallet = DB::table('wallets')->where('id', $walletId)->first();
        }

        // 2. High-Level Metrics Calculations
        $totalSales = DB::table('orders')
            ->where('franchise_id', $franchiseId)
            ->whereIn('status', ['Delivered', 'Shipped'])
            ->sum('total_amount');

        $stockPaymentsMade = DB::table('stock_requests')
            ->where('franchise_id', $franchiseId)
            ->whereIn('status', ['Paid', 'Completed', 'Dispatched'])
            ->sum('total_amount');

        // Rough Profit Margin (Sales - Stock Cost). In real production, this is calculated per item.
        $totalProfit = $totalSales - $stockPaymentsMade;

        $pendingDues = DB::table('stock_requests')
            ->where('franchise_id', $franchiseId)
            ->where('status', 'Approved') // Approved but not yet paid/completed
            ->sum('total_amount');

        // 3. Passbook / Ledger Transactions
        $transactions = DB::table('wallet_transactions')
            ->where('wallet_id', $wallet->id)
            ->orderBy('created_at', 'desc')
            ->paginate(10, ['*'], 'transactions_page');

        // 4. Payments Made to Super Admin
        $paymentsToAdmin = DB::table('franchise_payments')
            ->where('franchise_id', $franchiseId)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        // 5. Invoices
        $invoices = DB::table('invoices')
            ->where('franchise_id', $franchiseId)
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        return Inertia::render('Franchise/Wallet', [
            'wallet' => $wallet,
            'metrics' => [
                'totalSales' => $totalSales,
                'totalProfit' => $totalProfit,
                'stockPayments' => $stockPaymentsMade,
                'pendingDues' => $pendingDues
            ],
            'transactions' => $transactions,
            'payments' => $paymentsToAdmin,
            'invoices' => $invoices
        ]);
    }
}