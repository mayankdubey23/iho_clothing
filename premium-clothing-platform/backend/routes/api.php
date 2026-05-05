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

// ============== PUBLIC ROUTES ==============

// Authentication Routes
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

// Customer Routes
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{product:slug}', [ProductController::class, 'show']);
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/franchise-plans', [FranchisePlanController::class, 'index']);
Route::get('/franchise-plans/{franchisePlan}', [FranchisePlanController::class, 'show']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);

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
