<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\Partner\PartnerPortalController;
use App\Http\Controllers\PingController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::get('/ping', [PingController::class, 'ping']);
    Route::post('/check-user', [AuthController::class, 'checkUser']);
    Route::post('/send-otp', [AuthController::class, 'sendOtp']);
    Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);
    Route::post('/set-password', [AuthController::class, 'setPassword']);
    Route::post('/login', [AuthController::class, 'login']);

    // Partner self-registration (public)
    Route::post('/partner/register', [PartnerPortalController::class, 'register']);

    Route::get('/settings/public', [\App\Http\Controllers\Api\PublicSettingController::class, 'index']);
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/user', function (Request $request) {
            return $request->user();
        });
        
        Route::post('/upload/presigned-url', [\App\Http\Controllers\Api\UploadController::class, 'getPresignedUrl']);
        
        Route::apiResource('businesses', \App\Http\Controllers\Api\BusinessController::class);

        // CRM Routes (Scoped to Business via TenantMiddleware)
        Route::middleware(['tenant'])->prefix('business')->group(function () {
            Route::apiResource('categories', \App\Http\Controllers\Api\Business\CategoryController::class);
            Route::get('inventory/brands', [\App\Http\Controllers\Api\Business\InventoryController::class, 'brands']);
            Route::apiResource('inventory', \App\Http\Controllers\Api\Business\InventoryController::class);
        });

        // Profile (any authenticated user)
        Route::get('/profile', [\App\Http\Controllers\Api\ProfileController::class, 'show']);
        Route::patch('/profile', [\App\Http\Controllers\Api\ProfileController::class, 'update']);
        Route::post('/profile/avatar', [\App\Http\Controllers\Api\ProfileController::class, 'uploadAvatar']);
        Route::delete('/profile/avatar', [\App\Http\Controllers\Api\ProfileController::class, 'removeAvatar']);
        Route::post('/profile/password', [\App\Http\Controllers\Api\ProfileController::class, 'changePassword']);
        
        // Superadmin Routes
        Route::middleware(['superadmin'])->prefix('superadmin')->group(function () {
            // Dashboard
            Route::get('/dashboard/stats', [\App\Http\Controllers\Api\Superadmin\SuperadminDashboardController::class, 'stats']);

            // Settings
            Route::put('/settings', [\App\Http\Controllers\Api\Superadmin\SettingController::class, 'update']);
            Route::post('/settings/logo', [\App\Http\Controllers\Api\Superadmin\SettingController::class, 'uploadLogo']);

            // Plans
            Route::apiResource('plans', \App\Http\Controllers\Api\Superadmin\PlanController::class);

            // Tenants
            Route::get('/businesses', [\App\Http\Controllers\Api\Superadmin\TenantController::class, 'index']);
            Route::patch('/businesses/{id}', [\App\Http\Controllers\Api\Superadmin\TenantController::class, 'update']);
            Route::patch('/businesses/{id}/status', [\App\Http\Controllers\Api\Superadmin\TenantController::class, 'updateStatus']);
            Route::patch('/businesses/{id}/password', [\App\Http\Controllers\Api\Superadmin\TenantController::class, 'resetPassword']);
            Route::post('/businesses/onboard', [\App\Http\Controllers\Api\Superadmin\TenantController::class, 'onboard']);

            // Partners
            Route::get('/partners/{id}/analytics', [\App\Http\Controllers\Api\Superadmin\PartnerController::class, 'analytics']);
            Route::apiResource('partners', \App\Http\Controllers\Api\Superadmin\PartnerController::class);
            Route::apiResource('partner-resources', \App\Http\Controllers\Api\Superadmin\PartnerResourceController::class);

            // Commissions
            Route::get('/commissions', [\App\Http\Controllers\Api\Superadmin\CommissionController::class, 'index']);
            Route::get('/commissions/{id}', [\App\Http\Controllers\Api\Superadmin\CommissionController::class, 'show']);
            Route::patch('/commissions/{id}/mark-paid', [\App\Http\Controllers\Api\Superadmin\CommissionController::class, 'markAsPaid']);

            // Leads
            Route::get('/leads/stats', [\App\Http\Controllers\Api\Superadmin\LeadController::class, 'stats']);
            Route::post('/leads/import', [\App\Http\Controllers\Api\Superadmin\LeadController::class, 'import']);
            Route::post('/leads/bulk-message', [\App\Http\Controllers\Api\Superadmin\BulkMessageController::class, 'send']);
            Route::apiResource('leads', \App\Http\Controllers\Api\Superadmin\LeadController::class);
            Route::get('/leads/{id}/contacts', [\App\Http\Controllers\Api\Superadmin\LeadController::class, 'contacts']);
            Route::post('/leads/{id}/contacts', [\App\Http\Controllers\Api\Superadmin\LeadController::class, 'logContact']);
            Route::delete('/leads/{leadId}/contacts/{contactId}', [\App\Http\Controllers\Api\Superadmin\LeadController::class, 'deleteContact']);

            // Templates & Logs (Marketing)
            Route::apiResource('templates', \App\Http\Controllers\Api\Superadmin\TemplateController::class);
            Route::get('/message-logs', [\App\Http\Controllers\Api\Superadmin\MessageLogController::class, 'index']);

            // Users
            Route::get('/users/roles', [\App\Http\Controllers\Api\Superadmin\UserController::class, 'roles']);
            Route::get('/users/stats', [\App\Http\Controllers\Api\Superadmin\UserController::class, 'stats']);
            Route::get('/users', [\App\Http\Controllers\Api\Superadmin\UserController::class, 'index']);
            Route::get('/users/{id}', [\App\Http\Controllers\Api\Superadmin\UserController::class, 'show']);
            Route::patch('/users/{id}', [\App\Http\Controllers\Api\Superadmin\UserController::class, 'update']);
            Route::patch('/users/{id}/status', [\App\Http\Controllers\Api\Superadmin\UserController::class, 'updateStatus']);
            Route::delete('/users/{id}', [\App\Http\Controllers\Api\Superadmin\UserController::class, 'destroy']);

            // Roles & Permissions
            Route::apiResource('roles', \App\Http\Controllers\Api\Superadmin\RoleController::class);

            // System Logs & Optimization
            Route::get('/system/logs', [\App\Http\Controllers\Api\Superadmin\SystemController::class, 'getLogs']);
            Route::delete('/system/logs', [\App\Http\Controllers\Api\Superadmin\SystemController::class, 'clearLogs']);
            Route::post('/system/cache/clear', [\App\Http\Controllers\Api\Superadmin\SystemController::class, 'clearCache']);
            Route::post('/system/cache/optimize', [\App\Http\Controllers\Api\Superadmin\SystemController::class, 'optimizeApp']);

            // Payouts Management
            Route::get('/payouts/stats', [\App\Http\Controllers\Api\Superadmin\PayoutController::class, 'stats']);
            Route::get('/payouts', [\App\Http\Controllers\Api\Superadmin\PayoutController::class, 'index']);
            Route::get('/payouts/{id}', [\App\Http\Controllers\Api\Superadmin\PayoutController::class, 'show']);
            Route::patch('/payouts/{id}/approve', [\App\Http\Controllers\Api\Superadmin\PayoutController::class, 'approve']);
            Route::patch('/payouts/{id}/reject', [\App\Http\Controllers\Api\Superadmin\PayoutController::class, 'reject']);
            Route::patch('/payouts/{id}/paid', [\App\Http\Controllers\Api\Superadmin\PayoutController::class, 'markPaid']);
        });

        // ── Partner Portal Routes ──
        Route::middleware(['partner'])->prefix('partner')->group(function () {
            Route::get('/dashboard', [PartnerPortalController::class, 'dashboard']);
            Route::get('/referrals', [PartnerPortalController::class, 'referrals']);
            Route::get('/referrals/{id}', [PartnerPortalController::class, 'referralDetail']);
            Route::get('/referral-link', [PartnerPortalController::class, 'referralLink']);
            Route::get('/commissions', [PartnerPortalController::class, 'commissions']);
            Route::get('/commissions/stats', [PartnerPortalController::class, 'commissionStats']);
            Route::get('/payouts', [PartnerPortalController::class, 'payouts']);
            Route::post('/payouts', [PartnerPortalController::class, 'createPayout']);
            Route::get('/profile', [PartnerPortalController::class, 'profile']);
            Route::patch('/profile', [PartnerPortalController::class, 'updateProfile']);
            Route::patch('/payout-details', [PartnerPortalController::class, 'updatePayoutDetails']);
            Route::post('/change-password', [PartnerPortalController::class, 'changePassword']);

            // Resources (Marketing Assets)
            Route::get('/resources', [\App\Http\Controllers\Api\Partner\ResourceController::class, 'index']);
            Route::get('/resources/{id}/download', [\App\Http\Controllers\Api\Partner\ResourceController::class, 'download']);

            // Direct Client Onboarding
            Route::get('/plans', [PartnerPortalController::class, 'plans']);
            Route::post('/clients/onboard', [PartnerPortalController::class, 'onboardClient']);
        });
    });
});
