<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use App\Models\User;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ensure Spatie uses global scope for Superadmin permissions
        setPermissionsTeamId(null);

        // Define all Superadmin permissions
        $permissions = [
            'view_dashboard',
            'manage_plans',
            'manage_tenants',
            'manage_partners',
            'manage_leads',
            'manage_commissions',
            'manage_users',
            'manage_settings',
            'manage_system_logs',
            'manage_roles',
            'manage_payouts',
        ];

        // Partner-specific permissions
        $partnerPermissions = [
            'view_partner_dashboard',
            'view_own_referrals',
            'view_own_commissions',
            'manage_own_payouts',
            'manage_own_profile',
        ];

        // Business/Tenant-specific permissions
        $businessPermissions = [
            'manage_sales',
            'manage_inventory',
            'manage_purchases',
            'manage_expenses',
            'manage_customers',
            'manage_suppliers',
            'manage_staff',
            'manage_attendance',
            'manage_payroll',
            'manage_business_settings',
        ];

        // Create all permissions
        foreach (array_merge($permissions, $partnerPermissions, $businessPermissions) as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        // Create the root Superadmin role
        $superadminRole = Role::firstOrCreate(['name' => 'Superadmin', 'guard_name' => 'web']);
        
        // Assign all permissions to Superadmin
        $superadminRole->syncPermissions(Permission::all());

        // Create and assign Partner role permissions
        $partnerRole = Role::firstOrCreate(['name' => 'Partner', 'guard_name' => 'web']);
        $partnerRole->syncPermissions($partnerPermissions);

        // Ensure user ID 1 is assigned Superadmin role if it exists
        $user = User::find(1);
        if ($user && !$user->hasRole('Superadmin')) {
            $user->assignRole($superadminRole);
        }
    }
}
