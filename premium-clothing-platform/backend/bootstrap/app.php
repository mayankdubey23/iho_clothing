<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        
        // POSTMAN TESTING KE LIYE EXACT ROUTES BYPASS
        $middleware->validateCsrfTokens(except: [
            '*',
            'orders',       // Seedha orders API ke liye
            'orders/*',     // Orders ke aage ke routes ke liye
            'franchise/*',  // Franchise APIs ke liye
            'admin/*'       // Admin APIs ke liye
        ]);

    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();