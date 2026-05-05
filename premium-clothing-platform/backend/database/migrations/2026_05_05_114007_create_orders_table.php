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
    Schema::create('orders', function (Blueprint $table) {
        $table->id();
        $table->string('customer_name');
        $table->string('customer_phone');
        $table->string('customer_email')->nullable();
        $table->text('shipping_address')->nullable();
        
        // Paise ka hisaab (10 digits total, 2 decimal places)
        $table->decimal('total_amount', 10, 2); 
        
        // Order ka status track karne ke liye
        $table->enum('status', ['pending', 'processing', 'completed', 'cancelled'])->default('pending');
        
        $table->timestamps(); // automatically created_at aur updated_at banayega
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};