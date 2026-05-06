<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('inventories', function (Blueprint $table) {
            // 1. Pehle Foreign Key hatao taaki MySQL shant ho jaye
            $table->dropForeign(['sku_id']);
            
            // 2. Ab wo purana Unique Lock aaram se hat jayega
            $table->dropUnique('inventories_sku_id_unique');
            
            // 3. Naya Multi-Franchise lock lagao (Ek franchise - Ek SKU)
            $table->unique(['franchise_id', 'sku_id'], 'franchise_sku_unique');
            
            // 4. Foreign Key ko wapas attach kar do
            $table->foreign('sku_id')->references('id')->on('skus')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('inventories', function (Blueprint $table) {
            $table->dropForeign(['sku_id']);
            $table->dropUnique('franchise_sku_unique');
            $table->unique('sku_id', 'inventories_sku_id_unique');
            $table->foreign('sku_id')->references('id')->on('skus')->cascadeOnDelete();
        });
    }
};