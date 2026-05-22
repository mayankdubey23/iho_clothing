<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        // 1. Central Notifications Table (If not created by Super Admin)
        if (!Schema::hasTable('notifications')) {
            Schema::create('notifications', function (Blueprint $table) {
                $table->id();
                $table->string('type'); // Order, Stock, Payment, Alert, Announcement
                $table->string('title');
                $table->text('message');
                $table->string('reference_id')->nullable(); // e.g. Order ID or Request ID
                $table->timestamps();
            });
        }

        // 2. Notification Users (Mapping table to track Read/Unread status per user)
        if (!Schema::hasTable('notification_users')) {
            Schema::create('notification_users', function (Blueprint $table) {
                $table->id();
                $table->foreignId('notification_id')->constrained('notifications')->onDelete('cascade');
                $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
                $table->boolean('is_read')->default(false);
                $table->timestamp('read_at')->nullable();
                $table->timestamps();
            });
        }

        // 3. Email Logs (For safety & tracking)
        if (!Schema::hasTable('email_logs')) {
            Schema::create('email_logs', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
                $table->string('email_to');
                $table->string('subject');
                $table->enum('status', ['Sent', 'Failed', 'Pending'])->default('Pending');
                $table->timestamps();
            });
        }

        // 4. SMS Logs
        if (!Schema::hasTable('sms_logs')) {
            Schema::create('sms_logs', function (Blueprint $table) {
                $table->id();
                $table->string('phone_number');
                $table->text('message');
                $table->enum('status', ['Sent', 'Failed'])->default('Sent');
                $table->timestamps();
            });
        }

        // 5. WhatsApp Logs
        if (!Schema::hasTable('whatsapp_logs')) {
            Schema::create('whatsapp_logs', function (Blueprint $table) {
                $table->id();
                $table->string('whatsapp_number');
                $table->string('template_name')->nullable();
                $table->enum('status', ['Sent', 'Delivered', 'Read', 'Failed'])->default('Sent');
                $table->timestamps();
            });
        }
    }

    public function down()
    {
        // Leaving down empty or safe drops, as we don't want to accidentally drop SuperAdmin tables on rollback
        // Schema::dropIfExists('whatsapp_logs');
        // Schema::dropIfExists('sms_logs');
        // Schema::dropIfExists('email_logs');
        // Schema::dropIfExists('notification_users');
        // Schema::dropIfExists('notifications');
    }
};