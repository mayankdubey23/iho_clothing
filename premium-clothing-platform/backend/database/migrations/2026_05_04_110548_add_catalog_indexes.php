<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->index(['is_active', 'category_id']);
            $table->index('base_price');
            $table->index('franchise_price');
        });

        Schema::table('skus', function (Blueprint $table) {
            $table->index(['size', 'color']);
        });

        Schema::table('inventories', function (Blueprint $table) {
            $table->unique('sku_id');
        });

        Schema::table('franchise_plans', function (Blueprint $table) {
            $table->index('type');
        });

        Schema::table('user_franchises', function (Blueprint $table) {
            $table->index(['user_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_franchises', function (Blueprint $table) {
            $table->dropIndex(['user_id', 'status']);
        });

        Schema::table('franchise_plans', function (Blueprint $table) {
            $table->dropIndex(['type']);
        });

        Schema::table('inventories', function (Blueprint $table) {
            $table->dropUnique(['sku_id']);
        });

        Schema::table('skus', function (Blueprint $table) {
            $table->dropIndex(['size', 'color']);
        });

        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex(['is_active', 'category_id']);
            $table->dropIndex(['base_price']);
            $table->dropIndex(['franchise_price']);
        });
    }
};
