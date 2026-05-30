<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
public function up()
{
    Schema::create('storefront_banners', function (Blueprint $table) {
        $table->id();
        $table->string('title'); // Admin reference (e.g., "Summer Sale 2026")
        $table->enum('placement_type', ['main_hero_slider', 'mid_page_banner', 'category_banner'])->default('main_hero_slider');
        
        // 📱 Separate images for Desktop and Mobile (Super Important for Premium UX)
        $table->string('desktop_image_path');
        $table->string('mobile_image_path');
        
        $table->string('target_url')->nullable(); // Banner par click karke kahan jayega
        $table->integer('sort_order')->default(0); // Banners ko sequence mein lagane ke liye
        $table->boolean('is_active')->default(true); // The Kill Switch
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('storefront_banners');
    }
};
