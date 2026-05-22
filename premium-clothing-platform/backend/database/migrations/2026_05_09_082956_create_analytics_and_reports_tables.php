<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        // 1. Daily Analytics Cache Table (For Super Fast Dashboard Load)
        Schema::create('daily_sales_summaries', function (Blueprint $table) {
            $table->id();
            $table->date('report_date')->unique(); // Ek din ki ek hi row hogi
            $table->decimal('total_revenue', 15, 2)->default(0); // D2C + B2B combined
            $table->decimal('franchise_revenue', 15, 2)->default(0); // Only B2B
            $table->integer('total_orders_count')->default(0);
            $table->integer('total_returns_count')->default(0);
            $table->integer('new_customers_count')->default(0);
            $table->decimal('total_discounts_given', 10, 2)->default(0);
            $table->timestamps();
        });

        // 2. Report Generation & Export Logs (Tracks who downloaded what)
        Schema::create('report_exports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('admin_id')->constrained('users')->onDelete('cascade'); // Who requested it
            $table->string('report_type'); // e.g., 'Sales', 'Franchise', 'Products'
            $table->string('date_range'); // e.g., 'this_month', 'last_7_days'
            $table->json('filters_applied')->nullable(); // Saved as JSON to know exact parameters
            $table->string('file_path')->nullable(); // Where the CSV/PDF is stored in storage
            $table->enum('status', ['Processing', 'Completed', 'Failed'])->default('Processing');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('report_exports');
        Schema::dropIfExists('daily_sales_summaries');
    }
};