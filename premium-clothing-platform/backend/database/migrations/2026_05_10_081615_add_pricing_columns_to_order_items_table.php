<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::table('order_items', function (Blueprint $table) {
            // Check and add unit_price if missing
            if (!Schema::hasColumn('order_items', 'unit_price')) {
                $table->decimal('unit_price', 10, 2)->default(0)->after('product_id');
            }
            // Check and add total_price if missing
            if (!Schema::hasColumn('order_items', 'total_price')) {
                $table->decimal('total_price', 10, 2)->default(0)->after('quantity');
            }
        });
    }

    public function down()
    {
        Schema::table('order_items', function (Blueprint $table) {
            if (Schema::hasColumn('order_items', 'total_price')) {
                $table->dropColumn('total_price');
            }
            if (Schema::hasColumn('order_items', 'unit_price')) {
                $table->dropColumn('unit_price');
            }
        });
    }
};