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
    Schema::create('store_offers', function (Blueprint $table) {
        $table->id();
        $table->string('title'); // Jaise: "FLAT 20% OFF ON HOODIES"
        $table->string('code')->nullable(); // Jaise: "WINTER20"
        $table->boolean('is_active')->default(true); // Yahi wo column hai jo error mein fail ho raha tha
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('store_offers');
    }
};
