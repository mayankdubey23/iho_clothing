<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        // Activity log specifically for order tracking timeline
        if (!Schema::hasTable('order_status_logs')) {
            Schema::create('order_status_logs', function (Blueprint $table) {
                $table->id();
                $table->foreignId('order_id')->constrained('orders')->onDelete('cascade');
                $table->string('status'); // e.g., 'Packed', 'Shipped'
                $table->string('updated_by_role')->default('Franchise'); 
                $table->foreignId('updated_by')->nullable()->constrained('users')->onDelete('set null');
                $table->text('notes')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down()
    {
        Schema::dropIfExists('order_status_logs');
    }
};