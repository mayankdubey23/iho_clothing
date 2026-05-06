<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('franchise_pincodes', function (Blueprint $table) {
            $table->id();
            // Kaunsi franchise ka pincode hai (users table se link, jiska role 'franchise' hai)
            $table->foreignId('franchise_id')->constrained('users')->onDelete('cascade');
            $table->string('pincode', 10);
            
            // Ek franchise ek pincode ko ek hi baar add kar sakti hai
            $table->unique(['franchise_id', 'pincode']);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('franchise_pincodes');
    }
};