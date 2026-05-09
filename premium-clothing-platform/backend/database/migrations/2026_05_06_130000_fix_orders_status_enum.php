<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Expand the orders.status enum to include all lifecycle statuses
     * used by OrderController.
     */
    public function up(): void
    {
        DB::statement("
            ALTER TABLE orders
            MODIFY COLUMN status
            ENUM('pending','processing','confirmed','packed','shipped','out_for_delivery','completed','delivered','cancelled','returned','refunded')
            DEFAULT 'pending'
        ");
    }

    public function down(): void
    {
        DB::table('orders')
            ->whereNotIn('status', ['pending', 'processing', 'completed', 'cancelled'])
            ->update(['status' => 'pending']);

        DB::statement("
            ALTER TABLE orders
            MODIFY COLUMN status
            ENUM('pending','processing','completed','cancelled')
            DEFAULT 'pending'
        ");
    }
};
