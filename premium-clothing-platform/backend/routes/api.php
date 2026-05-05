<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\FranchisePlanController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\UserFranchiseController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{product:slug}', [ProductController::class, 'show']);
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/franchise-plans', [FranchisePlanController::class, 'index']);
Route::get('/franchise-plans/{franchisePlan}', [FranchisePlanController::class, 'show']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/franchise-applications', [UserFranchiseController::class, 'index']);
    Route::post('/franchise-applications', [UserFranchiseController::class, 'store']);
    Route::get('/franchise-applications/{userFranchise}', [UserFranchiseController::class, 'show']);
});
