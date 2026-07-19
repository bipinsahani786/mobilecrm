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
    
    // Public Signed Route for QR Invoice Verification
    Route::get('/verify/invoice/{sale}', [\App\Http\Controllers\Api\SaleController::class, 'generatePdf'])
        ->name('invoice.verify')
        ->middleware('signed');

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/user', function (Request $request) {
            return $request->user();
        });
        
        Route::post('/upload/presigned-url', [\App\Http\Controllers\Api\UploadController::class, 'getPresignedUrl']);
        
        Route::apiResource('businesses', \App\Http\Controllers\Api\BusinessController::class);

        // CRM Routes (Scoped to Business via TenantMiddleware)
        Route::middleware(['tenant'])->prefix('business')->group(function () {
            Route::get('/dashboard/stats', [\App\Http\Controllers\Api\Business\DashboardController::class, 'stats']);
            Route::get('/dashboard/staff-earnings', [\App\Http\Controllers\Api\Business\DashboardController::class, 'staffEarnings']);

            Route::apiResource('categories', \App\Http\Controllers\Api\Business\CategoryController::class);
            Route::apiResource('brands', \App\Http\Controllers\Api\Business\BrandController::class);
            
            Route::post('inventory/direct-inward', [\App\Http\Controllers\Api\Business\InventoryController::class, 'directInward']);
            Route::apiResource('inventory', \App\Http\Controllers\Api\Business\InventoryController::class);
            
            // Supplier Routes
            Route::apiResource('suppliers', \App\Http\Controllers\Api\SupplierController::class);
            Route::post('suppliers/{supplier}/purchases', [\App\Http\Controllers\Api\SupplierController::class, 'storePurchase']);
            Route::post('suppliers/{supplier}/payments', [\App\Http\Controllers\Api\SupplierController::class, 'storePayment']);
            
            // Customer Routes
            Route::apiResource('customers', \App\Http\Controllers\Api\CustomerController::class);
            
            // Sales Routes
            Route::get('sales/{sale}/invoice-pdf', [\App\Http\Controllers\Api\SaleController::class, 'generatePdf']);
            Route::apiResource('sales', \App\Http\Controllers\Api\SaleController::class);
            
            // Expense Routes
            Route::get('expenses/analytics', [\App\Http\Controllers\Api\Business\ExpenseController::class, 'analytics']);
            Route::get('expenses/categories', [\App\Http\Controllers\Api\Business\ExpenseController::class, 'categories']);
            Route::apiResource('expenses', \App\Http\Controllers\Api\Business\ExpenseController::class);
            
            // EMI & Installments Routes
            Route::middleware(['feature:has_finance'])->group(function () {
                Route::get('emis/customer/{customerId}', [\App\Http\Controllers\Api\Business\EmiController::class, 'getCustomerEmis']);
                Route::post('emis/installments/{installmentId}/pay', [\App\Http\Controllers\Api\Business\EmiController::class, 'payInstallment']);
                Route::post('emis/{emiDetailId}/payout', [\App\Http\Controllers\Api\Business\EmiController::class, 'markPayoutReceived']);
                
                // Finance Ledger Routes
                Route::get('finance/pending', [\App\Http\Controllers\Api\FinanceController::class, 'pending']);
                Route::get('finance/completed', [\App\Http\Controllers\Api\FinanceController::class, 'completed']);
                Route::post('finance/{id}/mark-received', [\App\Http\Controllers\Api\FinanceController::class, 'markReceived']);
            });

            // Staff Management Routes
            Route::get('staff/performance', [\App\Http\Controllers\Api\Business\StaffPerformanceController::class, 'index']);
            Route::get('staff/{id}/sales', [\App\Http\Controllers\Api\Business\StaffController::class, 'salesReport']);
            Route::get('staff/{id}/permissions', [\App\Http\Controllers\Api\Business\StaffController::class, 'getPermissions']);
            Route::put('staff/{id}/permissions', [\App\Http\Controllers\Api\Business\StaffController::class, 'updatePermissions']);
            Route::get('staff/{id}/earnings', [\App\Http\Controllers\Api\Business\StaffController::class, 'earnings']);
            Route::post('staff/{id}/impersonate', [\App\Http\Controllers\Api\Business\StaffController::class, 'impersonate']);
            Route::apiResource('staff', \App\Http\Controllers\Api\Business\StaffController::class);

            // Business Locations (Geo-fence)
            Route::apiResource('locations', \App\Http\Controllers\Api\Business\LocationController::class);

            // HR & Payroll Module Routes
            Route::middleware(['feature:has_payroll'])->group(function () {
                // Attendance Routes
                Route::post('attendance/import', [\App\Http\Controllers\Api\Business\AttendanceController::class, 'import']);
                Route::get('attendance/today', [\App\Http\Controllers\Api\Business\AttendanceController::class, 'todayStatus']);
                Route::post('attendance/check-in', [\App\Http\Controllers\Api\Business\AttendanceController::class, 'checkIn']);
                Route::post('attendance/check-out', [\App\Http\Controllers\Api\Business\AttendanceController::class, 'checkOut']);
                Route::post('attendance/mark', [\App\Http\Controllers\Api\Business\AttendanceController::class, 'markManual']);
                Route::get('attendance/report', [\App\Http\Controllers\Api\Business\AttendanceController::class, 'monthlyReport']);
                Route::put('attendance/{id}/approve', [\App\Http\Controllers\Api\Business\AttendanceController::class, 'approve']);
                Route::put('attendance/{id}/unapprove', [\App\Http\Controllers\Api\Business\AttendanceController::class, 'unapprove']);
                Route::apiResource('attendance', \App\Http\Controllers\Api\Business\AttendanceController::class)->only(['index']);

                // Payroll Routes
                Route::post('payroll/generate', [\App\Http\Controllers\Api\Business\PayrollController::class, 'generate']);
                Route::post('payroll/{payroll}/confirm', [\App\Http\Controllers\Api\Business\PayrollController::class, 'confirm']);
                Route::post('payroll/{payroll}/mark-paid', [\App\Http\Controllers\Api\Business\PayrollController::class, 'markPaid']);
                Route::get('payroll', [\App\Http\Controllers\Api\Business\PayrollController::class, 'index']);
                Route::get('payroll/{payroll}', [\App\Http\Controllers\Api\Business\PayrollController::class, 'show']);
                Route::put('payroll/{payroll}', [\App\Http\Controllers\Api\Business\PayrollController::class, 'update']);
                Route::apiResource('payroll-components', \App\Http\Controllers\Api\Business\PayrollComponentController::class);

                // Leave Policies
                Route::get('leave-policies', [\App\Http\Controllers\Api\Business\PayrollController::class, 'leavePolicies']);
                Route::post('leave-policies', [\App\Http\Controllers\Api\Business\PayrollController::class, 'storeLeavePolicy']);
                Route::put('leave-policies/{leavePolicy}', [\App\Http\Controllers\Api\Business\PayrollController::class, 'updateLeavePolicy']);
                Route::delete('leave-policies/{leavePolicy}', [\App\Http\Controllers\Api\Business\PayrollController::class, 'deleteLeavePolicy']);

                // Salary Advances
                Route::get('salary-advances', [\App\Http\Controllers\Api\Business\PayrollController::class, 'salaryAdvances']);
                Route::post('salary-advances', [\App\Http\Controllers\Api\Business\PayrollController::class, 'storeSalaryAdvance']);
                Route::patch('salary-advances/{salaryAdvance}/status', [\App\Http\Controllers\Api\Business\PayrollController::class, 'updateSalaryAdvanceStatus']);
                
                // Leave Requests
                Route::apiResource('leave-requests', \App\Http\Controllers\Api\Business\LeaveRequestController::class);
                Route::patch('leave-requests/{leave_request}/status', [\App\Http\Controllers\Api\Business\LeaveRequestController::class, 'updateStatus']);
            });

            // System Audit Logs
            Route::middleware(['feature:has_activity_logs'])->group(function () {
                Route::get('activity-logs', [\App\Http\Controllers\Api\Business\ActivityLogController::class, 'index']);
            });
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
            Route::post('/users', [\App\Http\Controllers\Api\Superadmin\UserController::class, 'store']);
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
