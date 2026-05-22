<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        // 1. Unified Global Settings (Handles Logo, Contact, Maintenance, Setup)
        Schema::create('global_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique(); // e.g., 'site_name', 'support_email', 'maintenance_mode'
            $table->text('value')->nullable();
            $table->string('group')->default('general'); // 'general', 'contact', 'system'
            $table->timestamps();
        });

        // 2. SEO Settings
        Schema::create('seo_settings', function (Blueprint $table) {
            $table->id();
            $table->string('page_name')->unique(); // e.g., 'homepage', 'shop'
            $table->string('meta_title');
            $table->text('meta_description')->nullable();
            $table->text('meta_keywords')->nullable();
            $table->timestamps();
        });

        // 3. Social Media Links
        Schema::create('social_links', function (Blueprint $table) {
            $table->id();
            $table->string('platform'); // e.g., 'Facebook', 'Instagram'
            $table->string('url');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 4. Payment Gateways (Secured Credentials)
        Schema::create('payment_gateways', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique(); // e.g., 'Razorpay', 'Stripe', 'PhonePe'
            $table->boolean('is_active')->default(false);
            $table->enum('mode', ['sandbox', 'live'])->default('sandbox');
            // In a real app, encrypt these values before saving
            $table->text('api_key')->nullable(); 
            $table->text('api_secret')->nullable();
            $table->timestamps();
        });

        // Note: tax_settings & shipping_settings were already created in previous modules (Invoice & Delivery).
    }

    public function down()
    {
        Schema::dropIfExists('payment_gateways');
        Schema::dropIfExists('social_links');
        Schema::dropIfExists('seo_settings');
        Schema::dropIfExists('global_settings');
    }
};