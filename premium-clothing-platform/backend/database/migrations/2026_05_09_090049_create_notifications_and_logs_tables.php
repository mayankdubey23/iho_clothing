<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        // 1. Main Notifications Table (The Broadcast Content)
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('message');
            $table->enum('type', ['Order Update', 'Offer Alert', 'Stock Alert', 'Payment Reminder', 'Franchise Announcement', 'Support Reply']);
            $table->enum('target_audience', ['All Customers', 'All Franchises', 'Specific User']);
            $table->json('channels_used')->nullable(); // Arrays like ["Email", "SMS", "WhatsApp"]
            $table->foreignId('created_by')->constrained('users'); // Super Admin ID
            $table->timestamps();
        });

        // 2. Notification Users (To track In-App Read/Unread status)
        Schema::create('notification_users', function (Blueprint $table) {
            $table->id();
            $table->foreignId('notification_id')->constrained('notifications')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->boolean('is_read')->default(false);
            $table->timestamp('read_at')->nullable();
        });

        // 3. Email Logs
        Schema::create('email_logs', function (Blueprint $table) {
            $table->id();
            $table->string('to_email');
            $table->string('subject');
            $table->text('body')->nullable();
            $table->enum('status', ['Sent', 'Failed', 'Pending'])->default('Sent');
            $table->timestamp('sent_at')->nullable();
            $table->timestamps();
        });

        // 4. SMS Logs
        Schema::create('sms_logs', function (Blueprint $table) {
            $table->id();
            $table->string('phone_number');
            $table->string('message');
            $table->enum('status', ['Sent', 'Failed', 'Pending', 'Delivered'])->default('Sent');
            $table->timestamp('sent_at')->nullable();
            $table->timestamps();
        });

        // 5. WhatsApp Logs
        Schema::create('whatsapp_logs', function (Blueprint $table) {
            $table->id();
            $table->string('phone_number');
            $table->string('message');
            $table->enum('status', ['Sent', 'Failed', 'Read', 'Delivered'])->default('Sent');
            $table->timestamp('sent_at')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('whatsapp_logs');
        Schema::dropIfExists('sms_logs');
        Schema::dropIfExists('email_logs');
        Schema::dropIfExists('notification_users');
        Schema::dropIfExists('notifications');
    }
};