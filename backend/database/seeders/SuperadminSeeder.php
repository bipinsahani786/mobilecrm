<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class SuperadminSeeder extends Seeder
{
    public function run(): void
    {
        $superadmin = User::updateOrCreate(
            ['email' => 'superadmin@mobilecrm.com'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('password123'),
                'phone' => '9999999999'
            ]
        );
        
        // Ensure Spatie role is assigned globally (team_id = null)
        setPermissionsTeamId(null);
        $superadmin->assignRole('Superadmin');
    }
}
