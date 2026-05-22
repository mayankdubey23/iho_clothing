<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('inventories') && Schema::hasColumn('inventories', 'franchise_id')) {
            DB::table('inventories')->whereNotNull('franchise_id')->delete();
        }

        if (Schema::hasTable('stock_requests') && Schema::hasColumn('stock_requests', 'franchise_id')) {
            DB::table('stock_requests')->whereNotNull('franchise_id')->delete();
        }

        if (Schema::hasTable('wallets') && Schema::hasColumn('wallets', 'franchise_id')) {
            DB::table('wallets')->whereNotNull('franchise_id')->delete();
        }

        if (Schema::hasTable('franchise_pincodes') && Schema::hasColumn('franchise_pincodes', 'franchise_id')) {
            DB::table('franchise_pincodes')->whereNotNull('franchise_id')->delete();
        }

        if (Schema::hasTable('orders') && Schema::hasColumn('orders', 'franchise_id')) {
            DB::table('orders')->whereNotNull('franchise_id')->update(['franchise_id' => null]);
        }

        if (Schema::hasTable('orders') && Schema::hasColumn('orders', 'fulfillment_type')) {
            DB::table('orders')->where('fulfillment_type', 'franchise')->update(['fulfillment_type' => 'master']);
        }
    }

    public function down(): void
    {
        // Legacy franchise dashboard data cannot be reconstructed after cleanup.
    }
};
