<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class UserService
{
    /**
     * Get paginated users with optional filters.
     */
    public function getPaginatedUsers(array $filters, int $perPage = 10): LengthAwarePaginator
    {
        $query = User::with(['roles', 'businesses:id,name']);

        if (!empty($filters['is_superadmin_staff'])) {
            $query->whereDoesntHave('businesses')->whereDoesntHave('partner');
        }

        // Search by name, email, or phone
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        // Filter by Spatie role name
        if (!empty($filters['role'])) {
            $query->role($filters['role']);
        }

        // Filter by status
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        // Date range filter on created_at
        if (!empty($filters['from_date'])) {
            $query->whereDate('created_at', '>=', $filters['from_date']);
        }
        if (!empty($filters['to_date'])) {
            $query->whereDate('created_at', '<=', $filters['to_date']);
        }

        // Sorting
        $sortBy = $filters['sort_by'] ?? 'created_at';
        $sortOrder = $filters['sort_order'] ?? 'desc';
        $allowedSorts = ['name', 'email', 'phone', 'created_at', 'status'];
        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortOrder);
        } else {
            $query->orderBy('created_at', 'desc');
        }

        return $query->paginate($perPage);
    }

    /**
     * Get analytics / summary stats for the users page.
     */
    public function getStats(array $filters = []): array
    {
        $query = User::query();
        if (!empty($filters['is_superadmin_staff'])) {
            $query->whereDoesntHave('businesses')->whereDoesntHave('partner');
        }

        $totalUsers = (clone $query)->count();
        $activeUsers = (clone $query)->where('status', 'active')->count();
        $suspendedUsers = (clone $query)->where('status', 'suspended')->count();
        $verifiedUsers = (clone $query)->whereNotNull('email_verified_at')->count();

        // Count per role using Spatie
        $roleQuery = DB::table('model_has_roles')
            ->join('roles', 'roles.id', '=', 'model_has_roles.role_id')
            ->where('model_has_roles.model_type', 'App\\Models\\User');
            
        if (!empty($filters['is_superadmin_staff'])) {
            // Also restrict role counting to global roles only for stats
            $roleQuery->whereNull('roles.business_id');
        }

        $roleCounts = $roleQuery->select('roles.name', DB::raw('count(*) as count'))
            ->groupBy('roles.name')
            ->pluck('count', 'name')
            ->toArray();

        // Users added in the last 30 days
        $newUsersThisMonth = (clone $query)->where('created_at', '>=', now()->subDays(30))->count();

        return [
            'total_users'        => $totalUsers,
            'active_users'       => $activeUsers,
            'suspended_users'    => $suspendedUsers,
            'verified_users'     => $verifiedUsers,
            'new_users_30d'      => $newUsersThisMonth,
            'role_counts'        => $roleCounts,
        ];
    }

    /**
     * Find a single user by ID.
     */
    public function findById(int $id): User
    {
        return User::with(['roles', 'businesses:id,name'])->findOrFail($id);
    }

    /**
     * Create a new user.
     */
    public function createUser(array $data): User
    {
        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'password' => bcrypt($data['password']),
            'email_verified_at' => now(), // Auto verify staff members created by superadmin
        ]);

        if (!empty($data['role'])) {
            $user->assignRole($data['role']);
        }

        return $user->load(['roles', 'businesses:id,name']);
    }

    /**
     * Update basic user fields.
     */
    public function updateUser(int $id, array $data): User
    {
        $user = User::findOrFail($id);

        $user->fill(array_filter([
            'name'  => $data['name']  ?? null,
            'email' => $data['email'] ?? null,
            'phone' => $data['phone'] ?? null,
        ]));

        if (!empty($data['password'])) {
            $user->password = bcrypt($data['password']);
        }

        $user->save();

        // Sync role if provided
        if (!empty($data['role'])) {
            $user->syncRoles([$data['role']]);
        }

        return $user->load(['roles', 'businesses:id,name']);
    }

    /**
     * Update user status (active / suspended).
     */
    public function updateStatus(int $id, string $status): User
    {
        $user = User::findOrFail($id);
        $user->status = $status;
        $user->save();

        return $user->load(['roles', 'businesses:id,name']);
    }

    /**
     * Soft-delete a user.
     */
    public function deleteUser(int $id): void
    {
        $user = User::findOrFail($id);
        $user->delete();
    }
}
