<?php

namespace App\Http\Controllers\Api\Business;

use App\Http\Controllers\BaseController;
use App\Services\Business\PayrollService;
use App\Models\Payroll;
use App\Models\LeavePolicy;
use App\Models\SalaryAdvance;
use Illuminate\Http\Request;

class PayrollController extends BaseController
{
    public function __construct(private PayrollService $payrollService) {}

    public function index(Request $request)
    {
        try {
            $user = $request->user();
            $filters = $request->all();
            
            // If user is not manager/admin, they can only view their own payroll records
            if (!$user->hasRole(['admin', 'manager', 'Business Admin']) && !$user->hasRole('Superadmin')) {
                $filters['user_id'] = $user->id;
            }

            $payrolls = $this->payrollService->getPayrolls($filters);
            return $this->success($payrolls, 'Payrolls retrieved successfully');
        } catch (\Throwable $e) {
            return $this->error($e->getMessage(), 500);
        }
    }

    public function generate(Request $request)
    {
        $user = $request->user();
        if (!$user->hasRole(['admin', 'manager', 'Business Admin']) && !$user->hasRole('Superadmin')) {
            return $this->forbidden('Unauthorized to generate payroll.');
        }

        $request->validate([
            'month' => 'required|date_format:Y-m',
            'user_id' => 'nullable|integer|exists:users,id',
        ]);

        try {
            if ($request->has('user_id')) {
                $payroll = $this->payrollService->generateForEmployee(
                    $request->input('user_id'),
                    $request->input('month')
                );
                return $this->success($payroll, 'Payroll generated successfully');
            }

            $results = $this->payrollService->generateForAllStaff($request->input('month'));
            return $this->success($results, 'Payrolls generated for all staff');
        } catch (\Throwable $e) {
            return $this->error($e->getMessage(), 422);
        }
    }

    public function show(Request $request, Payroll $payroll)
    {
        try {
            $user = $request->user();
            
            // If not manager/admin, user can only view their own payroll details
            if (!$user->hasRole(['admin', 'manager', 'Business Admin']) && !$user->hasRole('Superadmin')) {
                if ($payroll->user_id !== $user->id) {
                    return $this->forbidden('Unauthorized to view this payroll record.');
                }
            }

            $payroll->load('user');
            return $this->success($payroll, 'Payroll detail retrieved successfully');
        } catch (\Throwable $e) {
            return $this->error($e->getMessage(), 500);
        }
    }

    public function update(Request $request, Payroll $payroll)
    {
        $user = $request->user();
        if (!$user->hasRole(['admin', 'manager', 'Business Admin']) && !$user->hasRole('Superadmin')) {
            return $this->forbidden('Unauthorized to update payroll.');
        }

        $request->validate([
            'bonus' => 'nullable|numeric|min:0',
            'advance_deduction' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        try {
            if ($payroll->status !== 'draft') {
                throw new \Exception('Only draft payrolls can be edited.');
            }

            $bonus = $request->input('bonus', $payroll->bonus);
            $advanceDeduction = $request->input('advance_deduction', $payroll->advance_deduction);
            $finalSalary = $payroll->base_salary - $payroll->deduction + $payroll->total_commission + $bonus - $advanceDeduction;

            $payroll->update([
                'bonus' => $bonus,
                'advance_deduction' => $advanceDeduction,
                'final_salary' => round($finalSalary, 2),
                'notes' => $request->input('notes', $payroll->notes),
            ]);

            return $this->success($payroll->fresh(), 'Payroll updated successfully');
        } catch (\Throwable $e) {
            return $this->error($e->getMessage(), 422);
        }
    }

    public function confirm(Request $request, Payroll $payroll)
    {
        $user = $request->user();
        if (!$user->hasRole(['admin', 'manager', 'Business Admin']) && !$user->hasRole('Superadmin')) {
            return $this->forbidden('Unauthorized to confirm payroll.');
        }

        try {
            $result = $this->payrollService->confirmPayroll($payroll);
            return $this->success($result, 'Payroll confirmed successfully');
        } catch (\Throwable $e) {
            return $this->error($e->getMessage(), 422);
        }
    }

    public function markPaid(Request $request, Payroll $payroll)
    {
        $user = $request->user();
        if (!$user->hasRole(['admin', 'manager', 'Business Admin']) && !$user->hasRole('Superadmin')) {
            return $this->forbidden('Unauthorized to mark payroll as paid.');
        }

        try {
            $result = $this->payrollService->markPaid($payroll, $request->input('paid_date'));
            return $this->success($result, 'Payroll marked as paid');
        } catch (\Throwable $e) {
            return $this->error($e->getMessage(), 422);
        }
    }

    // ── Leave Policies ──

    public function leavePolicies()
    {
        try {
            $policies = LeavePolicy::orderBy('leave_type')->get();
            return $this->success($policies, 'Leave policies retrieved');
        } catch (\Throwable $e) {
            return $this->error($e->getMessage(), 500);
        }
    }

    public function storeLeavePolicy(Request $request)
    {
        $user = $request->user();
        if (!$user->hasRole(['admin', 'manager', 'Business Admin']) && !$user->hasRole('Superadmin')) {
            return $this->forbidden('Unauthorized to create leave policies.');
        }

        $request->validate([
            'leave_type' => 'required|string|max:50',
            'monthly_quota' => 'required|numeric|min:0',
            'is_paid' => 'required|boolean',
        ]);

        try {
            $policy = LeavePolicy::create($request->only(['leave_type', 'monthly_quota', 'is_paid']));
            return $this->success($policy, 'Leave policy created', 201);
        } catch (\Throwable $e) {
            return $this->error($e->getMessage(), 422);
        }
    }

    public function updateLeavePolicy(Request $request, LeavePolicy $leavePolicy)
    {
        $user = $request->user();
        if (!$user->hasRole(['admin', 'manager', 'Business Admin']) && !$user->hasRole('Superadmin')) {
            return $this->forbidden('Unauthorized to update leave policies.');
        }

        $request->validate([
            'leave_type' => 'nullable|string|max:50',
            'monthly_quota' => 'nullable|numeric|min:0',
            'is_paid' => 'nullable|boolean',
        ]);

        try {
            $leavePolicy->update($request->only(['leave_type', 'monthly_quota', 'is_paid']));
            return $this->success($leavePolicy->fresh(), 'Leave policy updated');
        } catch (\Throwable $e) {
            return $this->error($e->getMessage(), 422);
        }
    }

    public function deleteLeavePolicy(Request $request, LeavePolicy $leavePolicy)
    {
        $user = $request->user();
        if (!$user->hasRole(['admin', 'manager', 'Business Admin']) && !$user->hasRole('Superadmin')) {
            return $this->forbidden('Unauthorized to delete leave policies.');
        }

        try {
            $leavePolicy->delete();
            return $this->success(null, 'Leave policy deleted');
        } catch (\Throwable $e) {
            return $this->error($e->getMessage(), 500);
        }
    }

    // ── Salary Advances ──

    public function salaryAdvances(Request $request)
    {
        try {
            $query = SalaryAdvance::with('user')->orderByDesc('given_date');

            $user = $request->user();
            $isManager = $user->hasRole(['admin', 'manager', 'Business Admin', 'Superadmin']);
            
            if (!$isManager) {
                $query->where('user_id', $user->id);
            } else if ($request->has('user_id')) {
                $query->where('user_id', $request->input('user_id'));
            }

            if ($request->has('status')) {
                $query->where('status', $request->input('status'));
            }

            return $this->success($query->get(), 'Salary advances retrieved');
        } catch (\Throwable $e) {
            return $this->error($e->getMessage(), 500);
        }
    }

    public function storeSalaryAdvance(Request $request)
    {
        $user = $request->user();
        $isManager = $user->hasRole(['admin', 'manager', 'Business Admin']) || $user->hasRole('Superadmin');

        $request->validate([
            'user_id' => 'required|integer|exists:users,id',
            'amount' => 'required|numeric|min:1',
            'given_date' => 'required|date',
            'deduct_in_month' => 'nullable|date_format:Y-m',
            'notes' => 'nullable|string',
        ]);

        // If not manager, user can only request salary advance for themselves
        if (!$isManager && (int) $request->input('user_id') !== $user->id) {
            return $this->forbidden('Unauthorized to request salary advance for another user.');
        }

        try {
            $data = $request->only([
                'user_id', 'amount', 'given_date', 'deduct_in_month', 'notes'
            ]);
            $data['status'] = 'pending';
            $data['business_id'] = app('current_business_id'); // explicit safety

            if (empty($data['deduct_in_month']) && !empty($data['given_date'])) {
                $data['deduct_in_month'] = date('Y-m', strtotime($data['given_date']));
            }

            $advance = SalaryAdvance::create($data);
            return $this->success($advance, 'Salary advance recorded', 201);
        } catch (\Throwable $e) {
            return $this->error($e->getMessage(), 422);
        }
    }

    public function updateSalaryAdvanceStatus(Request $request, SalaryAdvance $salaryAdvance)
    {
        $user = $request->user();
        if (!$user->hasRole(['admin', 'manager', 'Business Admin']) && !$user->hasRole('Superadmin')) {
            return $this->forbidden('Unauthorized to update salary advance status.');
        }

        $request->validate([
            'status' => 'required|in:approved,rejected'
        ]);

        try {
            $salaryAdvance->update([
                'status' => $request->status,
            ]);
            return $this->success($salaryAdvance->fresh(), 'Salary advance status updated');
        } catch (\Throwable $e) {
            return $this->error($e->getMessage(), 422);
        }
    }
}
