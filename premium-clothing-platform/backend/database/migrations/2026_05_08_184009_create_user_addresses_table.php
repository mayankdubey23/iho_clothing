<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        if (!Schema::hasTable('user_addresses')) {
            Schema::create('user_addresses', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
                $table->string('type')->default('Home'); // Home, Work, etc.
                $table->string('full_name');
                $table->string('phone');
                $table->string('pincode');
                $table->text('address_line');
                $table->string('city');
                $table->string('state');
                $table->boolean('is_default')->default(false);
                $table->timestamps();
            });
        }
    }

    public function down()
    {
        Schema::dropIfExists('user_addresses');
    }
};