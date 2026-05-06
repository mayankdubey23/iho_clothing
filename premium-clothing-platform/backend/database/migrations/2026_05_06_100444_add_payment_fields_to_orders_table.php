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
    Schema::table('orders', function (Blueprint $table) {
        $table->string('razorpay_order_id')->nullable();
        $table->string('razorpay_payment_id')->nullable();
        $table->string('payment_status')->default('pending'); // pending, success, failed
    });
    }

    
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            //
        });
    }
};
