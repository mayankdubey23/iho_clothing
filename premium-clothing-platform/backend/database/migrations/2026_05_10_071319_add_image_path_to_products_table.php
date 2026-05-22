<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::table('products', function (Blueprint $table) {
            // Check if column exists, then add it
            if (!Schema::hasColumn('products', 'image_path')) {
                $table->string('image_path')->nullable()->after('name');
            }
        });
    }

    public function down()
    {
        Schema::table('products', function (Blueprint $table) {
            if (Schema::hasColumn('products', 'image_path')) {
                $table->dropColumn('image_path');
            }
        });
    }
};