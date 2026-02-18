<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ClientOrderController;
use App\Http\Controllers\ClientProfileController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\StripeWebhookController;
use App\Http\Controllers\AdminCustomerController;
use App\Http\Controllers\CurrencyController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post('auth/register', [AuthController::class, 'register']);
Route::post('auth/login', [AuthController::class, 'login']);
Route::post('auth/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');

Route::get('public/departments', [DepartmentController::class, 'publicIndex']);
Route::get('public/departments/{department}', [DepartmentController::class, 'publicShow']);
Route::get('public/categories', [CategoryController::class, 'publicIndex']);
Route::get('public/products', [ProductController::class, 'publicIndex']);
Route::apiResource('departments', DepartmentController::class);
Route::apiResource('categories', CategoryController::class);
Route::apiResource('products', ProductController::class);
Route::patch('products/{product}/stock', [ProductController::class, 'updateStock']);
Route::get('client/orders', [ClientOrderController::class, 'index'])->middleware('auth:sanctum');
Route::get('client/orders/{id}', [ClientOrderController::class, 'show'])->middleware('auth:sanctum');
Route::get('client/profile', [ClientProfileController::class, 'show'])->middleware('auth:sanctum');
Route::post('checkout/session', [CheckoutController::class, 'createSession'])->middleware('auth:sanctum');
Route::post('checkout/confirm', [CheckoutController::class, 'confirmSession']);
Route::post('stripe/webhook', [StripeWebhookController::class, 'handle']);
Route::get('admin/customers/{user}', [AdminCustomerController::class, 'show'])->middleware('auth:sanctum');
Route::get('currencies', [CurrencyController::class, 'index']);
