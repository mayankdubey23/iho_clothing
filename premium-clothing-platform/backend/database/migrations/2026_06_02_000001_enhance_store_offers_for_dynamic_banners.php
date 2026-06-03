<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('store_offers')) {
            return;
        }

        Schema::table('store_offers', function (Blueprint $table) {
            if (! Schema::hasColumn('store_offers', 'subtitle')) {
                $table->string('subtitle')->nullable()->after('title');
            }

            if (! Schema::hasColumn('store_offers', 'offer_code')) {
                $table->string('offer_code')->nullable()->after('code');
            }

            if (! Schema::hasColumn('store_offers', 'display_type')) {
                $table->string('display_type')->default('store_offer')->after('offer_code');
            }

            if (! Schema::hasColumn('store_offers', 'bg_image')) {
                $table->string('bg_image', 1000)->nullable()->after('display_type');
            }

            if (! Schema::hasColumn('store_offers', 'target_url')) {
                $table->string('target_url')->nullable()->after('bg_image');
            }

            if (! Schema::hasColumn('store_offers', 'sort_order')) {
                $table->unsignedInteger('sort_order')->default(0)->after('target_url');
            }
        });
    }

    public function down(): void
    {
        if (! Schema::hasTable('store_offers')) {
            return;
        }

        Schema::table('store_offers', function (Blueprint $table) {
            foreach (['subtitle', 'offer_code', 'display_type', 'bg_image', 'target_url', 'sort_order'] as $column) {
                if (Schema::hasColumn('store_offers', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
