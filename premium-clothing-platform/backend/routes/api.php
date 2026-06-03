<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\FranchisePlanController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\UserFranchiseController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AdminProductController;
use App\Http\Controllers\AdminCategoryController;
use App\Http\Controllers\AdminSkuController;
use App\Http\Controllers\AdminInventoryController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\Api\StorefrontController; // 🚀 Added our new Mobile Storefront Controller
use App\Models\Product;
use App\Models\StorefrontSetting;
use Illuminate\Support\Facades\Schema;

// ============== PUBLIC API ROUTES ==============

// 🔑 Authentication Routes (Mobile App Login/Register)
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:5,1');
Route::post('/auth/verify-otp', [AuthController::class, 'verifyOtp'])->middleware('throttle:5,1');
Route::post('/auth/reset-password', [AuthController::class, 'resetPassword'])->middleware('throttle:5,1');
Route::post('/auth/mobile-otp', [AuthController::class, 'requestMobileOtp'])->middleware('throttle:5,1');
Route::post('/auth/mobile-login', [AuthController::class, 'verifyMobileLogin'])->middleware('throttle:5,1');

// 🛍️ Public Store Data
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{product:slug}', [ProductController::class, 'show']);
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/franchise-plans', [FranchisePlanController::class, 'index']);
Route::get('/franchise-plans/{franchisePlan}', [FranchisePlanController::class, 'show']);

// 🎬 Mobile App Cinematic Hero Stack
Route::get('/hero-slides', [StorefrontController::class, 'getHeroSlides']); // 🚀 Route to feed the vertical scrolling UI

// 🎯 Custom Mobile Homepage / Men Section (Retained for other components)
Route::get('/men', function () {
    $categories = [
        ['name' => 'Men T-Shirts', 'slug' => 't-shirts', 'href' => '/shop?gender=men&subcategory=t-shirts'],
        ['name' => 'Men Track Pants', 'slug' => 'track-pants', 'href' => '/shop?gender=men&subcategory=track-pants'],
        ['name' => 'Men Shorts', 'slug' => 'shorts', 'href' => '/shop?gender=men&subcategory=shorts'],
        ['name' => 'Men Jackets', 'slug' => 'jackets', 'href' => '/shop?gender=men&subcategory=jackets'],
        ['name' => 'Men Gym Wear', 'slug' => 'gym-wear', 'href' => '/shop?gender=men&subcategory=gym-wear'],
        ['name' => 'Men Running Wear', 'slug' => 'running-wear', 'href' => '/shop?gender=men&subcategory=running-wear'],
        ['name' => 'Men Shoes', 'slug' => 'shoes', 'href' => '/shop?gender=men&subcategory=shoes'],
        ['name' => 'Men Accessories', 'slug' => 'accessories', 'href' => '/shop?gender=men&subcategory=accessories'],
    ];

    $products = Product::query()
        ->with(['category', 'skus.inventory', 'images' => fn ($query) => $query->orderByDesc('is_primary')->orderBy('sort_order')])
        ->where('is_active', true)
        ->when(Schema::hasColumn('products', 'gender'), fn ($query) => $query->where('gender', 'men'))
        ->when(Schema::hasColumn('products', 'is_featured'), fn ($query) => $query->where('is_featured', true))
        ->latest()
        ->take(8)
        ->get();

    return response()->json([
        'success' => true,
        'data' => [
            'cms' => StorefrontSetting::whereIn('key', [
                'men_hero_title',
                'men_hero_subtitle',
                'men_hero_banner',
                'men_offer_title',
                'men_offer_subtitle',
            ])->pluck('value', 'key')->toArray(),
            'categories' => $categories,
            'featured_products' => $products,
        ],
    ]);
});

// ============== PROTECTED ROUTES (Requires Token from App) ==============
Route::middleware('auth:sanctum')->group(function () {
    // Current User Data
    Route::get('/user', function (Request $request) {
        return response()->json([
            'success' => true,
            'user' => $request->user()
        ]);
    });

    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::get('/auth/login-activity', [AuthController::class, 'loginActivity']);

    // Franchise Application System
    Route::get('/franchise-applications', [UserFranchiseController::class, 'index']);
    Route::post('/franchise-applications', [UserFranchiseController::class, 'store']);
    Route::get('/franchise-applications/{userFranchise}', [UserFranchiseController::class, 'show']);
});

// ============== APP ADMIN ROUTES ==============
Route::middleware(['auth:sanctum', \App\Http\Middleware\AdminMiddleware::class])->group(function () {
    
    // 👥 Customer Management API (For Mobile App Admin Panel)
    Route::get('/admin/customers', [CustomerController::class, 'index']);
    Route::get('/admin/customers/{id}', [CustomerController::class, 'show']);
    Route::post('/admin/customers/{id}/toggle-status', [CustomerController::class, 'toggleStatus']);

    // 📦 Products Management API
    Route::get('/admin/products', [AdminProductController::class, 'index']);
    Route::post('/admin/products', [AdminProductController::class, 'store']);
    Route::get('/admin/products/{product}', [AdminProductController::class, 'show']);
    Route::put('/admin/products/{product}', [AdminProductController::class, 'update']);
    Route::delete('/admin/products/{product}', [AdminProductController::class, 'destroy']);
    Route::post('/admin/products/bulk-status', [AdminProductController::class, 'bulkUpdateStatus']);

    // 🏷️ Categories Management API
    Route::get('/admin/categories', [AdminCategoryController::class, 'index']);
    Route::post('/admin/categories', [AdminCategoryController::class, 'store']);
    Route::get('/admin/categories/{category}', [AdminCategoryController::class, 'show']);
    Route::put('/admin/categories/{category}', [AdminCategoryController::class, 'update']);
    Route::delete('/admin/categories/{category}', [AdminCategoryController::class, 'destroy']);

    // 🔖 SKUs Management API
    Route::get('/admin/products/{product}/skus', [AdminSkuController::class, 'index']);
    Route::post('/admin/products/{product}/skus', [AdminSkuController::class, 'store']);
    Route::put('/admin/products/{product}/skus/{sku}', [AdminSkuController::class, 'update']);
    Route::delete('/admin/products/{product}/skus/{sku}', [AdminSkuController::class, 'destroy']);

    // 📊 Inventory Management API
    Route::get('/admin/skus/{sku}/inventory', [AdminInventoryController::class, 'show']);
    Route::put('/admin/skus/{sku}/inventory', [AdminInventoryController::class, 'updateStock']);
    Route::get('/admin/inventory/status', [AdminInventoryController::class, 'status']);
});