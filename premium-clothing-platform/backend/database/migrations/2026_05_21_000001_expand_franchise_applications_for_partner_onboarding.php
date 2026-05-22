<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('franchise_applications', function (Blueprint $table) {
            $columns = [
                'current_city' => fn () => $table->string('current_city')->nullable()->after('gender'),
                'current_state' => fn () => $table->string('current_state')->nullable()->after('current_city'),
                'full_address' => fn () => $table->text('full_address')->nullable()->after('current_state'),
                'country' => fn () => $table->string('country')->default('India')->after('pincode'),
                'preferred_area' => fn () => $table->string('preferred_area')->nullable()->after('preferred_city'),
                'preferred_pincode' => fn () => $table->string('preferred_pincode')->nullable()->after('preferred_area'),
                'has_shop' => fn () => $table->string('has_shop')->nullable()->after('franchise_type'),
                'clothing_experience' => fn () => $table->string('clothing_experience')->nullable()->after('experience_years'),
                'business_registration' => fn () => $table->string('business_registration')->nullable()->after('pan_number'),
                'can_purchase_initial_stock' => fn () => $table->string('can_purchase_initial_stock')->nullable()->after('investment_budget'),
                'ready_for_marketing_investment' => fn () => $table->string('ready_for_marketing_investment')->nullable()->after('expected_sales'),
                'has_storage_space' => fn () => $table->string('has_storage_space')->nullable()->after('ready_for_marketing_investment'),
                'has_staff' => fn () => $table->string('has_staff')->nullable()->after('has_storage_space'),
                'can_manage_packing' => fn () => $table->string('can_manage_packing')->nullable()->after('has_staff'),
                'can_manage_local_delivery' => fn () => $table->string('can_manage_local_delivery')->nullable()->after('can_manage_packing'),
                'can_handle_returns' => fn () => $table->string('can_handle_returns')->nullable()->after('can_manage_local_delivery'),
                'has_computer_internet' => fn () => $table->string('has_computer_internet')->nullable()->after('can_handle_returns'),
                'can_manage_customer_support' => fn () => $table->string('can_manage_customer_support')->nullable()->after('has_computer_internet'),
                'can_promote_social' => fn () => $table->string('can_promote_social')->nullable()->after('can_manage_customer_support'),
                'has_social_page' => fn () => $table->string('has_social_page')->nullable()->after('can_promote_social'),
                'has_local_network' => fn () => $table->string('has_local_network')->nullable()->after('has_social_page'),
                'can_run_ads' => fn () => $table->string('can_run_ads')->nullable()->after('has_local_network'),
                'can_promote_events' => fn () => $table->string('can_promote_events')->nullable()->after('can_run_ads'),
                'social_media_links' => fn () => $table->text('social_media_links')->nullable()->after('can_promote_events'),
                'cover_area' => fn () => $table->text('cover_area')->nullable()->after('why_franchise'),
                'start_timeline' => fn () => $table->string('start_timeline')->nullable()->after('cover_area'),
                'agree_pricing_policy' => fn () => $table->boolean('agree_pricing_policy')->default(false)->after('start_timeline'),
                'additional_message' => fn () => $table->text('additional_message')->nullable()->after('agree_pricing_policy'),
                'privacy_accepted' => fn () => $table->boolean('privacy_accepted')->default(false)->after('terms_accepted'),
                'verification_consent' => fn () => $table->boolean('verification_consent')->default(false)->after('privacy_accepted'),
                'gst_certificate_path' => fn () => $table->string('gst_certificate_path')->nullable()->after('pan_card_path'),
                'address_proof_path' => fn () => $table->string('address_proof_path')->nullable()->after('gst_certificate_path'),
                'shop_proof_path' => fn () => $table->string('shop_proof_path')->nullable()->after('address_proof_path'),
                'business_registration_path' => fn () => $table->string('business_registration_path')->nullable()->after('shop_proof_path'),
                'bank_proof_path' => fn () => $table->string('bank_proof_path')->nullable()->after('business_registration_path'),
                'approved_user_id' => fn () => $table->foreignId('approved_user_id')->nullable()->after('admin_notes')->constrained('users')->nullOnDelete(),
                'login_email' => fn () => $table->string('login_email')->nullable()->after('approved_user_id'),
                'temporary_password' => fn () => $table->string('temporary_password')->nullable()->after('login_email'),
            ];

            foreach ($columns as $column => $definition) {
                if (! Schema::hasColumn('franchise_applications', $column)) {
                    $definition();
                }
            }
        });
    }

    public function down(): void
    {
        Schema::table('franchise_applications', function (Blueprint $table) {
            foreach ([
                'current_city', 'current_state', 'full_address', 'country', 'preferred_area', 'preferred_pincode',
                'has_shop', 'clothing_experience', 'business_registration', 'can_purchase_initial_stock',
                'ready_for_marketing_investment', 'has_storage_space', 'has_staff', 'can_manage_packing',
                'can_manage_local_delivery', 'can_handle_returns', 'has_computer_internet',
                'can_manage_customer_support', 'can_promote_social', 'has_social_page', 'has_local_network',
                'can_run_ads', 'can_promote_events', 'social_media_links', 'cover_area', 'start_timeline',
                'agree_pricing_policy', 'additional_message', 'privacy_accepted', 'verification_consent',
                'gst_certificate_path', 'address_proof_path', 'shop_proof_path', 'business_registration_path',
                'bank_proof_path', 'approved_user_id', 'login_email', 'temporary_password',
            ] as $column) {
                if (Schema::hasColumn('franchise_applications', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
