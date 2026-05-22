<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('storefront_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique(); // e.g., 'shop_hero_title'
            $table->longText('value')->nullable(); // The actual content
            $table->string('type')->default('text'); // e.g., 'text', 'image'
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('storefront_settings');
    }
};