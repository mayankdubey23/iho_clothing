<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('coupons')) {
            Schema::create('coupons', function (Blueprint $table) {
                $table->id();
                $table->string('code')->unique();
                $table->enum('type', ['flat', 'percentage', 'free_shipping'])->default('percentage');
                $table->decimal('value', 10, 2)->nullable();
                $table->decimal('min_order_value', 10, 2)->default(0);
                $table->decimal('max_discount_amount', 10, 2)->nullable();
                $table->dateTime('expiry_date')->nullable();
                $table->integer('usage_limit')->nullable();
                $table->integer('used_count')->default(0);
                $table->enum('target_audience', ['all', 'b2c_customers', 'b2b_franchises'])->default('all');
                $table->enum('status', ['active', 'inactive', 'expired'])->default('active');
                $table->timestamps();
            });
        } else {
            DB::statement("ALTER TABLE coupons MODIFY COLUMN type ENUM('fixed','percent','flat','percentage','free_shipping') NOT NULL DEFAULT 'percentage'");

            Schema::table('coupons', function (Blueprint $table) {
                if (! Schema::hasColumn('coupons', 'min_order_value')) {
                    $table->decimal('min_order_value', 10, 2)->default(0)->after('value');
                }

                if (! Schema::hasColumn('coupons', 'max_discount_amount')) {
                    $table->decimal('max_discount_amount', 10, 2)->nullable()->after('min_order_value');
                }

                if (! Schema::hasColumn('coupons', 'expiry_date')) {
                    $table->dateTime('expiry_date')->nullable()->after('max_discount_amount');
                }

                if (! Schema::hasColumn('coupons', 'usage_limit')) {
                    $table->integer('usage_limit')->nullable()->after('expiry_date');
                }

                if (! Schema::hasColumn('coupons', 'used_count')) {
                    $table->integer('used_count')->default(0)->after('usage_limit');
                }

                if (! Schema::hasColumn('coupons', 'target_audience')) {
                    $table->enum('target_audience', ['all', 'b2c_customers', 'b2b_franchises'])->default('all')->after('used_count');
                }

                if (! Schema::hasColumn('coupons', 'status')) {
                    $table->enum('status', ['active', 'inactive', 'expired'])->default('active')->after('target_audience');
                }
            });

            DB::table('coupons')->where('type', 'fixed')->update(['type' => 'flat']);
            DB::table('coupons')->where('type', 'percent')->update(['type' => 'percentage']);

            if (Schema::hasColumn('coupons', 'min_cart_amount')) {
                DB::statement('UPDATE coupons SET min_order_value = min_cart_amount WHERE min_order_value = 0');
            }

            if (Schema::hasColumn('coupons', 'expires_at')) {
                DB::statement('UPDATE coupons SET expiry_date = expires_at WHERE expiry_date IS NULL AND expires_at IS NOT NULL');
            }

            if (Schema::hasColumn('coupons', 'is_active')) {
                DB::statement("UPDATE coupons SET status = CASE WHEN is_active = 1 THEN 'active' ELSE 'inactive' END");
            }

            DB::statement("ALTER TABLE coupons MODIFY COLUMN type ENUM('flat','percentage','free_shipping') NOT NULL DEFAULT 'percentage'");
        }

        if (! Schema::hasTable('franchise_coupons')) {
            Schema::create('franchise_coupons', function (Blueprint $table) {
                $table->id();
                $table->foreignId('coupon_id')->constrained('coupons')->onDelete('cascade');
                $table->foreignId('franchise_id')->constrained('users')->onDelete('cascade');
            });
        }

        if (! Schema::hasTable('category_coupons')) {
            Schema::create('category_coupons', function (Blueprint $table) {
                $table->id();
                $table->foreignId('coupon_id')->constrained('coupons')->onDelete('cascade');
                $table->foreignId('category_id')->constrained('categories')->onDelete('cascade');
            });
        }

        if (! Schema::hasTable('product_coupons')) {
            Schema::create('product_coupons', function (Blueprint $table) {
                $table->id();
                $table->foreignId('coupon_id')->constrained('coupons')->onDelete('cascade');
                $table->foreignId('product_id')->constrained('products')->onDelete('cascade');
            });
        }

        if (! Schema::hasTable('coupon_usages')) {
            Schema::create('coupon_usages', function (Blueprint $table) {
                $table->id();
                $table->foreignId('coupon_id')->constrained('coupons')->onDelete('cascade');
                $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
                $table->foreignId('order_id')->constrained('orders')->onDelete('cascade');
                $table->decimal('discount_applied', 10, 2);
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('coupon_usages');
        Schema::dropIfExists('product_coupons');
        Schema::dropIfExists('category_coupons');
        Schema::dropIfExists('franchise_coupons');
    }
};
