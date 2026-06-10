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
        Schema::table('featured_category_items', function (Blueprint $table) {
            $table->string('banner_image_path')->nullable()->after('image_path');
            $table->string('accent_color', 7)->nullable()->after('banner_image_path');
            $table->string('style_theme', 50)->default('default')->after('accent_color');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('featured_category_items', function (Blueprint $table) {
            $table->dropColumn(['banner_image_path', 'accent_color', 'style_theme']);
        });
    }
};
