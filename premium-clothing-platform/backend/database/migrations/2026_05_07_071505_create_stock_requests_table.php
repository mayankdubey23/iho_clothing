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
    Schema::create('stock_requests', function (Blueprint $table) {
        $table->id();
        $table->foreignId('franchise_id')->constrained('users')->cascadeOnDelete();
        $table->foreignId('sku_id')->constrained('skus')->cascadeOnDelete();
        $table->integer('quantity');
        $table->decimal('total_amount', 10, 2); // Franchise Price * Quantity
        $table->enum('status', ['pending', 'approved', 'rejected', 'paid'])->default('pending');
        $table->timestamps();
    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_requests');
    }
};
