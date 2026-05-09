<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Response;


class AccountController extends Controller
{
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

        DB::table('user_settings')->updateOrInsert(
            ['user_id' => $user->id],
            array_merge($validated, ['updated_at' => now()])
        );

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
        DB::table('user_payment_methods')
            ->where('id', $id)
            ->where('user_id', auth()->id())
            ->delete();

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

        // If this is set to default, make other addresses non-default
        if ($request->is_default) {
            DB::table('user_addresses')->where('user_id', auth()->id())->update(['is_default' => false]);
        }

        auth()->user()->addresses()->create($validated);

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