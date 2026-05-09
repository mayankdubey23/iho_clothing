<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // 🚀 CSRF Bypass for Postman Testing
        $middleware->validateCsrfTokens(except: [
            'login',
            'register',
            'orders',       // 👈 EXACT '/orders' ROUTE KE LIYE YEH ZAROORI HAI
            'orders/*',     // Checkout ke baaki routes ke liye
            'admin/*',      // Saare admin routes bypass
            'franchise/*',  // Saare franchise routes bypass
            'payment/*',    // Payment callbacks bypass
            '*',            // Fallback (Safe side ke liye saari API bypass)
        ]);

        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();