<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class AdminInvoiceController extends Controller
{
    public function index(Request $request)
    {
        $tab = $request->input('tab', 'invoices');
        $search = $request->input('search', '');
        
        $invoices = ['data' => []];
        $taxSettings = null;
        $hasInvoices = Schema::hasTable('invoices');
        $amountColumn = $this->invoiceAmountColumn();
        $taxColumn = Schema::hasColumn('invoices', 'tax_amount') ? 'tax_amount' : null;
        $paymentColumn = Schema::hasColumn('invoices', 'payment_status') ? 'payment_status' : null;

        if ($tab === 'invoices' && $hasInvoices) {
            $invoices = DB::table('invoices')
                ->when($search, function ($query, $search) {
                    $query->where('invoice_number', 'like', "%{$search}%")
                        ->when(Schema::hasColumn('invoices', 'billing_name'), fn ($q) => $q->orWhere('billing_name', 'like', "%{$search}%"))
                        ->when(Schema::hasColumn('invoices', 'reference_id'), fn ($q) => $q->orWhere('reference_id', 'like', "%{$search}%"));
                })
                ->orderBy('created_at', 'desc')
                ->paginate(15)->withQueryString();

            $invoices->getCollection()->transform(fn ($invoice) => $this->normalizeInvoice($invoice));
        } elseif ($tab === 'settings') {
            $taxSettings = Schema::hasTable('tax_settings') ? DB::table('tax_settings')->first() : null;
        }

        $stats = [
            'total_invoiced' => $hasInvoices && $amountColumn
                ? $this->paidInvoiceQuery($paymentColumn)->sum($amountColumn)
                : 0,
            'gst_collected' => $hasInvoices && $taxColumn
                ? $this->paidInvoiceQuery($paymentColumn)->sum($taxColumn)
                : 0,
            'pending_dues' => $hasInvoices && $amountColumn && $paymentColumn
                ? DB::table('invoices')->where($paymentColumn, 'Unpaid')->sum($amountColumn)
                : 0,
        ];

        return Inertia::render('Admin/InvoicesGST', [
            'invoices' => $invoices,
            'taxSettings' => $taxSettings,
            'stats' => $stats,
            'activeTab' => $tab,
            'filters' => ['search' => $search]
        ]);
    }

    // 🚀 Update Tax & Company Settings
    public function updateSettings(Request $request)
    {
        $validated = $request->validate([
            'company_name' => 'required|string',
            'gst_number' => 'nullable|string',
            'invoice_prefix' => 'required|string',
            'default_tax_percentage' => 'required|numeric',
            'billing_address' => 'nullable|string',
        ]);

        abort_unless(Schema::hasTable('tax_settings'), 404, 'Tax settings table is not available.');

        $settings = DB::table('tax_settings')->first();

        if ($settings) {
            DB::table('tax_settings')->where('id', $settings->id)->update($validated);
        } else {
            DB::table('tax_settings')->insert($validated);
        }

        return back()->with('success', 'GST & Billing settings updated successfully.');
    }

    // 🚀 Download / View PDF (Simulated)
    public function downloadPdf($id)
    {
        // Yahan par actual laravel-dompdf ya snappy pdf code aayega.
        // For now, we simulate success.
        return back()->with('success', 'Invoice PDF generation started. Downloading shortly...');
    }

    // 🚀 Send Email (Simulated)
    public function sendEmail($id)
    {
        $invoice = DB::table('invoices')->where('id', $id)->first();
        if(!$invoice) return back()->withErrors('Invoice not found.');
        $invoice = $this->normalizeInvoice($invoice);

        // Actual email logic goes here using Mail::to()
        DB::table('email_logs')->insert([
            'to_email' => 'client@example.com', // Get from user
            'subject' => "Invoice {$invoice->invoice_number} from IHO Clothing",
            'status' => 'Sent',
            'sent_at' => now(),
            'created_at' => now(),
        ]);

        return back()->with('success', "Invoice successfully emailed to {$invoice->billing_name}!");
    }

    private function invoiceAmountColumn(): ?string
    {
        foreach (['final_amount', 'total_amount', 'amount'] as $column) {
            if (Schema::hasColumn('invoices', $column)) {
                return $column;
            }
        }

        return null;
    }

    private function paidInvoiceQuery(?string $paymentColumn)
    {
        $query = DB::table('invoices');

        if ($paymentColumn) {
            $query->where($paymentColumn, 'Paid');
        }

        return $query;
    }

    private function normalizeInvoice(object $invoice): object
    {
        $amountColumn = $this->invoiceAmountColumn();

        $invoice->final_amount = $amountColumn ? ($invoice->{$amountColumn} ?? 0) : 0;
        $invoice->tax_amount = property_exists($invoice, 'tax_amount') ? ($invoice->tax_amount ?? 0) : 0;
        $invoice->payment_status = property_exists($invoice, 'payment_status') ? ($invoice->payment_status ?? 'Paid') : 'Paid';
        $invoice->billing_name = property_exists($invoice, 'billing_name')
            ? ($invoice->billing_name ?: 'IHO Network')
            : ('Franchise #' . ($invoice->franchise_id ?? 'N/A'));
        $invoice->billing_gst = property_exists($invoice, 'billing_gst') ? $invoice->billing_gst : null;
        $invoice->type = property_exists($invoice, 'type')
            ? ($invoice->type ?: 'B2B_Franchise')
            : ($invoice->reference_type ?? 'B2B_Franchise');

        return $invoice;
    }
}
