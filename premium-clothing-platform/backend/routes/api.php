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
use App\Models\Product;
use App\Models\StorefrontSetting;
use Illuminate\Support\Facades\Schema;

// ============== PUBLIC ROUTES ==============

// Authentication Routes
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:5,1');
Route::post('/auth/verify-otp', [AuthController::class, 'verifyOtp'])->middleware('throttle:5,1');
Route::post('/auth/reset-password', [AuthController::class, 'resetPassword'])->middleware('throttle:5,1');
Route::post('/auth/mobile-otp', [AuthController::class, 'requestMobileOtp'])->middleware('throttle:5,1');
Route::post('/auth/mobile-login', [AuthController::class, 'verifyMobileLogin'])->middleware('throttle:5,1');

// Customer Routes
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/products', [ProductController::class, 'index']);
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
Route::get('/products/{product:slug}', [ProductController::class, 'show']);
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/franchise-plans', [FranchisePlanController::class, 'index']);
Route::get('/franchise-plans/{franchisePlan}', [FranchisePlanController::class, 'show']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::get('/auth/login-activity', [AuthController::class, 'loginActivity']);

    Route::get('/franchise-applications', [UserFranchiseController::class, 'index']);
    Route::post('/franchise-applications', [UserFranchiseController::class, 'store']);
    Route::get('/franchise-applications/{userFranchise}', [UserFranchiseController::class, 'show']);
});

// ============== ADMIN ROUTES ==============

Route::middleware('auth:sanctum', \App\Http\Middleware\AdminMiddleware::class)->group(function () {
    // Products Management
    Route::get('/admin/products', [AdminProductController::class, 'index']);
    Route::post('/admin/products', [AdminProductController::class, 'store']);
    Route::get('/admin/products/{product}', [AdminProductController::class, 'show']);
    Route::put('/admin/products/{product}', [AdminProductController::class, 'update']);
    Route::delete('/admin/products/{product}', [AdminProductController::class, 'destroy']);
    Route::post('/admin/products/bulk-status', [AdminProductController::class, 'bulkUpdateStatus']);

    // Categories Management
    Route::get('/admin/categories', [AdminCategoryController::class, 'index']);
    Route::post('/admin/categories', [AdminCategoryController::class, 'store']);
    Route::get('/admin/categories/{category}', [AdminCategoryController::class, 'show']);
    Route::put('/admin/categories/{category}', [AdminCategoryController::class, 'update']);
    Route::delete('/admin/categories/{category}', [AdminCategoryController::class, 'destroy']);

    // SKUs Management
    Route::get('/admin/products/{product}/skus', [AdminSkuController::class, 'index']);
    Route::post('/admin/products/{product}/skus', [AdminSkuController::class, 'store']);
    Route::put('/admin/products/{product}/skus/{sku}', [AdminSkuController::class, 'update']);
    Route::delete('/admin/products/{product}/skus/{sku}', [AdminSkuController::class, 'destroy']);

    // Inventory Management
    Route::get('/admin/skus/{sku}/inventory', [AdminInventoryController::class, 'show']);
    Route::put('/admin/skus/{sku}/inventory', [AdminInventoryController::class, 'updateStock']);
    Route::get('/admin/inventory/status', [AdminInventoryController::class, 'status']);
});
