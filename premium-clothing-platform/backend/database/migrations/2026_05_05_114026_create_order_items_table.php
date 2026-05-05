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
    Schema::create('order_items', function (Blueprint $table) {
        $table->id();
        
        // Yeh batayega ki yeh item kis order ka hissa hai
        $table->foreignId('order_id')->constrained()->onDelete('cascade');
        
        // Kaunsa kapda kharida gaya
        $table->foreignId('product_id')->constrained()->onDelete('cascade');
        
        // Specific size ya color (SKU)
        $table->foreignId('sku_id')->constrained()->onDelete('cascade');
        
        $table->integer('quantity');
        
        // Jis waqt kharida gaya, us waqt price kya tha (taki baad me price badle to purane order pe asar na pade)
        $table->decimal('price', 10, 2); 
        
        $table->timestamps();
    });
}
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_items');
    }
};
