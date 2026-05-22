<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('franchise_products')) {
            DB::statement('CREATE TABLE franchise_products (id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY, created_at TIMESTAMP NULL, updated_at TIMESTAMP NULL) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
        }

        if (! Schema::hasColumn('franchise_products', 'franchise_id')) {
            DB::statement('ALTER TABLE franchise_products ADD franchise_id BIGINT UNSIGNED NULL AFTER id');
        }

        if (! Schema::hasColumn('franchise_products', 'product_id')) {
            DB::statement('ALTER TABLE franchise_products ADD product_id BIGINT UNSIGNED NULL AFTER franchise_id');
        }

        if (! Schema::hasColumn('franchise_products', 'local_selling_price')) {
            DB::statement('ALTER TABLE franchise_products ADD local_selling_price DECIMAL(10,2) NULL AFTER product_id');
        }

        if (! Schema::hasColumn('franchise_products', 'is_active_locally')) {
            DB::statement('ALTER TABLE franchise_products ADD is_active_locally TINYINT(1) NOT NULL DEFAULT 1 AFTER local_selling_price');
        }

        $indexes = collect(DB::select("SHOW INDEX FROM franchise_products"))->pluck('Key_name')->all();

        if (! in_array('franchise_products_franchise_id_product_id_index', $indexes, true)) {
            DB::statement('ALTER TABLE franchise_products ADD INDEX franchise_products_franchise_id_product_id_index (franchise_id, product_id)');
        }

        $franchiseIds = DB::table('users')->whereIn('role', ['franchise', 'franchise_admin', 'franchise_owner'])->pluck('id');
        $products = DB::table('products')->select('id', 'base_price', 'mrp')->get();

        foreach ($franchiseIds as $franchiseId) {
            foreach ($products as $product) {
                $exists = DB::table('franchise_products')
                    ->where('franchise_id', $franchiseId)
                    ->where('product_id', $product->id)
                    ->exists();

                if (! $exists) {
                    DB::table('franchise_products')->insert([
                        'franchise_id' => $franchiseId,
                        'product_id' => $product->id,
                        'local_selling_price' => $product->base_price ?? $product->mrp ?? 0,
                        'is_active_locally' => true,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        }
    }

    public function down(): void
    {
        if (! Schema::hasTable('franchise_products')) {
            return;
        }

        $indexes = collect(DB::select("SHOW INDEX FROM franchise_products"))->pluck('Key_name')->all();

        if (in_array('franchise_products_franchise_id_product_id_index', $indexes, true)) {
            DB::statement('ALTER TABLE franchise_products DROP INDEX franchise_products_franchise_id_product_id_index');
        }

        foreach (['is_active_locally', 'local_selling_price', 'product_id', 'franchise_id'] as $column) {
            if (Schema::hasColumn('franchise_products', $column)) {
                DB::statement("ALTER TABLE franchise_products DROP COLUMN {$column}");
            }
        }
    }
};
