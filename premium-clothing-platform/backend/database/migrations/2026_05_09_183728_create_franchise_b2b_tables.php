<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        // 1. Franchise Local Inventory
        if (!Schema::hasTable('franchise_inventory')) {
            Schema::create('franchise_inventory', function (Blueprint $table) {
                $table->id();
                $table->foreignId('franchise_id')->constrained('users')->onDelete('cascade');
                // Assuming you have a products table. If not, remove the constrained() part temporarily.
                $table->unsignedBigInteger('product_id'); 
                $table->integer('quantity')->default(0);
                $table->integer('low_stock_threshold')->default(5);
                $table->timestamps();
            });
        }

        // 2. Stock Requests (When Franchise asks for more stock from Super Admin)
        if (!Schema::hasTable('stock_requests')) {
            Schema::create('stock_requests', function (Blueprint $table) {
                $table->id();
                $table->string('request_number')->unique();
                $table->foreignId('franchise_id')->constrained('users')->onDelete('cascade');
                $table->enum('status', ['Pending', 'Approved', 'Rejected', 'Delivered'])->default('Pending');
                $table->text('admin_notes')->nullable();
                $table->timestamps();
            });
        }

        // 3. Franchise Wallet / Payments (For B2B Billing)
        if (!Schema::hasTable('franchise_payments')) {
            Schema::create('franchise_payments', function (Blueprint $table) {
                $table->id();
                $table->foreignId('franchise_id')->constrained('users')->onDelete('cascade');
                $table->decimal('amount', 12, 2);
                $table->enum('type', ['Wallet Recharge', 'Stock Purchase', 'Profit Payout']);
                $table->enum('status', ['Pending', 'Completed', 'Failed'])->default('Pending');
                $table->string('transaction_id')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down()
    {
        Schema::dropIfExists('franchise_payments');
        Schema::dropIfExists('stock_requests');
        Schema::dropIfExists('franchise_inventory');
    }
};