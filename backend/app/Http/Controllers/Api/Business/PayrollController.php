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
            $payrolls = $this->payrollService->getPayrolls($request->all());
            return $this->success($payrolls, 'Payrolls retrieved successfully');
        } catch (\Throwable $e) {
            return $this->error($e->getMessage(), 500);
        }
    }

    public function generate(Request $request)
    {
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

    public function show(Payroll $payroll)
    {
        try {
            $payroll->load('user');
            return $this->success($payroll, 'Payroll detail retrieved successfully');
        } catch (\Throwable $e) {
            return $this->error($e->getMessage(), 500);
        }
    }

    public function update(Request $request, Payroll $payroll)
    {
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

    public function confirm(Payroll $payroll)
    {
        try {
            $result = $this->payrollService->confirmPayroll($payroll);
            return $this->success($result, 'Payroll confirmed successfully');
        } catch (\Throwable $e) {
            return $this->error($e->getMessage(), 422);
        }
    }

    public function markPaid(Request $request, Payroll $payroll)
    {
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

    public function deleteLeavePolicy(LeavePolicy $leavePolicy)
    {
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

            if ($request->has('user_id')) {
                $query->where('user_id', $request->input('user_id'));
            }

            return $this->success($query->paginate(15), 'Salary advances retrieved');
        } catch (\Throwable $e) {
            return $this->error($e->getMessage(), 500);
        }
    }

    public function storeSalaryAdvance(Request $request)
    {
        $request->validate([
            'user_id' => 'required|integer|exists:users,id',
            'amount' => 'required|numeric|min:1',
            'given_date' => 'required|date',
            'deduct_in_month' => 'nullable|date_format:Y-m',
            'notes' => 'nullable|string',
        ]);

        try {
            $advance = SalaryAdvance::create($request->only([
                'user_id', 'amount', 'given_date', 'deduct_in_month', 'notes'
            ]));
            return $this->success($advance, 'Salary advance recorded', 201);
        } catch (\Throwable $e) {
            return $this->error($e->getMessage(), 422);
        }
    }
}
