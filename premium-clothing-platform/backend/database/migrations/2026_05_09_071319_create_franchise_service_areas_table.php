<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('franchise_service_areas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('franchise_id')->constrained('users')->onDelete('cascade');
            $table->string('state');
            $table->string('city');
            // Ek pincode par sirf ek hi franchise raj karega!
            $table->string('pincode')->unique(); 
            $table->enum('status', ['active', 'blocked'])->default('active');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('franchise_service_areas');
    }
};