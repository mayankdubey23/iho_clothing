<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            if (! Schema::hasColumn('products', 'gender')) {
                $table->string('gender')->nullable()->after('category_id');
            }

            if (! Schema::hasColumn('products', 'subcategory_slug')) {
                $table->string('subcategory_slug')->nullable()->after('gender');
            }

            if (! Schema::hasColumn('products', 'discount_price')) {
                $table->decimal('discount_price', 10, 2)->nullable()->after('base_price');
            }

            if (! Schema::hasColumn('products', 'rating')) {
                $table->decimal('rating', 2, 1)->nullable()->after('discount_price');
            }

            if (! Schema::hasColumn('products', 'show_on_men_page')) {
                $table->boolean('show_on_men_page')->default(false)->after('is_active');
            }

            if (! Schema::hasColumn('products', 'seo_title')) {
                $table->string('seo_title')->nullable()->after('description');
            }

            if (! Schema::hasColumn('products', 'seo_description')) {
                $table->text('seo_description')->nullable()->after('seo_title');
            }
        });

        Schema::table('categories', function (Blueprint $table) {
            if (! Schema::hasColumn('categories', 'gender')) {
                $table->string('gender')->nullable();
            }

            if (! Schema::hasColumn('categories', 'show_on_men_page')) {
                $table->boolean('show_on_men_page')->default(false)->after('is_active');
            }
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            foreach (['seo_description', 'seo_title', 'show_on_men_page', 'rating', 'discount_price', 'subcategory_slug', 'gender'] as $column) {
                if (Schema::hasColumn('products', $column)) {
                    $table->dropColumn($column);
                }
            }
        });

        Schema::table('categories', function (Blueprint $table) {
            foreach (['show_on_men_page', 'gender'] as $column) {
                if (Schema::hasColumn('categories', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
