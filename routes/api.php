<?php

use App\Http\Controllers\AdminBannerController;
use App\Http\Controllers\AdminCustomerController;
use App\Http\Controllers\AdminDeliveryController;
use App\Http\Controllers\AdminGiftCardController;
use App\Http\Controllers\AdminLoyaltyController;
use App\Http\Controllers\AdminOrderController;
use App\Http\Controllers\AdminRefundController;
use App\Http\Controllers\AdminRoleController;
use App\Http\Controllers\AdminSettingsController;
use App\Http\Controllers\AdminUserController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BannerController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\ClientOrderController;
use App\Http\Controllers\ClientProfileController;
use App\Http\Controllers\ClientRefundController;
use App\Http\Controllers\CurrencyController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\StripeWebhookController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('public/banners', [BannerController::class, 'index']);

Route::get('/user', function (Request $request) {
    $user = $request->user()->load(['roleDefinition.permissions']);

    $permissions = [];
    if ($user->roleDefinition) {
        $permissions = $user->roleDefinition->permissions->pluck('name')->toArray();
    } elseif ($user->role === 'admin' || $user->role === 'super_admin') {
        // Legacy admin support - give all permissions if not using new role system
        $permissions = ['*'];
    }

    return [
        'id' => $user->id,
        'name' => $user->name,
        'email' => $user->email,
        'role' => $user->role,
        'role_id' => $user->role_id,
        'role_name' => $user->roleDefinition ? $user->roleDefinition->name : null,
        'permissions' => $permissions,
        'points_balance' => $user->points_balance,
        'birthday' => $user->birthday,
    ];
})->middleware('auth:sanctum');

Route::post('auth/register', [AuthController::class, 'register']);
Route::post('auth/login', [AuthController::class, 'login']);
Route::post('auth/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
Route::post('auth/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('auth/reset-password', [AuthController::class, 'resetPassword'])->name('password.reset');
Route::post('email/resend', [AuthController::class, 'resendVerificationEmail'])->middleware('auth:sanctum');
Route::get('email/verify/{id}/{hash}', [AuthController::class, 'verify'])->name('verification.verify');

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
Route::post('checkout/confirm', [CheckoutController::class, 'confirmSession'])->middleware('auth:sanctum');
Route::post('stripe/webhook', [StripeWebhookController::class, 'handle'])->middleware('throttle:60,1');
Route::get('admin/customers', [AdminCustomerController::class, 'index'])->middleware(['auth:sanctum', 'permission:view_customers']);
Route::get('admin/customers/{user}', [AdminCustomerController::class, 'show'])->middleware(['auth:sanctum', 'permission:view_customers']);
Route::get('admin/orders', [AdminOrderController::class, 'index'])->middleware(['auth:sanctum', 'permission:view_orders']);
Route::put('admin/orders/{order}', [AdminOrderController::class, 'update'])->middleware(['auth:sanctum', 'permission:manage_orders']);
Route::get('admin/analytics', [App\Http\Controllers\AdminAnalyticsController::class, 'index'])->middleware(['auth:sanctum', 'permission:view_dashboard']);
Route::get('admin/delivery/settings', [AdminDeliveryController::class, 'getSettings'])->middleware(['auth:sanctum', 'permission:manage_settings']);
Route::post('admin/delivery/settings', [AdminDeliveryController::class, 'updateSettings'])->middleware(['auth:sanctum', 'permission:manage_settings']);
Route::get('admin/delivery/orders', [AdminDeliveryController::class, 'getDeliveries'])->middleware(['auth:sanctum', 'permission:manage_orders']);
Route::post('admin/delivery/orders/{order}/status', [AdminDeliveryController::class, 'updateDeliveryStatus'])->middleware(['auth:sanctum', 'permission:manage_orders']);
Route::get('delivery/settings', [AdminDeliveryController::class, 'getSettings']); // Public endpoint for checkout
Route::get('admin/sales/stats', [App\Http\Controllers\AdminSalesController::class, 'getStats'])->middleware(['auth:sanctum', 'permission:view_orders']);
Route::get('admin/sales/chart', [App\Http\Controllers\AdminSalesController::class, 'getChartData'])->middleware(['auth:sanctum', 'permission:view_orders']);
Route::get('admin/sales/recent', [App\Http\Controllers\AdminSalesController::class, 'getRecentSales'])->middleware(['auth:sanctum', 'permission:view_orders']);
Route::get('admin/sales/top-products', [App\Http\Controllers\AdminSalesController::class, 'getTopProducts'])->middleware(['auth:sanctum', 'permission:view_orders']);
Route::get('currencies', [CurrencyController::class, 'index']);
Route::post('admin/loyalty/adjust/{user}', [AdminLoyaltyController::class, 'adjust'])->middleware(['auth:sanctum', 'permission:manage_loyalty']);
Route::get('admin/loyalty/transactions', [AdminLoyaltyController::class, 'index'])->middleware(['auth:sanctum', 'permission:manage_loyalty']);
Route::get('admin/loyalty/stats', [AdminLoyaltyController::class, 'stats'])->middleware(['auth:sanctum', 'permission:manage_loyalty']);
Route::get('admin/loyalty/settings', [AdminLoyaltyController::class, 'getSettings'])->middleware(['auth:sanctum', 'permission:manage_loyalty']);
Route::post('admin/loyalty/settings', [AdminLoyaltyController::class, 'updateSettings'])->middleware(['auth:sanctum', 'permission:manage_loyalty']);
Route::get('loyalty/settings', [AdminLoyaltyController::class, 'getSettings']);
Route::get('general/settings', [AdminSettingsController::class, 'getSettings']);
Route::post('admin/general/settings', [AdminSettingsController::class, 'updateSettings'])->middleware(['auth:sanctum', 'permission:manage_settings']);

Route::prefix('admin')->middleware('auth:sanctum')->group(function () {
    // Banners
    Route::apiResource('/banners', AdminBannerController::class)->middleware('permission:manage_settings');
    Route::post('/banners/order', [AdminBannerController::class, 'updateOrder'])->middleware('permission:manage_settings');

    // Roles & Permissions
    Route::get('/roles', [AdminRoleController::class, 'index'])->middleware('permission:manage_roles');
    Route::post('/roles', [AdminRoleController::class, 'store'])->middleware('permission:manage_roles');
    Route::put('/roles/{role}', [AdminRoleController::class, 'update'])->middleware('permission:manage_roles');
    Route::delete('/roles/{role}', [AdminRoleController::class, 'destroy'])->middleware('permission:manage_roles');

    // Promotions
    Route::get('/promotions', [App\Http\Controllers\AdminPromotionController::class, 'index'])->middleware('permission:manage_promotions');
    Route::post('/promotions', [App\Http\Controllers\AdminPromotionController::class, 'store'])->middleware('permission:manage_promotions');
    Route::get('/promotions/{promotion}', [App\Http\Controllers\AdminPromotionController::class, 'show'])->middleware('permission:manage_promotions');
    Route::put('/promotions/{promotion}', [App\Http\Controllers\AdminPromotionController::class, 'update'])->middleware('permission:manage_promotions');
    Route::delete('/promotions/{promotion}', [App\Http\Controllers\AdminPromotionController::class, 'destroy'])->middleware('permission:manage_promotions');

    // Permissions (Legacy/Helper)
    Route::get('/permissions', [AdminRoleController::class, 'permissions'])->middleware('permission:manage_roles');

    // User Management
    Route::get('/users', [AdminUserController::class, 'index'])->middleware('permission:view_users');
    Route::post('/users', [AdminUserController::class, 'store'])->middleware('permission:manage_users');
    Route::put('/users/{user}', [AdminUserController::class, 'update'])->middleware('permission:manage_users');
    Route::delete('/users/{user}', [AdminUserController::class, 'destroy'])->middleware('permission:manage_users');
});

// Public Promotions
Route::get('public/promotions', [App\Http\Controllers\AdminPromotionController::class, 'publicIndex']);

Route::get('gift-cards/products', [App\Http\Controllers\GiftCardController::class, 'products']);
Route::post('gift-cards/validate', [App\Http\Controllers\GiftCardController::class, 'validateCard'])->middleware('throttle:10,1');
Route::get('client/gift-cards/{id}/transactions', [App\Http\Controllers\GiftCardController::class, 'transactions'])->middleware('auth:sanctum');

Route::prefix('admin/gift-cards')->middleware(['auth:sanctum', 'permission:manage_gift_cards'])->group(function () {
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

Route::get('admin/orders/{order}/refund-eligibility', [AdminRefundController::class, 'checkEligibility'])->middleware(['auth:sanctum', 'permission:manage_refunds']);

Route::put('admin/departments/{department}/refund-rules', [DepartmentController::class, 'updateRefundRules'])->middleware(['auth:sanctum', 'permission:manage_categories']);

Route::prefix('admin/refunds')->middleware(['auth:sanctum', 'permission:manage_refunds'])->group(function () {
    Route::get('/stats', [AdminRefundController::class, 'stats']);
    Route::get('/export', [AdminRefundController::class, 'export']);
    Route::get('/', [AdminRefundController::class, 'index']);
    Route::get('/{refund}', [AdminRefundController::class, 'show']);

    // Rate limit creation and approval
    Route::middleware('throttle:10,1')->group(function () {
        Route::post('/', [AdminRefundController::class, 'store']);
        Route::post('/{refund}/approve', [AdminRefundController::class, 'approve']);
    });
});

Route::prefix('client')->middleware('auth:sanctum')->group(function () {
    Route::get('orders/{order}/refund-eligibility', [ClientRefundController::class, 'checkEligibility']);
    Route::post('refunds', [ClientRefundController::class, 'store'])->middleware('throttle:5,1');
});
