<?php

namespace App\Http\Controllers\Api\Business;

use App\Http\Controllers\BaseController;
use App\Services\Business\StaffService;
use Illuminate\Http\Request;

class StaffController extends BaseController
{
    public function __construct(private StaffService $staffService) {}

    public function index()
    {
        try {
            $staff = $this->staffService->getStaff();
            return $this->success($staff, 'Staff retrieved successfully');
        } catch (\Throwable $e) {
            return $this->error($e->getMessage(), 500);
        }
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'email' => 'nullable|email',
            'password' => 'nullable|string|min:6',
            'role' => 'nullable|string|in:staff,manager',
            'monthly_salary' => 'nullable|numeric|min:0',
            'commission_rate' => 'nullable|numeric|min:0|max:100',
            'join_date' => 'nullable|date',
            'salary_components' => 'nullable|array',
        ]);

        try {
            $staff = $this->staffService->addStaff($request->all());
            return $this->success($staff, 'Staff added successfully', 201);
        } catch (\Throwable $e) {
            return $this->error($e->getMessage(), 422);
        }
    }

    public function show(int $id)
    {
        try {
            $data = $this->staffService->getStaffDetail($id);
            return $this->success($data, 'Staff detail retrieved successfully');
        } catch (\Throwable $e) {
            return $this->error($e->getMessage(), 404);
        }
    }

    public function update(Request $request, int $id)
    {
        $request->validate([
            'name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email',
            'role' => 'nullable|string|in:staff,manager',
            'monthly_salary' => 'nullable|numeric|min:0',
            'commission_rate' => 'nullable|numeric|min:0|max:100',
            'join_date' => 'nullable|date',
            'status' => 'nullable|string|in:active,inactive',
            'salary_components' => 'nullable|array',
        ]);

        try {
            $this->staffService->updateStaff($id, $request->all());
            return $this->success(null, 'Staff updated successfully');
        } catch (\Throwable $e) {
            return $this->error($e->getMessage(), 422);
        }
    }

    public function destroy(int $id)
    {
        try {
            $this->staffService->deactivateStaff($id);
            return $this->success(null, 'Staff deactivated successfully');
        } catch (\Throwable $e) {
            return $this->error($e->getMessage(), 500);
        }
    }

    public function salesReport(Request $request, int $id)
    {
        try {
            $sales = $this->staffService->getStaffSalesReport($id, $request->input('per_page', 15));
            return $this->success($sales, 'Sales report retrieved successfully');
        } catch (\Throwable $e) {
            return $this->error($e->getMessage(), 500);
        }
    }

    public function getPermissions(int $id)
    {
        try {
            $permissions = $this->staffService->getStaffPermissions($id);
            return $this->success($permissions, 'Permissions retrieved successfully');
        } catch (\Throwable $e) {
            return $this->error($e->getMessage(), 500);
        }
    }

    public function updatePermissions(Request $request, int $id)
    {
        $request->validate([
            'permissions' => 'array',
            'permissions.*' => 'string'
        ]);

        try {
            $this->staffService->updateStaffPermissions($id, $request->input('permissions', []));
            return $this->success(null, 'Permissions updated successfully');
        } catch (\Throwable $e) {
            return $this->error($e->getMessage(), 500);
        }
    }
}
