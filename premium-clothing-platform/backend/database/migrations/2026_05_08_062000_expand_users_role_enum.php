<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("
            ALTER TABLE users
            MODIFY COLUMN role
            ENUM('super_admin','admin','franchise','customer')
            NOT NULL DEFAULT 'customer'
        ");
    }

    public function down(): void
    {
        DB::table('users')->where('role', 'admin')->update(['role' => 'super_admin']);

        DB::statement("
            ALTER TABLE users
            MODIFY COLUMN role
            ENUM('super_admin','franchise','customer')
            NOT NULL DEFAULT 'customer'
        ");
    }
};
