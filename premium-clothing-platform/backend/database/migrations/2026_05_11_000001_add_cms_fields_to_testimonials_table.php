<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('testimonials', function (Blueprint $table) {
            if (! Schema::hasColumn('testimonials', 'product_purchased')) {
                $table->string('product_purchased')->nullable()->after('review');
            }

            if (! Schema::hasColumn('testimonials', 'is_dummy')) {
                $table->boolean('is_dummy')->default(false)->after('status');
            }
        });
    }

    public function down(): void
    {
        Schema::table('testimonials', function (Blueprint $table) {
            if (Schema::hasColumn('testimonials', 'is_dummy')) {
                $table->dropColumn('is_dummy');
            }

            if (Schema::hasColumn('testimonials', 'product_purchased')) {
                $table->dropColumn('product_purchased');
            }
        });
    }
};
