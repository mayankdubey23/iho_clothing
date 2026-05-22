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
        Schema::create('user_franchises', function (Blueprint $table) {
            $table->id();
        $table->foreignId('franchise_id')->constrained('users')->onDelete('cascade');
        $table->foreignId('product_id')->constrained('products')->onDelete('cascade');
        $table->foreignId('user_id')->constrained()->onDelete('cascade');
        $table->decimal('local_selling_price', 10, 2)->nullable(); 
        $table->boolean('is_active_locally')->default(true);
        $table->string('status')->default('active');
        $table->timestamps();
        $table->unique(['franchise_id', 'product_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_franchises');
    }
};
