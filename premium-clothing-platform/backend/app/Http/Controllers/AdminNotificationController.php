<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class AdminNotificationController extends Controller
{
    public function index(Request $request)
    {
        $tab = $request->input('tab', 'broadcast'); // Default tab is the broadcast form
        $search = $request->input('search', '');
        $data = [];

        if ($tab === 'history') {
            $data = DB::table('notifications')
                ->join('users', 'notifications.created_by', '=', 'users.id')
                ->select('notifications.*', 'users.name as sender_name')
                ->when($search, fn($q) => $q->where('title', 'like', "%{$search}%"))
                ->orderBy('created_at', 'desc')
                ->paginate(15)->withQueryString();
        } elseif ($tab === 'email_logs') {
            $data = DB::table('email_logs')->orderBy('created_at', 'desc')->paginate(15)->withQueryString();
        } elseif ($tab === 'whatsapp_logs') {
            $data = DB::table('whatsapp_logs')->orderBy('created_at', 'desc')->paginate(15)->withQueryString();
        }

        $stats = [
            'total_sent' => DB::table('notifications')->count(),
            'whatsapp_sent' => DB::table('whatsapp_logs')->where('status', 'Sent')->count(),
            'emails_sent' => DB::table('email_logs')->where('status', 'Sent')->count(),
        ];

        return Inertia::render('Admin/Notifications', [
            'tabData' => $data,
            'activeTab' => $tab,
            'stats' => $stats
        ]);
    }

    // 🚀 Send/Broadcast Notification
    public function send(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'message' => 'required|string',
            'type' => 'required|string',
            'target_audience' => 'required|string',
            'channels' => 'required|array|min:1', // e.g. ['In-App', 'Email', 'WhatsApp']
        ]);

        DB::transaction(function () use ($validated) {
            // 1. Save Main Notification
            $notificationId = DB::table('notifications')->insertGetId([
                'title' => $validated['title'],
                'message' => $validated['message'],
                'type' => $validated['type'],
                'target_audience' => $validated['target_audience'],
                'channels_used' => json_encode($validated['channels']),
                'created_by' => auth()->id(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Note: In a real app, you would loop through users based on target_audience 
            // and dispatch Jobs to actual APIs (Twilio, Mailgun, WhatsApp API).
            // Here we simulate logging it.

            if (in_array('Email', $validated['channels'])) {
                DB::table('email_logs')->insert([
                    'to_email' => 'broadcast@'.$validated['target_audience'].'.com', // Simulation
                    'subject' => $validated['title'],
                    'status' => 'Sent',
                    'sent_at' => now(),
                    'created_at' => now(),
                ]);
            }

            if (in_array('WhatsApp', $validated['channels'])) {
                DB::table('whatsapp_logs')->insert([
                    'phone_number' => 'Bulk Audience', // Simulation
                    'message' => $validated['title'] . ' - ' . substr($validated['message'], 0, 20) . '...',
                    'status' => 'Sent',
                    'sent_at' => now(),
                    'created_at' => now(),
                ]);
            }
        });

        return back()->with('success', 'Blast successful! Notification sent via selected channels.');
    }
}