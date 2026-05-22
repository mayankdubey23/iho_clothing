<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureIsFranchise
{
    public function handle(Request $request, Closure $next): Response
    {
        // 1. Check if user is logged in
        if (!Auth::check()) {
            return redirect()->route('login')->with('error', 'Please login to access the Franchise Portal.');
        }

        // 2. Check if the logged-in user is actually a Franchise Admin
        // Assuming your users table uses 'franchise' as the role string for franchise owners
        if (Auth::user()->role !== 'franchise') {
            // Agar normal customer ya super admin aa gaya, toh access deny kar do
            abort(403, 'UNAUTHORIZED ACCESS: This portal is strictly restricted to Franchise Owners only.');
        }

        // 3. Optional: Check if franchise is blocked by Super Admin
        if (Auth::user()->status === 'blocked') {
            Auth::logout();
            return redirect()->route('login')->with('error', 'Your franchise account has been suspended. Please contact Super Admin.');
        }

        // Agar sab theek hai, toh andar aane do
        return $next($request);
    }
}