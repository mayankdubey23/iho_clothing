<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        // 1. Support Tickets (The Main Conversation Thread)
        Schema::create('support_tickets', function (Blueprint $table) {
            $table->id();
            $table->string('ticket_number')->unique(); // e.g., TKT-10023
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade'); // Customer or Franchise
            $table->enum('user_type', ['Customer', 'Franchise'])->default('Customer');
            $table->string('subject');
            $table->enum('priority', ['Low', 'Medium', 'High', 'Urgent'])->default('Medium');
            $table->enum('status', ['Open', 'In Progress', 'Waiting for Customer', 'Resolved', 'Closed'])->default('Open');
            $table->unsignedBigInteger('assigned_to')->nullable(); // Staff ID (if you have staff roles)
            $table->foreign('assigned_to')->references('id')->on('users');
            $table->timestamps();
        });

        // 2. Ticket Messages (The Chat History)
        Schema::create('support_ticket_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('support_ticket_id')->constrained('support_tickets')->onDelete('cascade');
            $table->foreignId('sender_id')->constrained('users'); // Who sent the message
            $table->text('message');
            $table->boolean('is_admin_reply')->default(false); // To distinguish UI bubbles
            $table->timestamps();
        });

        // 3. Ticket Attachments (Screenshots, Proofs)
        Schema::create('ticket_attachments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('message_id')->constrained('support_ticket_messages')->onDelete('cascade');
            $table->string('file_path');
            $table->string('file_name');
            $table->string('file_type'); // e.g., image/png, application/pdf
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('ticket_attachments');
        Schema::dropIfExists('support_ticket_messages');
        Schema::dropIfExists('support_tickets');
    }
};