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
    Schema::create('coupons', function (Blueprint $table) {
        $table->id();
        $table->string('code')->unique(); // e.g., IHO50, WELCOME20
        $table->enum('type', ['fixed', 'percent']); // ₹50 off ya 20% off
        $table->decimal('value', 8, 2); // 50.00 ya 20.00
        $table->decimal('min_cart_amount', 8, 2)->default(0); // Kam se kam kitne ki shopping karni hogi
        $table->timestamp('expires_at')->nullable();
        $table->boolean('is_active')->default(true);
        $table->timestamps();
    });
  }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('coupons');
    }
};
