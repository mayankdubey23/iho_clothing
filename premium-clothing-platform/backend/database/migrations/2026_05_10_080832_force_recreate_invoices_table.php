<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up()
    {
        // 1. Disable Foreign Key Checks temporarily
        Schema::disableForeignKeyConstraints();

        // 2. Now forcefully drop the old table
        Schema::dropIfExists('invoices');

        // 3. Create the exact table we need for Franchise Wallet
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('franchise_id')->constrained('users')->onDelete('cascade'); 
            $table->string('invoice_number')->unique();
            $table->string('reference_type'); // 'B2B_Stock', 'B2C_Order'
            $table->string('reference_id');
            $table->decimal('total_amount', 12, 2);
            $table->string('file_path')->nullable();
            $table->timestamps();
        });

        // 4. Re-enable Foreign Key Checks to keep database secure
        Schema::enableForeignKeyConstraints();
    }

    public function down()
    {
        Schema::disableForeignKeyConstraints();
        Schema::dropIfExists('invoices');
        Schema::enableForeignKeyConstraints();
    }
};