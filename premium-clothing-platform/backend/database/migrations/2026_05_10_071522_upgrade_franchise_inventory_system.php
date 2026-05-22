<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        // 1. Create Product Variants table (if not exists)
        if (!Schema::hasTable('product_variants')) {
            Schema::create('product_variants', function (Blueprint $table) {
                $table->id();
                $table->foreignId('product_id')->constrained('products')->onDelete('cascade');
                $table->string('sku')->unique();
                $table->string('size')->nullable(); // e.g., M, L, XL
                $table->string('color')->nullable(); // e.g., Red, Blue
                $table->timestamps();
            });
        }

        // 2. Upgrade Franchise Inventory Table
        Schema::table('franchise_inventory', function (Blueprint $table) {
            if (!Schema::hasColumn('franchise_inventory', 'variant_id')) {
                // Link to specific size/color
                $table->foreignId('variant_id')->nullable()->after('product_id')->constrained('product_variants')->onDelete('cascade');
            }

            // Advanced Tracking Metrics
            if (!Schema::hasColumn('franchise_inventory', 'sold_quantity')) {
                $table->integer('sold_quantity')->default(0)->after('quantity');
            }

            if (!Schema::hasColumn('franchise_inventory', 'returned_quantity')) {
                $table->integer('returned_quantity')->default(0)->after('sold_quantity');
            }

            if (!Schema::hasColumn('franchise_inventory', 'damaged_quantity')) {
                $table->integer('damaged_quantity')->default(0)->after('returned_quantity');
            }

            if (!Schema::hasColumn('franchise_inventory', 'received_quantity')) {
                $table->integer('received_quantity')->default(0)->after('damaged_quantity');
            }
        });

        // 3. Franchise Stock Transactions (Detailed Audit Trail)
        if (!Schema::hasTable('franchise_stock_transactions')) {
            Schema::create('franchise_stock_transactions', function (Blueprint $table) {
                $table->id();
                $table->foreignId('franchise_id')->constrained('users')->onDelete('cascade');
                $table->foreignId('product_id')->constrained('products')->onDelete('cascade');
                $table->foreignId('variant_id')->nullable()->constrained('product_variants')->onDelete('cascade');
                
                $table->enum('type', ['Received', 'Sold', 'Returned', 'Damaged', 'Correction']);
                $table->integer('quantity'); // Positive or Negative
                $table->string('reference_id')->nullable(); // Order ID or Request ID
                $table->text('notes')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down()
    {
        Schema::dropIfExists('franchise_stock_transactions');
        // Rollbacks for inventory columns would go here
    }
};
