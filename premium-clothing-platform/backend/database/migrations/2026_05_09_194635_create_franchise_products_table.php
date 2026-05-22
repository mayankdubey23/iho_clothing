<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        // 1. Franchise Assigned Products (Controls Local Pricing & Visibility)
        Schema::create('franchise_products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('franchise_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('product_id')->constrained('products')->onDelete('cascade');
            
            // Franchise can set their own price (usually bounded by Super Admin rules)
            $table->decimal('local_selling_price', 10, 2)->nullable(); 
            
            // Franchise can hide a product from their local B2C store even if they have stock
            $table->boolean('is_active_locally')->default(true);
            
            $table->timestamps();

            // A franchise can only have one unique entry per product
            $table->unique(['franchise_id', 'product_id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('franchise_products');
    }
};s