<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::disableForeignKeyConstraints();

        // 1. Franchise Profiles (Extra details beyond the Users table)
        if (!Schema::hasTable('franchise_profiles')) {
            Schema::create('franchise_profiles', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
                $table->string('business_name')->nullable();
                $table->string('whatsapp_number')->nullable();
                $table->string('gst_number')->nullable();
                $table->string('pan_number')->nullable();
                $table->text('address_line')->nullable();
                $table->string('city')->nullable();
                $table->string('state')->nullable();
                $table->string('pincode')->nullable();
                $table->string('logo_path')->nullable();
                $table->timestamps();
            });
        }

        // 2. Bank Details
        if (!Schema::hasTable('bank_details')) {
            Schema::create('bank_details', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
                $table->string('bank_name')->nullable();
                $table->string('account_name')->nullable();
                $table->string('account_number')->nullable();
                $table->string('ifsc_code')->nullable();
                $table->timestamps();
            });
        }

        // 3. Profile Update Requests (For sensitive data requiring Admin approval)
        if (!Schema::hasTable('profile_update_requests')) {
            Schema::create('profile_update_requests', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
                $table->json('requested_data'); // Stores the new GST, PAN, Bank details etc.
                $table->enum('status', ['Pending', 'Approved', 'Rejected'])->default('Pending');
                $table->text('admin_notes')->nullable();
                $table->timestamps();
            });
        }

        Schema::enableForeignKeyConstraints();
    }

    public function down()
    {
        Schema::disableForeignKeyConstraints();
        Schema::dropIfExists('profile_update_requests');
        Schema::dropIfExists('bank_details');
        Schema::dropIfExists('franchise_profiles');
        Schema::enableForeignKeyConstraints();
    }
};