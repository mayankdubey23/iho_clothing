<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class AdminAuthController extends Controller
{
    // 🚀 Secure Logout & Session Termination
    public function logout(Request $request)
    {
        // 1. Record Activity Log before killing the session
        if (Auth::check()) {
            DB::table('activity_logs')->insert([
                'user_id' => Auth::id(),
                'role' => Auth::user()->role ?? 'Admin',
                'action' => 'Logged out of the system',
                'module' => 'Authentication',
                'ip_address' => $request->ip(),
                'device_info' => $request->header('User-Agent'),
                'created_at' => now(),
            ]);
        }

        // 2. Laravel Native Logout
        Auth::guard('web')->logout();

        // 3. Invalidate Session (Destroys all session data)
        $request->session()->invalidate();

        // 4. Regenerate CSRF Token (Prevents Session Fixation Attacks)
        $request->session()->regenerateToken();

        // 5. Redirect to Login Page
        return redirect('/login')->with('success', 'Logged out securely.');
    }
}
