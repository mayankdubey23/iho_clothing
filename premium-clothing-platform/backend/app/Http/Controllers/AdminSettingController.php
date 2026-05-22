<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Artisan;

class AdminSettingController extends Controller
{
    public function index(Request $request)
    {
        $tab = $request->input('tab', 'general');

        // Fetch Data based on active tab to optimize load time
        $data = [];
        if ($tab === 'general') {
            $settingsList = DB::table('global_settings')->get();
            // Convert to simple key-value array for the frontend
            foreach ($settingsList as $setting) {
                $data[$setting->key] = $setting->value;
            }
        } elseif ($tab === 'gateways') {
            $data = DB::table('payment_gateways')->get();
        } elseif ($tab === 'seo') {
            $data = [
                'seo' => DB::table('seo_settings')->get(),
                'social' => DB::table('social_links')->get()
            ];
        }

        return Inertia::render('Admin/WebsiteSettings', [
            'tabData' => $data,
            'activeTab' => $tab,
        ]);
    }

    // 🚀 Update General Settings (Logo, Name, Maintenance)
    public function updateGeneral(Request $request)
    {
        $data = $request->except(['_token', 'logo']); // Exclude file upload from loop

        foreach ($data as $key => $value) {
            DB::table('global_settings')->updateOrInsert(
                ['key' => $key],
                ['value' => $value, 'updated_at' => now()]
            );
        }

        // Handle File Upload for Logo
        if ($request->hasFile('logo')) {
            $path = $request->file('logo')->store('settings', 'public');
            DB::table('global_settings')->updateOrInsert(
                ['key' => 'site_logo'],
                ['value' => $path, 'updated_at' => now()]
            );
        }

        // Trigger Laravel Maintenance Mode based on setting
        if ($request->maintenance_mode === 'true') {
            Artisan::call('down', ['--secret' => 'iho-admin-bypass']); // Allow admin bypass
        } else {
            Artisan::call('up');
        }

        return back()->with('success', 'Global Settings Updated Successfully!');
    }

    // 🚀 Update Payment Gateways
    public function updateGateway(Request $request, $id)
    {
        $validated = $request->validate([
            'is_active' => 'required|boolean',
            'mode' => 'required|string|in:sandbox,live',
            'api_key' => 'nullable|string',
            'api_secret' => 'nullable|string',
        ]);

        DB::table('payment_gateways')->where('id', $id)->update([
            'is_active' => $validated['is_active'],
            'mode' => $validated['mode'],
            'api_key' => $validated['api_key'], 
            'api_secret' => $validated['api_secret'], // Consider encrypt() in production
            'updated_at' => now()
        ]);

        return back()->with('success', 'Payment Gateway credentials saved.');
    }
}