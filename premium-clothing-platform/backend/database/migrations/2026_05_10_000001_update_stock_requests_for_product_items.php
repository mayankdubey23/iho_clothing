<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('stock_requests')) {
            return;
        }

        if (! Schema::hasColumn('stock_requests', 'request_number')) {
            DB::statement('ALTER TABLE stock_requests ADD request_number VARCHAR(50) NULL AFTER id');
        }

        if (! Schema::hasColumn('stock_requests', 'admin_notes')) {
            DB::statement('ALTER TABLE stock_requests ADD admin_notes TEXT NULL');
        }

        if (Schema::hasColumn('stock_requests', 'sku_id')) {
            DB::statement('ALTER TABLE stock_requests MODIFY sku_id BIGINT UNSIGNED NULL');
        }

        if (Schema::hasColumn('stock_requests', 'quantity')) {
            DB::statement('ALTER TABLE stock_requests MODIFY quantity INT NOT NULL DEFAULT 0');
        }

        if (Schema::hasColumn('stock_requests', 'total_amount')) {
            DB::statement('ALTER TABLE stock_requests MODIFY total_amount DECIMAL(10,2) NOT NULL DEFAULT 0');
        }

        if (Schema::hasColumn('stock_requests', 'status')) {
            DB::statement("ALTER TABLE stock_requests MODIFY status ENUM('pending','approved','rejected','paid','dispatched','completed','cancelled') NOT NULL DEFAULT 'pending'");
        }

        if (Schema::hasTable('stock_request_items')) {
            if (! Schema::hasColumn('stock_request_items', 'franchise_price')) {
                DB::statement('ALTER TABLE stock_request_items ADD franchise_price DECIMAL(10,2) NOT NULL DEFAULT 0 AFTER quantity');
            }

            if (! Schema::hasColumn('stock_request_items', 'total_price')) {
                DB::statement('ALTER TABLE stock_request_items ADD total_price DECIMAL(10,2) NOT NULL DEFAULT 0 AFTER franchise_price');
            }
        }
    }

    public function down(): void
    {
        if (! Schema::hasTable('stock_requests')) {
            return;
        }

        if (Schema::hasColumn('stock_requests', 'request_number')) {
            DB::statement('ALTER TABLE stock_requests DROP COLUMN request_number');
        }

        if (Schema::hasColumn('stock_requests', 'admin_notes')) {
            DB::statement('ALTER TABLE stock_requests DROP COLUMN admin_notes');
        }
    }
};
