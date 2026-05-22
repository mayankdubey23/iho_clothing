<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LoginController extends Controller
{
    // ... (your login methods)

    // 🚀 SECURE LOGOUT ENGINE
    public function logout(Request $request)
    {
        // 1. Clear the authentication token/session
        Auth::guard('web')->logout();

        // 2. Invalidate the current session completely
        $request->session()->invalidate();

        // 3. Regenerate the CSRF token to prevent cross-site request forgery attacks
        $request->session()->regenerateToken();

        // 4. Redirect to the franchise login page securely
        return redirect('/login')->with('success', 'You have been securely logged out.');
    }
}