<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            if (!Schema::hasColumn('orders', 'sales_channel')) {
                $table->string('sales_channel', 20)->default('online')->after('payment_method');
            }
        });

        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'store_name')) {
                $table->string('store_name')->nullable()->after('country');
            }
            if (!Schema::hasColumn('users', 'store_address')) {
                $table->string('store_address')->nullable()->after('store_name');
            }
            if (!Schema::hasColumn('users', 'store_contact')) {
                $table->string('store_contact', 20)->nullable()->after('store_address');
            }
            if (!Schema::hasColumn('users', 'business_hours')) {
                $table->string('business_hours')->nullable()->after('store_contact');
            }
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            if (Schema::hasColumn('orders', 'sales_channel')) {
                $table->dropColumn('sales_channel');
            }
        });

        Schema::table('users', function (Blueprint $table) {
            foreach (['store_name', 'store_address', 'store_contact', 'business_hours'] as $column) {
                if (Schema::hasColumn('users', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
