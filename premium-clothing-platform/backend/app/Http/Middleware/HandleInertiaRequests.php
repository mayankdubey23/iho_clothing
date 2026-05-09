<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
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
        return [
            ...parent::share($request),
            
            'auth' => [
                // Direct evaluation (Removed fn() =>) to ensure React gets data instantly on first load
                'user' => $request->user() ? $request->user()->only([
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
                    'created_at'
                ]) : null,
            ],
            
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ];
    }
}