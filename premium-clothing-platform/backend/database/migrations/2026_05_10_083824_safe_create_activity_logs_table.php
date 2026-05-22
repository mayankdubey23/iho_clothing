<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        if (!Schema::hasTable('activity_logs')) {
            Schema::create('activity_logs', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained('users')->onDelete('cascade'); // Tracks WHO did it
                $table->string('module'); // e.g., 'Orders', 'Inventory', 'Profile', 'Auth', 'Support'
                $table->string('action'); // e.g., 'Status Updated', 'Logged In', 'Downloaded'
                $table->text('description'); // Detailed info: "Order #1234 status changed to Shipped"
                $table->string('ip_address')->nullable(); // For extra security tracking
                $table->timestamps(); // automatically tracks WHEN it happened
            });
        }
    }

    public function down()
    {
        // Keeping it safe, not dropping to avoid breaking Super Admin logs
        // Schema::dropIfExists('activity_logs');
    }
};