<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
{
    Schema::create('user_settings', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->constrained()->onDelete('cascade');
        
        // Notifications
        $table->boolean('notify_orders')->default(true);
        $table->boolean('notify_delivery')->default(true);
        $table->boolean('notify_offers')->default(false);
        $table->boolean('notify_email')->default(true);
        $table->boolean('notify_sms')->default(true);
        $table->boolean('notify_whatsapp')->default(false);
        
        // Privacy
        $table->boolean('marketing_consent')->default(false);
        $table->boolean('data_sharing')->default(false);
        
        $table->timestamps();
    });
}
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_settings');
    }
};
