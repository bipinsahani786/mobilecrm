<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        // Ensure Spatie uses global scope for these templates
        setPermissionsTeamId(null);

        // System level role
        Role::updateOrCreate(['name' => 'Superadmin', 'business_id' => null]);
        Role::updateOrCreate(['name' => 'Partner', 'business_id' => null]);
        
        // Tenant (Business) level roles
        Role::updateOrCreate(['name' => 'Business Admin', 'business_id' => null]);
        Role::updateOrCreate(['name' => 'Accountant', 'business_id' => null]);
        Role::updateOrCreate(['name' => 'Delivery Boy', 'business_id' => null]);
        Role::updateOrCreate(['name' => 'Employee', 'business_id' => null]);
    }
}
