<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        // The original 2026_05_07 migration already creates stock_requests.
        // This migration upgrades that table for the admin stock request workflow.
        if (! Schema::hasTable('stock_requests')) {
            Schema::create('stock_requests', function (Blueprint $table) {
                $table->id();
                $table->foreignId('franchise_id')->constrained('users')->onDelete('cascade');
                $table->decimal('total_amount', 10, 2)->default(0);
                $table->enum('payment_status', ['Unpaid', 'Paid', 'Refunded'])->default('Unpaid');
                $table->enum('status', ['Pending', 'Approved', 'Rejected', 'Paid', 'Dispatched', 'Completed', 'Cancelled'])->default('Pending');
                $table->text('notes')->nullable();
                $table->timestamps();
            });
        } else {
            Schema::table('stock_requests', function (Blueprint $table) {
                if (! Schema::hasColumn('stock_requests', 'payment_status')) {
                    $table->enum('payment_status', ['Unpaid', 'Paid', 'Refunded'])->default('Unpaid')->after('total_amount');
                }

                if (! Schema::hasColumn('stock_requests', 'notes')) {
                    $table->text('notes')->nullable()->after('status');
                }
            });
        }

        if (! Schema::hasTable('stock_request_items')) {
            Schema::create('stock_request_items', function (Blueprint $table) {
                $table->id();
                $table->foreignId('stock_request_id')->constrained('stock_requests')->onDelete('cascade');
                $table->foreignId('product_id')->constrained('products');
                $table->integer('quantity');
                $table->decimal('franchise_price', 10, 2);
                $table->decimal('total_price', 10, 2);
                $table->timestamps();
            });
        }
    }

    public function down()
    {
        Schema::dropIfExists('stock_request_items');

        Schema::table('stock_requests', function (Blueprint $table) {
            if (Schema::hasColumn('stock_requests', 'payment_status')) {
                $table->dropColumn('payment_status');
            }

            if (Schema::hasColumn('stock_requests', 'notes')) {
                $table->dropColumn('notes');
            }
        });
    }
};
