<?php

namespace App\Http\Controllers\Api\Superadmin;

use App\Http\Controllers\BaseController;
use App\Services\UserService;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;
use Spatie\Permission\Models\Role;

class UserController extends BaseController
{
    protected UserService $userService;

    public function __construct(UserService $userService)
    {
        $this->userService = $userService;
    }

    #[OA\Get(
        path: '/superadmin/users/roles',
        summary: 'List All Roles',
        description: 'Returns all roles available in the system.',
        tags: ['Superadmin - Users'],
        security: [['sanctum' => []]],
        responses: [
            new OA\Response(response: 200, description: 'Roles retrieved successfully'),
        ]
    )]
    public function roles()
    {
        $roles = Role::whereNull('business_id')->select('id', 'name')->orderBy('name')->get();
        return $this->success($roles, 'Roles retrieved successfully');
    }

    #[OA\Get(
        path: '/superadmin/users',
        summary: 'List All Platform Users',
        description: 'Paginated list of every user in the system with optional search, role, and date filters.',
        tags: ['Superadmin - Users'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'page', in: 'query', schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(name: 'per_page', in: 'query', schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(name: 'search', in: 'query', schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'role', in: 'query', schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'from_date', in: 'query', schema: new OA\Schema(type: 'string', format: 'date')),
            new OA\Parameter(name: 'to_date', in: 'query', schema: new OA\Schema(type: 'string', format: 'date')),
            new OA\Parameter(name: 'sort_by', in: 'query', schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'sort_order', in: 'query', schema: new OA\Schema(type: 'string', enum: ['asc', 'desc'])),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Users retrieved successfully'),
        ]
    )]
    public function index(Request $request)
    {
        $filters = $request->only(['search', 'role', 'status', 'from_date', 'to_date', 'sort_by', 'sort_order']);
        $filters['is_superadmin_staff'] = true;
        $perPage = $request->input('per_page', 10);

        $paginator = $this->userService->getPaginatedUsers($filters, $perPage);
        return $this->paginated($paginator, 'Users retrieved successfully');
    }

    #[OA\Get(
        path: '/superadmin/users/stats',
        summary: 'User Analytics Stats',
        description: 'Returns summary statistics for the users page analytics cards.',
        tags: ['Superadmin - Users'],
        security: [['sanctum' => []]],
        responses: [
            new OA\Response(response: 200, description: 'Stats retrieved successfully'),
        ]
    )]
    public function stats()
    {
        $stats = $this->userService->getStats(['is_superadmin_staff' => true]);
        return $this->success($stats, 'User stats retrieved successfully');
    }

    #[OA\Patch(
        path: '/superadmin/users/{id}/status',
        summary: 'Update User Status',
        description: 'Activate or suspend a user account.',
        tags: ['Superadmin - Users'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['status'],
                properties: [
                    new OA\Property(property: 'status', type: 'string', enum: ['active', 'suspended']),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'User status updated successfully'),
            new OA\Response(response: 404, description: 'User not found'),
        ]
    )]
    public function updateStatus(Request $request, int $id)
    {
        $request->validate([
            'status' => 'required|in:active,suspended',
        ]);

        try {
            $user = $this->userService->updateStatus($id, $request->status);
            return $this->success($user, 'User status updated successfully.');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->notFound('User not found.');
        }
    }

    #[OA\Get(
        path: '/superadmin/users/{id}',
        summary: 'Get Single User',
        description: 'Retrieve a single user with their roles and associated businesses.',
        tags: ['Superadmin - Users'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'User retrieved successfully'),
            new OA\Response(response: 404, description: 'User not found'),
        ]
    )]
    public function show(int $id)
    {
        try {
            $user = $this->userService->findById($id);
            return $this->success($user, 'User retrieved successfully');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->notFound('User not found.');
        }
    }

    #[OA\Post(
        path: '/superadmin/users',
        summary: 'Create User',
        description: 'Create a new user/staff member and assign a role.',
        tags: ['Superadmin - Users'],
        security: [['sanctum' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['name', 'email', 'password'],
                properties: [
                    new OA\Property(property: 'name', type: 'string'),
                    new OA\Property(property: 'email', type: 'string'),
                    new OA\Property(property: 'phone', type: 'string'),
                    new OA\Property(property: 'password', type: 'string'),
                    new OA\Property(property: 'role', type: 'string'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'User created successfully'),
            new OA\Response(response: 422, description: 'Validation Error'),
        ]
    )]
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|max:255|unique:users,email',
            'phone'    => 'nullable|string|max:20|unique:users,phone',
            'password' => 'required|string|min:8',
            'role'     => 'nullable|string|exists:roles,name',
        ]);

        $user = $this->userService->createUser($validated);
        return $this->success($user, 'User created successfully.', 201);
    }

    #[OA\Patch(
        path: '/superadmin/users/{id}',
        summary: 'Update User',
        description: 'Update a user\'s name, email, phone, password, or role.',
        tags: ['Superadmin - Users'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        requestBody: new OA\RequestBody(
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'name', type: 'string'),
                    new OA\Property(property: 'email', type: 'string'),
                    new OA\Property(property: 'phone', type: 'string'),
                    new OA\Property(property: 'password', type: 'string'),
                    new OA\Property(property: 'role', type: 'string'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'User updated successfully'),
            new OA\Response(response: 404, description: 'User not found'),
        ]
    )]
    public function update(Request $request, int $id)
    {
        $validated = $request->validate([
            'name'     => 'sometimes|string|max:255',
            'email'    => 'sometimes|email|max:255|unique:users,email,' . $id,
            'phone'    => 'sometimes|nullable|string|max:20|unique:users,phone,' . $id,
            'password' => 'sometimes|nullable|string|min:8',
            'role'     => 'sometimes|string|exists:roles,name',
        ]);

        try {
            $user = $this->userService->updateUser($id, $validated);
            return $this->success($user, 'User updated successfully.');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->notFound('User not found.');
        }
    }

    #[OA\Delete(
        path: '/superadmin/users/{id}',
        summary: 'Delete User',
        description: 'Soft-deletes a user from the system.',
        tags: ['Superadmin - Users'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'User deleted successfully'),
            new OA\Response(response: 404, description: 'User not found'),
        ]
    )]
    public function destroy(int $id)
    {
        try {
            $this->userService->deleteUser($id);
            return $this->success(null, 'User deleted successfully.');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->notFound('User not found.');
        }
    }
}
