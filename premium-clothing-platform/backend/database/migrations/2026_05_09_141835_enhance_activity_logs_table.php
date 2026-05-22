<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::table('activity_logs', function (Blueprint $table) {
            // Safely adding new columns to the existing table
            if (!Schema::hasColumn('activity_logs', 'role')) {
                $table->string('role')->nullable()->after('user_id');
            }
            if (!Schema::hasColumn('activity_logs', 'old_value')) {
                $table->json('old_value')->nullable()->after('module');
            }
            if (!Schema::hasColumn('activity_logs', 'new_value')) {
                $table->json('new_value')->nullable()->after('old_value');
            }
            if (!Schema::hasColumn('activity_logs', 'device_info')) {
                $table->string('device_info')->nullable()->after('ip_address');
            }
        });
    }

    public function down()
    {
        Schema::table('activity_logs', function (Blueprint $table) {
            $table->dropColumn(['role', 'old_value', 'new_value', 'device_info']);
        });
    }
};