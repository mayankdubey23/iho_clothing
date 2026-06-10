<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SuperAdminMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        // Check if user is logged in AND their role is 'super_admin' or 'admin'
        if (auth()->check() && in_array(auth()->user()->role, ['super_admin', 'admin'])) {
            return $next($request);
        }

        // Agar normal user hai, toh 403 Access Denied dikhao
        abort(403, 'Unauthorized action. Super Admin access required.');
    }
}