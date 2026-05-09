<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('franchise_applications', function (Blueprint $table) {
            $table->id();
            
            // Personal & Address
            $table->string('full_name');
            $table->string('email');
            $table->string('mobile_number');
            $table->string('whatsapp_number')->nullable();
            $table->string('gender');
            $table->integer('age');
            $table->string('house_no');
            $table->string('area_locality');
            $table->string('state');
            $table->string('city');
            $table->string('pincode');
            
            // Business
            $table->string('owns_business')->default('no');
            $table->string('business_name')->nullable();
            $table->string('business_type')->nullable();
            $table->string('experience_years')->nullable();
            $table->string('gst_number')->nullable();
            
            // Location
            $table->string('franchise_type');
            $table->string('preferred_state');
            $table->string('preferred_city');
            $table->string('location_type')->nullable();
            $table->string('shop_size')->nullable();
            
            // Investment
            $table->string('investment_budget');
            $table->string('expected_sales')->nullable();
            
            // Legal & Verification
            $table->string('pan_number')->nullable();
            $table->text('why_franchise');
            $table->boolean('terms_accepted')->default(1);
            
            // Documents
            $table->string('aadhaar_doc')->nullable();
            $table->string('pan_doc')->nullable();
            $table->string('aadhaar_card_path')->nullable();
            $table->string('pan_card_path')->nullable();
            
            // Admin Status
            $table->enum('status', ['pending', 'reviewed', 'approved', 'rejected'])->default('pending');
            $table->text('admin_notes')->nullable();
            
            $table->timestamps();
        });
    }
};
