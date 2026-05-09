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
    Schema::create('user_addresses', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->constrained()->onDelete('cascade');
        $table->string('full_name');
        $table->string('mobile_number');
        $table->string('house_no');
        $table->string('area_locality');
        $table->string('landmark')->nullable();
        $table->string('city');
        $table->string('state');
        $table->string('pincode', 6);
        $table->string('country')->default('India');
        $table->boolean('is_default')->default(false);
        $table->timestamps();
    });
}
};
