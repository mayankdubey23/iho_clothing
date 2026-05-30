<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (Schema::hasTable('inventories')) {
            Schema::table('inventories', function (Blueprint $table) {
                if (! Schema::hasColumn('inventories', 'franchise_id')) {
                    $table->foreignId('franchise_id')->nullable()->after('sku_id')->constrained('users')->nullOnDelete();
                }
                if (! Schema::hasColumn('inventories', 'damaged_quantity')) {
                    $table->integer('damaged_quantity')->default(0)->after('stock_quantity');
                }
            });
        }

        if (! Schema::hasTable('stock_requests')) {
            Schema::create('stock_requests', function (Blueprint $table) {
                $table->id();
                $table->string('request_number')->nullable()->unique();
                $table->foreignId('franchise_id')->constrained('users')->cascadeOnDelete();
                $table->foreignId('sku_id')->nullable()->constrained('skus')->nullOnDelete();
                $table->integer('quantity')->default(0);
                $table->decimal('total_amount', 12, 2)->default(0);
                $table->string('status')->default('pending');
                $table->string('payment_status')->default('unpaid');
                $table->string('payment_method')->nullable();
                $table->string('payment_proof')->nullable();
                $table->text('admin_notes')->nullable();
                $table->timestamps();
            });
        } else {
            Schema::table('stock_requests', function (Blueprint $table) {
                if (! Schema::hasColumn('stock_requests', 'request_number')) {
                    $table->string('request_number')->nullable()->unique()->after('id');
                }
                if (! Schema::hasColumn('stock_requests', 'sku_id')) {
                    $table->foreignId('sku_id')->nullable()->after('franchise_id')->constrained('skus')->nullOnDelete();
                }
                if (! Schema::hasColumn('stock_requests', 'quantity')) {
                    $table->integer('quantity')->default(0)->after('sku_id');
                }
                if (! Schema::hasColumn('stock_requests', 'total_amount')) {
                    $table->decimal('total_amount', 12, 2)->default(0)->after('quantity');
                }
                if (! Schema::hasColumn('stock_requests', 'payment_status')) {
                    $table->string('payment_status')->default('unpaid')->after('status');
                }
                if (! Schema::hasColumn('stock_requests', 'payment_method')) {
                    $table->string('payment_method')->nullable()->after('payment_status');
                }
                if (! Schema::hasColumn('stock_requests', 'payment_proof')) {
                    $table->string('payment_proof')->nullable()->after('payment_method');
                }
                if (! Schema::hasColumn('stock_requests', 'admin_notes')) {
                    $table->text('admin_notes')->nullable()->after('payment_proof');
                }
            });

            if (Schema::getConnection()->getDriverName() === 'mysql') {
                DB::statement("ALTER TABLE stock_requests MODIFY status VARCHAR(40) NOT NULL DEFAULT 'pending'");
                if (Schema::hasColumn('stock_requests', 'payment_status')) {
                    DB::statement("ALTER TABLE stock_requests MODIFY payment_status VARCHAR(40) NOT NULL DEFAULT 'unpaid'");
                }
                if (Schema::hasColumn('stock_requests', 'quantity')) {
                    DB::statement('ALTER TABLE stock_requests MODIFY quantity INT NOT NULL DEFAULT 0');
                }
                if (Schema::hasColumn('stock_requests', 'total_amount')) {
                    DB::statement('ALTER TABLE stock_requests MODIFY total_amount DECIMAL(12,2) NOT NULL DEFAULT 0');
                }
            }
        }

        if (! Schema::hasTable('stock_request_items')) {
            Schema::create('stock_request_items', function (Blueprint $table) {
                $table->id();
                $table->foreignId('stock_request_id')->constrained('stock_requests')->cascadeOnDelete();
                $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
                $table->integer('quantity');
                $table->decimal('franchise_price', 12, 2)->default(0);
                $table->decimal('total_price', 12, 2)->default(0);
                $table->timestamps();
            });
        } else {
            Schema::table('stock_request_items', function (Blueprint $table) {
                if (! Schema::hasColumn('stock_request_items', 'franchise_price')) {
                    $table->decimal('franchise_price', 12, 2)->default(0)->after('quantity');
                }
                if (! Schema::hasColumn('stock_request_items', 'total_price')) {
                    $table->decimal('total_price', 12, 2)->default(0)->after('franchise_price');
                }
            });
        }
    }

    public function down(): void
    {
        // Non-destructive normalization for live stock data.
    }
};
