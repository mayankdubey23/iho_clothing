<?php

namespace App\Http\Controllers\Franchise;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        // Ensure profile and bank details exist
        $profile = DB::table('franchise_profiles')->where('user_id', $user->id)->first();
        if (!$profile) {
            DB::table('franchise_profiles')->insert(['user_id' => $user->id, 'created_at' => now()]);
            $profile = DB::table('franchise_profiles')->where('user_id', $user->id)->first();
        }

        $bank = DB::table('bank_details')->where('user_id', $user->id)->first();
        if (!$bank) {
            DB::table('bank_details')->insert(['user_id' => $user->id, 'created_at' => now()]);
            $bank = DB::table('bank_details')->where('user_id', $user->id)->first();
        }

        // Check for pending sensitive updates
        $pendingRequest = DB::table('profile_update_requests')
            ->where('user_id', $user->id)
            ->where('status', 'Pending')
            ->first();

        return Inertia::render('Franchise/Profile', [
            'user' => $user,
            'profile' => $profile,
            'bank' => $bank,
            'pendingRequest' => $pendingRequest ? json_decode($pendingRequest->requested_data) : null
        ]);
    }

    // 🚀 General Updates (Instant Approval)
    public function updateGeneral(Request $request)
    {
        $request->validate([
            'name' => ['required', 'string', 'regex:/^[a-zA-Z\s]+$/', 'max:255'], // No numbers
            'email' => ['required', 'email', 'max:255', 'unique:users,email,' . Auth::id()],
            'phone' => ['required', 'regex:/^[6-9]\d{9}$/'], // 10-digit Indian
            'whatsapp_number' => ['nullable', 'regex:/^[6-9]\d{9}$/'],
            'business_name' => ['required', 'string', 'max:255'],
            'logo' => ['nullable', 'image', 'mimes:jpeg,png,jpg', 'max:2048']
        ]);

        $user = Auth::user();

        // Update basic User table
        DB::table('users')->where('id', $user->id)->update([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'updated_at' => now()
        ]);

        // Upload Logo if provided
        $logoPath = DB::table('franchise_profiles')->where('user_id', $user->id)->value('logo_path');
        if ($request->hasFile('logo')) {
            if ($logoPath) Storage::disk('public')->delete($logoPath);
            $logoPath = $request->file('logo')->store('franchise_logos', 'public');
        }

        // Update Profile
        DB::table('franchise_profiles')->where('user_id', $user->id)->update([
            'business_name' => $request->business_name,
            'whatsapp_number' => $request->whatsapp_number,
            'logo_path' => $logoPath,
            'updated_at' => now()
        ]);

        DB::table('activity_logs')->insert([
            'user_id' => Auth::id(),
            'module' => 'Profile',
            'action' => 'Profile Updated',
            'description' => 'Updated general franchise profile details.',
            'ip_address' => $request->ip(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return back()->with('success', 'General profile updated successfully.');
    }

    // 🚀 Sensitive Updates (Needs Super Admin Approval)
    public function requestSensitiveUpdate(Request $request)
    {
        // Strict Indian Format Validations
        $request->validate([
            'gst_number' => ['nullable', 'regex:/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/'],
            'pan_number' => ['nullable', 'regex:/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/'],
            'pincode' => ['nullable', 'regex:/^[1-9][0-9]{5}$/'],
            'city' => 'nullable|string',
            'state' => 'nullable|string',
            'address_line' => 'nullable|string',
            'bank_name' => 'nullable|string',
            'account_name' => 'nullable|string|regex:/^[a-zA-Z\s]+$/',
            'account_number' => 'nullable|string|regex:/^\d{9,18}$/',
            'ifsc_code' => ['nullable', 'regex:/^[A-Z]{4}0[A-Z0-9]{6}$/']
        ], [
            'gst_number.regex' => 'Please enter a valid 15-character GSTIN format.',
            'pan_number.regex' => 'Please enter a valid 10-character PAN format.',
            'pincode.regex' => 'Please enter a valid 6-digit Indian pincode.',
            'account_name.regex' => 'Account name cannot contain numbers.',
            'ifsc_code.regex' => 'Please enter a valid 11-character IFSC code.'
        ]);

        // Create a Pending Request instead of direct update
        DB::table('profile_update_requests')->updateOrInsert(
            ['user_id' => Auth::id(), 'status' => 'Pending'],
            [
                'requested_data' => json_encode($request->except(['_token'])),
                'created_at' => now(),
                'updated_at' => now()
            ]
        );

        DB::table('activity_logs')->insert([
            'user_id' => Auth::id(),
            'module' => 'Profile',
            'action' => 'Sensitive Update Requested',
            'description' => 'Submitted sensitive franchise profile details for approval.',
            'ip_address' => $request->ip(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return back()->with('success', 'Sensitive data update request sent to Super Admin. It is currently under review.');
    }
}
