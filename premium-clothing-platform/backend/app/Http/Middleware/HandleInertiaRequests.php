<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use App\Models\StorefrontSetting;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $sharedUser = $user ? $user->only([
            'id',
            'name',
            'email',
            'mobile_number',
            'role',
            'address_line',
            'city',
            'state',
            'pincode',
            'country',
            'store_name',
            'store_address',
            'store_contact',
            'business_hours',
            'serviceable_pincodes',
            'created_at',
        ]) : null;

        if ($user && $sharedUser) {
            $sharedUser['addresses'] = $this->accountAddresses($user->id);
            $sharedUser['settings'] = $this->accountSettings($user->id);
            $sharedUser['payment_methods'] = $this->paymentMethods($user->id);
        }

        return [
            ...parent::share($request),
            
            'auth' => [
                'user' => $sharedUser,
            ],
            
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],

            'site' => fn () => $this->siteSettings(),
        ];
    }

    private function siteSettings(): array
    {
        if (! Schema::hasTable('storefront_settings')) {
            return [];
        }

        return StorefrontSetting::query()
            ->where(function ($query) {
                $query->where('key', 'like', 'site_%')
                    ->orWhere('key', 'like', 'nav_%')
                    ->orWhere('key', 'like', 'footer_%');
            })
            ->pluck('value', 'key')
            ->map(fn ($value) => is_string($value) ? trim($value) : $value)
            ->toArray();
    }

    private function accountAddresses(int $userId)
    {
        if (! Schema::hasTable('user_addresses')) {
            return [];
        }

        return DB::table('user_addresses')
            ->where('user_id', $userId)
            ->latest()
            ->get()
            ->map(fn ($address) => [
                'id' => $address->id,
                'full_name' => $address->full_name ?? '',
                'mobile_number' => $address->mobile_number ?? $address->phone ?? '',
                'house_no' => $address->house_no ?? $address->address_line ?? '',
                'area_locality' => $address->area_locality ?? '',
                'landmark' => $address->landmark ?? '',
                'pincode' => $address->pincode ?? '',
                'city' => $address->city ?? '',
                'state' => $address->state ?? '',
                'is_default' => (bool) ($address->is_default ?? false),
            ]);
    }

    private function accountSettings(int $userId)
    {
        if (! Schema::hasTable('user_settings')) {
            return [];
        }

        $settings = DB::table('user_settings')->where('user_id', $userId)->first();

        if (! $settings) {
            return [];
        }

        return [
            'order_updates' => (bool) ($settings->order_updates ?? $settings->notify_orders ?? true),
            'delivery_updates' => (bool) ($settings->delivery_updates ?? $settings->notify_delivery ?? true),
            'offer_alerts' => (bool) ($settings->offer_alerts ?? $settings->notify_offers ?? false),
            'new_products' => (bool) ($settings->new_products ?? true),
            'email_notif' => (bool) ($settings->email_notif ?? $settings->notify_email ?? true),
            'sms_notif' => (bool) ($settings->sms_notif ?? $settings->notify_sms ?? true),
            'whatsapp_notif' => (bool) ($settings->whatsapp_notif ?? $settings->notify_whatsapp ?? false),
        ];
    }

    private function paymentMethods(int $userId)
    {
        if (! Schema::hasTable('user_payment_methods')) {
            return [];
        }

        return DB::table('user_payment_methods')
            ->where('user_id', $userId)
            ->latest()
            ->get();
    }
}
