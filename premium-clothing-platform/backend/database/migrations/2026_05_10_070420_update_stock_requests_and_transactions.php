<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        // 1. Update existing stock_requests for Payment Proof & Amounts
        Schema::table('stock_requests', function (Blueprint $table) {
            if (!Schema::hasColumn('stock_requests', 'total_amount')) {
                $table->decimal('total_amount', 12, 2)->after('franchise_id')->default(0);
            }

            if (!Schema::hasColumn('stock_requests', 'payment_proof')) {
                $table->string('payment_proof')->nullable()->after('status');
            }

            if (!Schema::hasColumn('stock_requests', 'payment_method')) {
                $table->string('payment_method')->default('Bank Transfer')->after('payment_proof');
            }

            // Updating status enum (Laravel 11+ way)
            $table->string('status')->default('Pending')->change(); 
        });

        // 2. Stock Transactions (For precise auditing of stock movement)
        if (!Schema::hasTable('stock_transactions')) {
            Schema::create('stock_transactions', function (Blueprint $table) {
                $table->id();
                $table->foreignId('franchise_id')->nullable()->constrained('users');
                $table->foreignId('product_id')->constrained('products');
                $table->integer('quantity');
                $table->enum('type', ['IN', 'OUT']); // IN from Super Admin, OUT to Customer
                $table->string('reference_type'); // 'StockRequest' or 'Order'
                $table->unsignedBigInteger('reference_id');
                $table->timestamps();
            });
        } else {
            Schema::table('stock_transactions', function (Blueprint $table) {
                if (!Schema::hasColumn('stock_transactions', 'product_id')) {
                    $table->foreignId('product_id')->nullable()->after('franchise_id')->constrained('products');
                }

                if (!Schema::hasColumn('stock_transactions', 'type')) {
                    $table->string('type')->nullable()->after('quantity');
                }

                if (!Schema::hasColumn('stock_transactions', 'reference_type')) {
                    $table->string('reference_type')->nullable()->after('type');
                }

                if (!Schema::hasColumn('stock_transactions', 'reference_id')) {
                    $table->unsignedBigInteger('reference_id')->nullable()->after('reference_type');
                }
            });
        }
    }

    public function down() {
        if (Schema::hasTable('stock_transactions')) {
            Schema::table('stock_transactions', function (Blueprint $table) {
                if (Schema::hasColumn('stock_transactions', 'product_id')) {
                    $table->dropConstrainedForeignId('product_id');
                }

                if (Schema::hasColumn('stock_transactions', 'type')) {
                    $table->dropColumn('type');
                }

                if (Schema::hasColumn('stock_transactions', 'reference_type')) {
                    $table->dropColumn('reference_type');
                }

                if (Schema::hasColumn('stock_transactions', 'reference_id')) {
                    $table->dropColumn('reference_id');
                }
            });
        }
    }
};
