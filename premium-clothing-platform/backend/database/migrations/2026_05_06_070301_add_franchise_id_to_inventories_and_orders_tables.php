<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // Inventories (Stock) Table Update
        Schema::table('inventories', function (Blueprint $table) {
            // Nullable ka matlab: Agar NULL hai, toh stock Super Admin ka hai!
            $table->foreignId('franchise_id')->nullable()->constrained('users')->onDelete('cascade')->after('id');
        });

        // Orders (Sales) Table Update
        Schema::table('orders', function (Blueprint $table) {
            // Jisne fulfill kiya, profit uska! NULL matlab Super Admin ne fulfill kiya.
            $table->foreignId('franchise_id')->nullable()->constrained('users')->onDelete('cascade')->after('id');
        });
    }

    public function down(): void
    {
        Schema::table('inventories', function (Blueprint $table) {
            $table->dropForeign(['franchise_id']);
            $table->dropColumn('franchise_id');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['franchise_id']);
            $table->dropColumn('franchise_id');
        });
    }
};