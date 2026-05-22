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
    Schema::create('reviews', function (Blueprint $table) {
        $table->id();
        $table->foreignId('product_id')->constrained()->onDelete('cascade');
        $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade'); // Customer ki ID
        $table->string('customer_name'); // Agar user logged in nahi hai toh naam lega
        $table->integer('rating'); // 1 to 5 stars
        $table->text('comment');
        $table->boolean('is_approved')->default(true); // Premium brands pehle review check karte hain
        $table->timestamps();
    });
}   

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        Schema::dropIfExists('reviews');
    }
};