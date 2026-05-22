<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        // 1. Courier Partners (e.g., Delhivery, BlueDart)
        Schema::create('courier_partners', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('tracking_url_base')->nullable(); // e.g., https://www.delhivery.com/track/package/
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
        });

        // 2. Shipping Zones (e.g., North India, South India, Local)
        Schema::create('shipping_zones', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->timestamps();
        });

        // 3. Shipping Rates & Rules
        Schema::create('shipping_rates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('zone_id')->constrained('shipping_zones')->onDelete('cascade');
            $table->decimal('base_rate', 10, 2); // Flat delivery charge
            $table->decimal('free_delivery_threshold', 10, 2)->nullable(); // e.g., Free above ₹1000
            $table->timestamps();
        });

        // 4. Pincode Serviceability (Hyper-local Control)
        Schema::create('pincode_serviceability', function (Blueprint $table) {
            $table->id();
            $table->string('pincode')->unique();
            $table->foreignId('zone_id')->nullable()->constrained('shipping_zones')->onDelete('set null');
            $table->boolean('is_cod_available')->default(true);
            $table->integer('estimated_delivery_days')->default(3);
            $table->enum('status', ['active', 'blocked'])->default('active');
            $table->timestamps();
        });

        // 5. Shipment Tracking (Attached to Orders)
        Schema::create('shipments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->onDelete('cascade');
            $table->foreignId('courier_id')->nullable()->constrained('courier_partners');
            $table->string('tracking_number')->nullable();
            $table->enum('delivery_status', ['Pending', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Failed Delivery', 'Returned'])->default('Pending');
            $table->timestamp('shipped_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('shipments');
        Schema::dropIfExists('pincode_serviceability');
        Schema::dropIfExists('shipping_rates');
        Schema::dropIfExists('shipping_zones');
        Schema::dropIfExists('courier_partners');
    }
};