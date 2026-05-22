<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        if (! Schema::hasTable('payments')) {
            Schema::create('payments', function (Blueprint $table) {
                $table->id();
                $table->foreignId('order_id')->constrained('orders')->onDelete('cascade');
                $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
                $table->decimal('amount', 10, 2);
                $table->enum('method', ['Online', 'COD', 'Wallet'])->default('Online');
                $table->enum('status', ['Pending', 'Paid', 'Failed', 'Refunded', 'Partially Refunded', 'COD Pending'])->default('Pending');
                $table->string('transaction_id')->nullable();
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('franchise_payments')) {
            Schema::create('franchise_payments', function (Blueprint $table) {
                $table->id();
                $table->foreignId('franchise_id')->constrained('users')->cascadeOnDelete();
                $table->foreignId('stock_request_id')->nullable();
                $table->decimal('amount', 10, 2);
                $table->enum('type', ['Stock Purchase', 'Wallet Recharge', 'Settlement'])->default('Stock Purchase');
                $table->enum('method', ['Bank Transfer', 'Online', 'Wallet'])->default('Bank Transfer');
                $table->enum('status', ['Pending', 'Paid', 'Failed', 'Refunded'])->default('Pending');
                $table->string('reference_number')->nullable();
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('wallets')) {
            Schema::create('wallets', function (Blueprint $table) {
                $table->id();
                $table->foreignId('franchise_id')->constrained('users')->onDelete('cascade');
                $table->decimal('balance', 10, 2)->default(0);
                $table->decimal('total_earned', 10, 2)->default(0);
                $table->decimal('pending_dues', 10, 2)->default(0);
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('wallet_transactions')) {
            Schema::create('wallet_transactions', function (Blueprint $table) {
                $table->id();
                $table->foreignId('wallet_id')->constrained('wallets')->onDelete('cascade');
                $table->enum('type', ['credit', 'debit']);
                $table->decimal('amount', 10, 2);
                $table->string('description');
                $table->string('reference_id')->nullable();
                $table->timestamps();
            });
        }

        $this->syncOrderPayments();
    }

    public function down()
    {
        Schema::dropIfExists('wallet_transactions');
        Schema::dropIfExists('franchise_payments');
        Schema::dropIfExists('payments');
        // Wallets drop omitted to prevent accidental loss if shared
    }

    private function syncOrderPayments(): void
    {
        if (! Schema::hasTable('orders') || ! Schema::hasTable('payments')) {
            return;
        }

        $orders = DB::table('orders')->select([
            'id',
            'total_amount',
            'payment_method',
            'payment_status',
            'razorpay_payment_id',
            'created_at',
            'updated_at',
        ])->get();

        foreach ($orders as $order) {
            $method = strtolower((string) $order->payment_method) === 'cod' ? 'COD' : 'Online';
            $status = match (strtolower((string) $order->payment_status)) {
                'success', 'captured', 'paid' => 'Paid',
                'failed' => 'Failed',
                default => $method === 'COD' ? 'COD Pending' : 'Pending',
            };

            DB::table('payments')->updateOrInsert(
                ['order_id' => $order->id],
                [
                    'user_id' => null,
                    'amount' => $order->total_amount,
                    'method' => $method,
                    'status' => $status,
                    'transaction_id' => $order->razorpay_payment_id,
                    'created_at' => $order->created_at ?? now(),
                    'updated_at' => $order->updated_at ?? now(),
                ]
            );
        }
    }
};
