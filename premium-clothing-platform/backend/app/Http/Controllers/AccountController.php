<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Schema;


class AccountController extends Controller
{
    public function updateProfile(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'min:3', 'max:255', 'regex:/^[A-Za-z\s]+$/'],
            'email' => ['required', 'email', 'max:255'],
            'mobile_number' => ['nullable', 'regex:/^[6-9]\d{9}$/'],
            'gender' => ['nullable', 'string', 'max:30'],
            'dob' => ['nullable', 'date'],
        ]);

        $user = $request->user();
        $payload = [
            'name' => $validated['name'],
            'email' => $validated['email'],
        ];

        foreach (['mobile_number', 'gender', 'dob'] as $column) {
            if (Schema::hasColumn('users', $column)) {
                $payload[$column] = $validated[$column] ?? null;
            }
        }

        $user->forceFill($payload)->save();

        return back()->with('success', 'Profile updated successfully.');
    }

    public function updatePassword(Request $request)
    {
        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $request->user()->update([
            'password' => Hash::make($validated['password']),
        ]);

        return back()->with('success', 'Password updated securely.');
    }

    // 1. Update Notification Preferences
    public function updateNotifications(Request $request)
    {
        $user = auth()->user();

        $validated = $request->validate([
            'order_updates' => 'boolean',
            'delivery_updates' => 'boolean',
            'offer_alerts' => 'boolean',
            'new_products' => 'boolean',
            'email_notif' => 'boolean',
            'sms_notif' => 'boolean',
            'whatsapp_notif' => 'boolean',
        ]);

        if (Schema::hasTable('user_settings')) {
            $payload = ['updated_at' => now()];
            $columnMap = [
                'order_updates' => 'notify_orders',
                'delivery_updates' => 'notify_delivery',
                'offer_alerts' => 'notify_offers',
                'email_notif' => 'notify_email',
                'sms_notif' => 'notify_sms',
                'whatsapp_notif' => 'notify_whatsapp',
            ];

            foreach ($validated as $key => $value) {
                if (Schema::hasColumn('user_settings', $key)) {
                    $payload[$key] = $value;
                    continue;
                }

                $legacyColumn = $columnMap[$key] ?? null;
                if ($legacyColumn && Schema::hasColumn('user_settings', $legacyColumn)) {
                    $payload[$legacyColumn] = $value;
                }
            }

            DB::table('user_settings')->updateOrInsert(
                ['user_id' => $user->id],
                $payload
            );
        }

        return back()->with('success', 'Notification preferences updated.');
    }

    // 2. Download User Data (Privacy Tool)
    public function downloadData()
    {
        $user = auth()->user();

        $data = [
            'profile' => [
                'name' => $user->name,
                'email' => $user->email,
                'mobile' => $user->mobile_number,
                'joined_at' => $user->created_at,
            ],
            'saved_addresses' => DB::table('user_addresses')
                ->where('user_id', $user->id)
                ->get(),
            'support_tickets' => DB::table('support_tickets')
                ->where('user_id', $user->id)
                ->get(),
            'preferences' => DB::table('user_settings')
                ->where('user_id', $user->id)
                ->first(),
        ];

        $json = json_encode($data, JSON_PRETTY_PRINT);
        $fileName = 'IHO_UserData_' . $user->id . '.json';

        return Response::streamDownload(
            function () use ($json) {
                echo $json;
            },
            $fileName,
            [
                'Content-Type' => 'application/json',
            ]
        );
    }

    // 3. Remove Saved Payment Card
    public function removePaymentMethod($id)
    {
        if (Schema::hasTable('user_payment_methods')) {
            DB::table('user_payment_methods')
                ->where('id', $id)
                ->where('user_id', auth()->id())
                ->delete();
        }

        return back()->with('success', 'Payment method removed.');
    }

    // Save New Address
    public function storeAddress(Request $request)
    {
        $validated = $request->validate([
            'full_name' => 'required|string|regex:/^[A-Za-z\s]+$/',
            'mobile_number' => 'required|regex:/^[6-9]\d{9}$/',
            'house_no' => 'required|string',
            'area_locality' => 'required|string',
            'pincode' => 'required|regex:/^\d{6}$/',
            'city' => 'required|string',
            'state' => 'required|string',
            'is_default' => 'boolean',
        ]);

        if (! Schema::hasTable('user_addresses')) {
            return back()->with('error', 'Address book is not available yet.');
        }

        if ($request->is_default) {
            DB::table('user_addresses')->where('user_id', auth()->id())->update(['is_default' => false]);
        }

        $addressData = [
            'user_id' => auth()->id(),
            'full_name' => $validated['full_name'],
            'pincode' => $validated['pincode'],
            'city' => $validated['city'],
            'state' => $validated['state'],
            'is_default' => (bool) ($validated['is_default'] ?? false),
            'created_at' => now(),
            'updated_at' => now(),
        ];

        if (Schema::hasColumn('user_addresses', 'mobile_number')) {
            $addressData['mobile_number'] = $validated['mobile_number'];
        } elseif (Schema::hasColumn('user_addresses', 'phone')) {
            $addressData['phone'] = $validated['mobile_number'];
        }

        if (Schema::hasColumn('user_addresses', 'house_no')) {
            $addressData['house_no'] = $validated['house_no'];
        }

        if (Schema::hasColumn('user_addresses', 'area_locality')) {
            $addressData['area_locality'] = $validated['area_locality'];
        }

        if (Schema::hasColumn('user_addresses', 'landmark')) {
            $addressData['landmark'] = $request->landmark;
        }

        if (Schema::hasColumn('user_addresses', 'address_line')) {
            $addressData['address_line'] = trim($validated['house_no'] . ', ' . $validated['area_locality']);
        }

        if (Schema::hasColumn('user_addresses', 'type')) {
            $addressData['type'] = 'Home';
        }

        DB::table('user_addresses')->insert($addressData);

        return back()->with('success', 'Address saved successfully.');
    }

    // Submit Support Ticket
    public function storeTicket(Request $request)
    {
        $validated = $request->validate([
            'subject' => 'required|string',
            'order_id' => 'nullable|string',
            'message' => 'required|string|min:10',
        ]);

        // Assuming you have a support_tickets table
        DB::table('support_tickets')->insert([
            'user_id' => auth()->id(),
            'subject' => $validated['subject'],
            'order_id' => $validated['order_id'],
            'message' => $validated['message'],
            'status' => 'Open',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return back()->with('success', 'Ticket raised successfully. We will get back to you soon.');
    }

    

    // Delete Account
    public function destroyAccount(Request $request)
    {
        $request->validate([
            'password' => 'required|current_password',
            'reason' => 'required|string',
            'confirm_understand' => 'accepted'
        ]);

        $user = auth()->user();
        
        // Log the reason (Optional but good for business)
        DB::table('account_deletions')->insert([
            'email' => $user->email,
            'reason' => $request->reason,
            'created_at' => now()
        ]);

        auth()->logout();
        $user->delete();

        return redirect('/')->with('success', 'Your account has been securely deleted.');
    }
}
