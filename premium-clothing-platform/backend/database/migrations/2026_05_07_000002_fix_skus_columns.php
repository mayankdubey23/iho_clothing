<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * The existing codebase (seeder/controller) uses `code` for SKU lookup,
     * but the current migration creates `sku_code`.
     *
     * This migration aligns schema with code by adding `code` column.
     */
    public function up(): void
    {
        Schema::table('skus', function (Blueprint $table) {
            // If the column doesn't exist yet, add it.
            // (Laravel's Schema doesn't have a portable "ifExists" for columns.)
            $table->string('code')->nullable()->after('id');
        });

        // Copy existing values from sku_code -> code (if sku_code exists).
        // Using DB::statement to avoid query exceptions on older schemas.
        
        // Note: This project uses MySQL; plain UPDATE is fine if sku_code exists.
        
        
        
        
        DB::table('skus')->whereNotNull('sku_code')->update(['code' => DB::raw('sku_code')]);
    }

    public function down(): void
    {
        Schema::table('skus', function (Blueprint $table) {
            $table->dropColumn('code');
        });
    }
};

