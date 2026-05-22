<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        // 1. Dynamic Banners (Hero sliders, Offers, Collections)
        Schema::create('banners', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('image_path');
            $table->enum('type', ['Homepage Slider', 'Offer Banner', 'Collection Banner'])->default('Homepage Slider');
            $table->string('link')->nullable(); // Target URL when clicked
            $table->integer('display_order')->default(0);
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
        });

        // 2. Static Pages (About Us, Privacy, Terms)
        Schema::create('pages', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique(); // e.g., 'about-us'
            $table->string('title');
            $table->longText('content')->nullable(); // HTML Content
            $table->string('meta_title')->nullable(); // For SEO
            $table->text('meta_description')->nullable(); // For SEO
            $table->enum('status', ['published', 'draft'])->default('published');
            $table->timestamps();
        });

        // 3. Testimonials
        Schema::create('testimonials', function (Blueprint $table) {
            $table->id();
            $table->string('customer_name');
            $table->string('image_path')->nullable();
            $table->integer('rating')->default(5);
            $table->text('review');
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
        });

        // 4. FAQs
        Schema::create('faqs', function (Blueprint $table) {
            $table->id();
            $table->string('question');
            $table->text('answer');
            $table->integer('display_order')->default(0);
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
        });

        // 5. Global Settings (Contact details, Social Links)
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique(); // e.g., 'contact_email', 'facebook_link'
            $table->text('value')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('settings');
        Schema::dropIfExists('faqs');
        Schema::dropIfExists('testimonials');
        Schema::dropIfExists('pages');
        Schema::dropIfExists('banners');
    }
};