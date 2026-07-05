<?php

namespace App\Http\Controllers\Api\Superadmin;

use App\Http\Controllers\BaseController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Support\Facades\Validator;

class RoleController extends BaseController
{
    /**
     * Get all roles and permissions
     */
    public function index(): JsonResponse
    {
        $roles = Role::whereNull('business_id')->with('permissions')->get();
        $permissions = Permission::all();

        return $this->success(
            ['roles' => $roles, 'permissions' => $permissions],
            'Roles retrieved successfully'
        );
    }

    /**
     * Create a new role
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:roles,name',
            'permissions' => 'array',
            'permissions.*' => 'string|exists:permissions,name',
        ]);

        if ($validator->fails()) {
            return $this->error('Validation Error.', $validator->errors(), 422);
        }

        $role = Role::create([
            'name' => $request->name,
            'guard_name' => 'web',
        ]);

        if ($request->has('permissions')) {
            $role->syncPermissions($request->permissions);
        }

        return $this->success(
            $role->load('permissions'),
            'Role created successfully',
            201
        );
    }

    /**
     * Get a specific role
     */
    public function show($id): JsonResponse
    {
        $role = Role::with('permissions')->find($id);

        if (!$role) {
            return $this->error('Role not found', [], 404);
        }

        return $this->success($role, 'Role retrieved successfully');
    }

    /**
     * Update a role
     */
    public function update(Request $request, $id): JsonResponse
    {
        $role = Role::find($id);

        if (!$role) {
            return $this->error('Role not found', [], 404);
        }

        // Prevent modifying the root Superadmin role name
        if ($role->name === 'Superadmin' && $request->name !== 'Superadmin') {
            return $this->error('Cannot rename the root Superadmin role', [], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:roles,name,' . $id,
            'permissions' => 'array',
            'permissions.*' => 'string|exists:permissions,name',
        ]);

        if ($validator->fails()) {
            return $this->error('Validation Error.', $validator->errors(), 422);
        }

        $role->name = $request->name;
        $role->save();

        if ($request->has('permissions')) {
            $role->syncPermissions($request->permissions);
        }

        return $this->success(
            $role->load('permissions'),
            'Role updated successfully'
        );
    }

    /**
     * Delete a role
     */
    public function destroy($id): JsonResponse
    {
        $role = Role::find($id);

        if (!$role) {
            return $this->error('Role not found', [], 404);
        }

        if ($role->name === 'Superadmin') {
            return $this->error('Cannot delete the root Superadmin role', [], 403);
        }

        $role->delete();

        return $this->success(null, 'Role deleted successfully');
    }
}
