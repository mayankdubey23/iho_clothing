<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            if (!Schema::hasColumn('orders', 'full_name')) {
                $table->string('full_name', 100)->nullable();
            }
            if (!Schema::hasColumn('orders', 'mobile_number')) {
                $table->string('mobile_number', 10)->nullable();
            }
            if (!Schema::hasColumn('orders', 'email')) {
                $table->string('email', 150)->nullable();
            }
            if (!Schema::hasColumn('orders', 'alternate_mobile_number')) {
                $table->string('alternate_mobile_number', 10)->nullable();
            }
            if (!Schema::hasColumn('orders', 'house_flat_building')) {
                $table->string('house_flat_building')->nullable();
            }
            if (!Schema::hasColumn('orders', 'street_area_locality')) {
                $table->string('street_area_locality')->nullable();
            }
            if (!Schema::hasColumn('orders', 'landmark')) {
                $table->string('landmark')->nullable();
            }
            if (!Schema::hasColumn('orders', 'city')) {
                $table->string('city', 100)->nullable();
            }
            if (!Schema::hasColumn('orders', 'state')) {
                $table->string('state', 100)->nullable();
            }
            if (!Schema::hasColumn('orders', 'pincode')) {
                $table->string('pincode', 6)->nullable();
            }
            if (!Schema::hasColumn('orders', 'country')) {
                $table->string('country', 100)->default('India');
            }
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            foreach ([
                'full_name',
                'mobile_number',
                'email',
                'alternate_mobile_number',
                'house_flat_building',
                'street_area_locality',
                'landmark',
                'city',
                'state',
                'pincode',
                'country',
            ] as $column) {
                if (Schema::hasColumn('orders', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
