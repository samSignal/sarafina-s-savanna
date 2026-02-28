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
use App\Http\Controllers\AdminOrderController;
use App\Http\Controllers\AdminDeliveryController;
use App\Http\Controllers\CurrencyController;
use App\Http\Controllers\AdminLoyaltyController;
use App\Http\Controllers\AdminGiftCardController;
use App\Http\Controllers\AdminSettingsController;

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
Route::put('client/profile', [ClientProfileController::class, 'update'])->middleware('auth:sanctum');
Route::post('checkout/session', [CheckoutController::class, 'createSession'])->middleware('auth:sanctum');
Route::post('checkout/confirm', [CheckoutController::class, 'confirmSession']);
Route::post('stripe/webhook', [StripeWebhookController::class, 'handle']);
Route::get('admin/customers', [AdminCustomerController::class, 'index'])->middleware('auth:sanctum');
Route::get('admin/customers/{user}', [AdminCustomerController::class, 'show'])->middleware('auth:sanctum');
Route::get('admin/orders', [AdminOrderController::class, 'index']);
Route::put('admin/orders/{order}', [AdminOrderController::class, 'update']);
Route::get('admin/analytics', [App\Http\Controllers\AdminAnalyticsController::class, 'index']);
Route::get('admin/delivery/settings', [AdminDeliveryController::class, 'getSettings']);
Route::post('admin/delivery/settings', [AdminDeliveryController::class, 'updateSettings']);
Route::get('admin/delivery/orders', [AdminDeliveryController::class, 'getDeliveries']);
Route::post('admin/delivery/orders/{order}/status', [AdminDeliveryController::class, 'updateDeliveryStatus']);
Route::get('delivery/settings', [AdminDeliveryController::class, 'getSettings']); // Public endpoint for checkout
Route::get('admin/sales/stats', [App\Http\Controllers\AdminSalesController::class, 'getStats']);
Route::get('admin/sales/chart', [App\Http\Controllers\AdminSalesController::class, 'getChartData']);
Route::get('admin/sales/recent', [App\Http\Controllers\AdminSalesController::class, 'getRecentSales']);
Route::get('admin/sales/top-products', [App\Http\Controllers\AdminSalesController::class, 'getTopProducts']);
Route::get('currencies', [CurrencyController::class, 'index']);
Route::post('admin/loyalty/adjust/{user}', [AdminLoyaltyController::class, 'adjust'])->middleware('auth:sanctum');
Route::get('admin/loyalty/transactions', [AdminLoyaltyController::class, 'index'])->middleware('auth:sanctum');
Route::get('admin/loyalty/stats', [AdminLoyaltyController::class, 'stats'])->middleware('auth:sanctum');
Route::get('admin/loyalty/settings', [AdminLoyaltyController::class, 'getSettings'])->middleware('auth:sanctum');
Route::post('admin/loyalty/settings', [AdminLoyaltyController::class, 'updateSettings'])->middleware('auth:sanctum');
Route::get('loyalty/settings', [AdminLoyaltyController::class, 'getSettings']);
Route::get('general/settings', [AdminSettingsController::class, 'getSettings']);
Route::post('admin/general/settings', [AdminSettingsController::class, 'updateSettings'])->middleware('auth:sanctum');
Route::get('gift-cards/products', [App\Http\Controllers\GiftCardController::class, 'products']);
Route::post('gift-cards/validate', [App\Http\Controllers\GiftCardController::class, 'validateCard'])->middleware('throttle:10,1');
Route::get('client/gift-cards/{id}/transactions', [App\Http\Controllers\GiftCardController::class, 'transactions'])->middleware('auth:sanctum');

Route::prefix('admin/gift-cards')->middleware('auth:sanctum')->group(function () {
    Route::get('/export', [AdminGiftCardController::class, 'export']); // Place before {id} routes
    Route::get('/products', [AdminGiftCardController::class, 'products']);
    Route::post('/products', [AdminGiftCardController::class, 'storeProduct']);
    Route::delete('/products/{id}', [AdminGiftCardController::class, 'destroyProduct']);
    Route::get('/', [AdminGiftCardController::class, 'index']);
    Route::post('/', [AdminGiftCardController::class, 'store']);
    Route::put('/{id}', [AdminGiftCardController::class, 'update']);
    Route::delete('/{id}', [AdminGiftCardController::class, 'destroy']);
    Route::get('/{id}/transactions', [AdminGiftCardController::class, 'transactions']);
    Route::get('/{id}/audit-logs', [AdminGiftCardController::class, 'auditLogs']);
});
