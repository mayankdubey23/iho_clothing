<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::table('orders', function (Blueprint $table) {
            // Safely add user_id if it doesn't exist
            if (!Schema::hasColumn('orders', 'user_id')) {
                // Made nullable so existing dummy orders don't crash
                $table->foreignId('user_id')->nullable()->after('id')->constrained('users')->onDelete('set null');
            }
        });
    }

    public function down()
    {
        Schema::table('orders', function (Blueprint $table) {
            if (Schema::hasColumn('orders', 'user_id')) {
                $table->dropForeign(['user_id']);
                $table->dropColumn('user_id');
            }
        });
    }
};