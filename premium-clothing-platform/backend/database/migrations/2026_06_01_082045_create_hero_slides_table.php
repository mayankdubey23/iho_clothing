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
    Schema::create('hero_slides', function (Blueprint $table) {
        $table->id();
        $table->string('tag'); // e.g., 'NEW DROP'
        $table->string('title'); // e.g., "Titanium Frost\nCollection"
        $table->string('btn_text')->default('Shop Now');
        $table->string('image_path'); // e.g., 'hero/banner1.jpg'
        $table->boolean('is_active')->default(true);
        $table->timestamps();
    });
}
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hero_slides');
    }
};
