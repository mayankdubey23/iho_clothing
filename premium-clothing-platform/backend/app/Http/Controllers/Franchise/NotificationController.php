<?php

namespace App\Http\Controllers\Franchise;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    public function index()
    {
        $franchiseId = Auth::id();

        // Fetch notifications specific to this user, sorted by latest
        $notifications = DB::table('notification_users')
            ->join('notifications', 'notification_users.notification_id', '=', 'notifications.id')
            ->where('notification_users.user_id', $franchiseId)
            ->select(
                'notifications.*', 
                'notification_users.id as mapping_id', 
                'notification_users.is_read', 
                'notification_users.read_at'
            )
            ->orderBy('notifications.created_at', 'desc')
            ->paginate(20);

        $unreadCount = DB::table('notification_users')
            ->where('user_id', $franchiseId)
            ->where('is_read', false)
            ->count();

        return Inertia::render('Franchise/Notifications', [
            'notifications' => $notifications,
            'unreadCount' => $unreadCount
        ]);
    }

    public function markAsRead($mappingId)
    {
        DB::table('notification_users')
            ->where('id', $mappingId)
            ->where('user_id', Auth::id()) // Security check
            ->update([
                'is_read' => true,
                'read_at' => now(),
                'updated_at' => now()
            ]);

        return back();
    }

    public function markAllAsRead()
    {
        DB::table('notification_users')
            ->where('user_id', Auth::id())
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now(),
                'updated_at' => now()
            ]);

        return back()->with('success', 'All notifications marked as read.');
    }
}