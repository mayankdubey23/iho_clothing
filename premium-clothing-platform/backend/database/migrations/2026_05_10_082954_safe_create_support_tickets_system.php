<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::disableForeignKeyConstraints();

        // Drop existing ghost tables safely
        Schema::dropIfExists('support_ticket_messages');
        Schema::dropIfExists('support_tickets');

        // 1. Support Tickets Master Table
        Schema::create('support_tickets', function (Blueprint $table) {
            $table->id();
            $table->string('ticket_number')->unique();
            $table->foreignId('franchise_id')->constrained('users')->onDelete('cascade');
            $table->string('category'); // Stock Issue, Payment Issue, etc.
            $table->string('subject');
            $table->enum('status', ['Open', 'In Progress', 'Waiting for Reply', 'Resolved', 'Closed'])->default('Open');
            $table->enum('priority', ['Low', 'Medium', 'High', 'Urgent'])->default('Medium');
            $table->timestamps();
        });

        // 2. Ticket Messages & Attachments (Thread)
        Schema::create('support_ticket_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ticket_id')->constrained('support_tickets')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade'); // Sender (Franchise or Admin)
            $table->text('message');
            $table->string('attachment_path')->nullable(); // For file/image uploads
            $table->boolean('is_admin_reply')->default(false);
            $table->timestamps();
        });

        Schema::enableForeignKeyConstraints();
    }

    public function down()
    {
        Schema::disableForeignKeyConstraints();
        Schema::dropIfExists('support_ticket_messages');
        Schema::dropIfExists('support_tickets');
        Schema::enableForeignKeyConstraints();
    }
};