<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        // 1. Tax & GST Settings
        Schema::create('tax_settings', function (Blueprint $table) {
            $table->id();
            $table->string('company_name');
            $table->string('gst_number')->nullable();
            $table->string('invoice_prefix')->default('IHO-'); // e.g. IHO-2026-001
            $table->decimal('default_tax_percentage', 5, 2)->default(18.00); // 18% GST
            $table->text('billing_address')->nullable();
            $table->timestamps();
        });

        // 2. Invoices Master Table
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->string('invoice_number')->unique();
            $table->enum('type', ['B2C_Order', 'B2B_Franchise']);
            $table->foreignId('order_id')->nullable()->constrained('orders')->onDelete('cascade');
            $table->foreignId('franchise_payment_id')->nullable()->constrained('franchise_payments')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users'); // Customer or Franchise ID
            $table->string('billing_name');
            $table->string('billing_gst')->nullable(); // If B2B franchise has their own GST
            
            // Financial Breakdowns
            $table->decimal('subtotal', 10, 2);
            $table->decimal('tax_percentage', 5, 2);
            $table->decimal('tax_amount', 10, 2);
            $table->decimal('discount_amount', 10, 2)->default(0);
            $table->decimal('delivery_charges', 10, 2)->default(0);
            $table->decimal('final_amount', 10, 2);
            
            $table->enum('payment_status', ['Unpaid', 'Paid', 'Refunded', 'Cancelled'])->default('Unpaid');
            $table->string('pdf_path')->nullable(); // Path to saved PDF
            $table->timestamps();
        });

        // 3. Invoice Items (Specific products on the bill)
        Schema::create('invoice_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invoice_id')->constrained('invoices')->onDelete('cascade');
            $table->string('product_name');
            $table->string('hsn_code')->nullable();
            $table->integer('quantity');
            $table->decimal('unit_price', 10, 2);
            $table->decimal('tax_amount', 10, 2); // Tax per item
            $table->decimal('total_price', 10, 2);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('invoice_items');
        Schema::dropIfExists('invoices');
        Schema::dropIfExists('tax_settings');
    }
};