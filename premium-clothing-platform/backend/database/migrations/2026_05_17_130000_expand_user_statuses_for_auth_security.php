<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('users', 'status')) {
            DB::statement("ALTER TABLE users MODIFY status VARCHAR(40) NOT NULL DEFAULT 'active'");
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('users', 'status')) {
            DB::statement("UPDATE users SET status = 'blocked' WHERE status IN ('suspended', 'deleted')");
            DB::statement("UPDATE users SET status = 'active' WHERE status NOT IN ('active', 'blocked')");
            DB::statement("ALTER TABLE users MODIFY status ENUM('active', 'blocked') NOT NULL DEFAULT 'active'");
        }
    }
};
