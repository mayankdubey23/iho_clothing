<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (! Schema::hasTable('support_tickets')) {
            Schema::create('support_tickets', function (Blueprint $table) {
                $table->id();
                $table->string('ticket_number')->unique();
                $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
                $table->foreignId('franchise_id')->nullable()->constrained('users')->nullOnDelete();
                $table->string('user_type')->default('Customer');
                $table->string('category')->default('General');
                $table->string('subject');
                $table->string('order_id')->nullable();
                $table->string('priority')->default('Medium');
                $table->string('status')->default('Open');
                $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamps();
            });
        } else {
            Schema::table('support_tickets', function (Blueprint $table) {
                if (! Schema::hasColumn('support_tickets', 'ticket_number')) {
                    $table->string('ticket_number')->nullable()->unique()->after('id');
                }
                if (! Schema::hasColumn('support_tickets', 'user_id')) {
                    $table->foreignId('user_id')->nullable()->after('ticket_number')->constrained('users')->nullOnDelete();
                }
                if (! Schema::hasColumn('support_tickets', 'franchise_id')) {
                    $table->foreignId('franchise_id')->nullable()->after('user_id')->constrained('users')->nullOnDelete();
                }
                if (! Schema::hasColumn('support_tickets', 'user_type')) {
                    $table->string('user_type')->default('Customer')->after('franchise_id');
                }
                if (! Schema::hasColumn('support_tickets', 'category')) {
                    $table->string('category')->default('General')->after('user_type');
                }
                if (! Schema::hasColumn('support_tickets', 'order_id')) {
                    $table->string('order_id')->nullable()->after('subject');
                }
                if (! Schema::hasColumn('support_tickets', 'priority')) {
                    $table->string('priority')->default('Medium')->after('order_id');
                }
                if (! Schema::hasColumn('support_tickets', 'assigned_to')) {
                    $table->foreignId('assigned_to')->nullable()->after('status')->constrained('users')->nullOnDelete();
                }
            });

            $driver = Schema::getConnection()->getDriverName();

            if ($driver === 'mysql') {
                if (Schema::hasColumn('support_tickets', 'franchise_id')) {
                    DB::statement('ALTER TABLE support_tickets MODIFY franchise_id BIGINT UNSIGNED NULL');
                }
                if (Schema::hasColumn('support_tickets', 'category')) {
                    DB::statement("ALTER TABLE support_tickets MODIFY category VARCHAR(255) NULL DEFAULT 'General'");
                }
                if (Schema::hasColumn('support_tickets', 'status')) {
                    DB::statement("ALTER TABLE support_tickets MODIFY status VARCHAR(255) NOT NULL DEFAULT 'Open'");
                }
                if (Schema::hasColumn('support_tickets', 'priority')) {
                    DB::statement("ALTER TABLE support_tickets MODIFY priority VARCHAR(255) NOT NULL DEFAULT 'Medium'");
                }
            }
        }

        if (Schema::hasColumn('support_tickets', 'ticket_number')) {
            DB::table('support_tickets')
                ->whereNull('ticket_number')
                ->orderBy('id')
                ->select('id')
                ->chunkById(100, function ($tickets) {
                    foreach ($tickets as $ticket) {
                        DB::table('support_tickets')
                            ->where('id', $ticket->id)
                            ->update(['ticket_number' => 'TKT-' . str_pad($ticket->id, 6, '0', STR_PAD_LEFT)]);
                    }
                });
        }

        if (Schema::hasColumn('support_tickets', 'user_type') && Schema::hasColumn('support_tickets', 'franchise_id')) {
            DB::table('support_tickets')
                ->whereNotNull('franchise_id')
                ->where(function ($query) {
                    $query->whereNull('user_type')->orWhere('user_type', 'Customer');
                })
                ->update(['user_type' => 'Franchise']);
        }

        if (! Schema::hasTable('support_ticket_messages')) {
            Schema::create('support_ticket_messages', function (Blueprint $table) {
                $table->id();
                $table->foreignId('ticket_id')->constrained('support_tickets')->cascadeOnDelete();
                $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
                $table->text('message');
                $table->string('attachment_path')->nullable();
                $table->boolean('is_admin_reply')->default(false);
                $table->timestamps();
            });
        } else {
            Schema::table('support_ticket_messages', function (Blueprint $table) {
                if (! Schema::hasColumn('support_ticket_messages', 'ticket_id')) {
                    $table->foreignId('ticket_id')->nullable()->after('id')->constrained('support_tickets')->cascadeOnDelete();
                }
                if (! Schema::hasColumn('support_ticket_messages', 'user_id')) {
                    $table->foreignId('user_id')->nullable()->after('ticket_id')->constrained('users')->nullOnDelete();
                }
                if (! Schema::hasColumn('support_ticket_messages', 'attachment_path')) {
                    $table->string('attachment_path')->nullable()->after('message');
                }
            });

            DB::table('support_ticket_messages')
                ->whereNull('ticket_id')
                ->when(Schema::hasColumn('support_ticket_messages', 'support_ticket_id'), fn ($query) => $query->update(['ticket_id' => DB::raw('support_ticket_id')]));
        }

        if (! Schema::hasTable('ticket_attachments')) {
            Schema::create('ticket_attachments', function (Blueprint $table) {
                $table->id();
                $table->foreignId('message_id')->constrained('support_ticket_messages')->cascadeOnDelete();
                $table->string('file_path');
                $table->string('file_name');
                $table->string('file_type')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        // Intentionally non-destructive. This migration normalizes live support data.
    }
};
