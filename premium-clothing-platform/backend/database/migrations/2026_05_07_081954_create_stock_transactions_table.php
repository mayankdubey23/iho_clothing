<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stock_transactions', function (Blueprint $table) {
            $table->id();
            
            // Kis product (SKU) ka transaction hai?
            $table->foreignId('sku_id')->constrained('skus')->cascadeOnDelete();
            
            // Agar NULL hai, matlab Master Warehouse. Agar ID hai, matlab Franchise Godown.
            $table->foreignId('franchise_id')->nullable()->constrained('users')->cascadeOnDelete(); 
            
            $table->enum('transaction_type', ['in', 'out']); // Stock aaya ('in') ya gaya ('out')
            $table->integer('quantity');
            
            // Detail: "New Stock Added", "Transferred to Franchise", "Order #102 Delivered"
            $table->string('reason'); 
            
            // Kis Admin ya Franchise ne yeh action liya
            $table->foreignId('performed_by')->nullable()->constrained('users'); 
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_transactions');
    }
};