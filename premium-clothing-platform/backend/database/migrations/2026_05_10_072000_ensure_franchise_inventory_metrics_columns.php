<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (!Schema::hasTable('franchise_inventory')) {
            return;
        }

        Schema::table('franchise_inventory', function (Blueprint $table) {
            if (!Schema::hasColumn('franchise_inventory', 'sold_quantity')) {
                $table->integer('sold_quantity')->default(0)->after('quantity');
            }

            if (!Schema::hasColumn('franchise_inventory', 'returned_quantity')) {
                $table->integer('returned_quantity')->default(0)->after('sold_quantity');
            }

            if (!Schema::hasColumn('franchise_inventory', 'damaged_quantity')) {
                $table->integer('damaged_quantity')->default(0)->after('returned_quantity');
            }

            if (!Schema::hasColumn('franchise_inventory', 'received_quantity')) {
                $table->integer('received_quantity')->default(0)->after('damaged_quantity');
            }
        });
    }

    public function down(): void
    {
        if (!Schema::hasTable('franchise_inventory')) {
            return;
        }

        Schema::table('franchise_inventory', function (Blueprint $table) {
            if (Schema::hasColumn('franchise_inventory', 'received_quantity')) {
                $table->dropColumn('received_quantity');
            }

            if (Schema::hasColumn('franchise_inventory', 'damaged_quantity')) {
                $table->dropColumn('damaged_quantity');
            }

            if (Schema::hasColumn('franchise_inventory', 'returned_quantity')) {
                $table->dropColumn('returned_quantity');
            }

            if (Schema::hasColumn('franchise_inventory', 'sold_quantity')) {
                $table->dropColumn('sold_quantity');
            }
        });
    }
};
