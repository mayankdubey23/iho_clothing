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
    Schema::create('wallets', function (Blueprint $table) {
        $table->id();
        $table->foreignId('franchise_id')->constrained('users')->cascadeOnDelete();
        $table->decimal('balance', 10, 2)->default(0); // Current clear balance
        $table->decimal('total_earned', 10, 2)->default(0); // Lifetime earnings
        $table->decimal('pending_dues', 10, 2)->default(0); // Amount to pay to Super Admin
        $table->timestamps();
    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('wallets');
    }
};
