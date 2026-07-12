<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            PermissionSeeder::class,
            RoleSeeder::class,
            PlanSeeder::class,
            SuperadminSeeder::class,
            DummyDataSeeder::class,
            TestBusinessSeeder::class,
            FullFledgedSeeder::class,
        ]);
    }
}
