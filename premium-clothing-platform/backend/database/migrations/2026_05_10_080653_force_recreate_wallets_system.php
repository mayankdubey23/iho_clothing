<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        // 1. Safely drop if any ghost tables exist
        Schema::dropIfExists('wallet_transactions');
        Schema::dropIfExists('wallets');

        // 2. Force Create Wallets Table
        Schema::create('wallets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->decimal('balance', 12, 2)->default(0.00);
            $table->decimal('total_earned', 12, 2)->default(0.00);
            $table->decimal('total_spent', 12, 2)->default(0.00);
            $table->timestamps();
        });

        // 3. Force Create Wallet Transactions Table
        Schema::create('wallet_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wallet_id')->constrained('wallets')->onDelete('cascade');
            $table->enum('type', ['Credit', 'Debit']);
            $table->decimal('amount', 12, 2);
            $table->string('reference_type'); // 'Order', 'Refund', 'Stock Purchase', etc.
            $table->string('reference_id');
            $table->string('description');
            $table->timestamps();
        });

        // 4. Safely check and create Invoices if missing
        if (!Schema::hasTable('invoices')) {
            Schema::create('invoices', function (Blueprint $table) {
                $table->id();
                $table->foreignId('franchise_id')->constrained('users')->onDelete('cascade');
                $table->string('invoice_number')->unique();
                $table->string('reference_type');
                $table->string('reference_id');
                $table->decimal('total_amount', 12, 2);
                $table->string('file_path')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down()
    {
        Schema::dropIfExists('invoices');
        Schema::dropIfExists('wallet_transactions');
        Schema::dropIfExists('wallets');
    }
};