<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        // 1. Disable Foreign Key Checks to safely drop tables
        Schema::disableForeignKeyConstraints();

        // 2. Force drop old ghost tables
        Schema::dropIfExists('service_area_requests');
        Schema::dropIfExists('franchise_service_areas');

        // 3. Create fresh Active Areas table
        Schema::create('franchise_service_areas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('franchise_id')->constrained('users')->onDelete('cascade');
            $table->string('state');
            $table->string('city');
            $table->string('locality');
            $table->string('pincode');
            $table->string('delivery_coverage')->default('Standard');
            $table->boolean('is_active')->default(true); // YEH COLUMN MISSING THA
            $table->timestamps();
        });

        // 4. Create fresh Expansion Requests table
        Schema::create('service_area_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('franchise_id')->constrained('users')->onDelete('cascade');
            $table->enum('request_type', ['Add New Area', 'Change Area', 'Pincode Expansion']);
            $table->string('requested_state');
            $table->string('requested_city');
            $table->string('requested_locality');
            $table->string('requested_pincode');
            $table->text('reason');
            $table->enum('status', ['Pending', 'Approved', 'Rejected'])->default('Pending');
            $table->text('admin_notes')->nullable();
            $table->timestamps();
        });

        // 5. Re-enable Foreign Key Checks
        Schema::enableForeignKeyConstraints();
    }

    public function down()
    {
        Schema::disableForeignKeyConstraints();
        Schema::dropIfExists('service_area_requests');
        Schema::dropIfExists('franchise_service_areas');
        Schema::enableForeignKeyConstraints();
    }
};