<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Expand the orders.status enum to include all lifecycle statuses
     * used by OrderController (confirmed, shipped, delivered).
     */
    public function up(): void
    {
        DB::statement("
            ALTER TABLE orders
            MODIFY COLUMN status
            ENUM('pending','processing','confirmed','shipped','completed','delivered','cancelled')
            DEFAULT 'pending'
        ");
    }

    public function down(): void
    {
        DB::statement("
            ALTER TABLE orders
            MODIFY COLUMN status
            ENUM('pending','processing','completed','cancelled')
            DEFAULT 'pending'
        ");
    }
};
