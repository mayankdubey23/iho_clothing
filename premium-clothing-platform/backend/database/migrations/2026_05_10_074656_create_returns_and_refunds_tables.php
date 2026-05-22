<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        // 1. Returns Master Table
        Schema::create('returns', function (Blueprint $table) {
            $table->id();
            $table->string('return_number')->unique();
            $table->foreignId('order_id')->constrained('orders')->onDelete('cascade');
            $table->foreignId('franchise_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->enum('return_type', ['Refund', 'Replacement']);
            $table->string('reason');
            $table->text('customer_notes')->nullable();
            $table->text('franchise_notes')->nullable(); // Notes on product condition
            $table->enum('status', [
                'Requested', 'Pickup Scheduled', 'Item Received', 
                'Forwarded to Admin', 'Completed', 'Rejected'
            ])->default('Requested');
            $table->timestamps();
        });

        // 2. Return Items (What exactly is being returned)
        Schema::create('return_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('return_id')->constrained('returns')->onDelete('cascade');
            $table->foreignId('product_id')->constrained('products');
            $table->foreignId('variant_id')->nullable()->constrained('product_variants');
            $table->integer('quantity');
            $table->enum('condition', ['Pending', 'Sellable', 'Damaged'])->default('Pending');
            $table->timestamps();
        });

        // 3. Refunds Ledger (Handled mostly by Super Admin later)
        Schema::create('refunds', function (Blueprint $table) {
            $table->id();
            $table->foreignId('return_id')->constrained('returns')->onDelete('cascade');
            $table->foreignId('order_id')->constrained('orders');
            $table->decimal('amount', 10, 2);
            $table->enum('status', ['Pending', 'Approved', 'Processed', 'Rejected'])->default('Pending');
            $table->string('transaction_reference')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('refunds');
        Schema::dropIfExists('return_items');
        Schema::dropIfExists('returns');
    }
};