<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Plan;

class PlanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $plans = [
            [
                'name' => 'Starter Plan',
                'description' => 'Essential tools for single branches.',
                'price_monthly' => 999.00,
                'price_yearly' => 9990.00,
                'features' => [
                    'max_locations' => 1,
                    'max_staff' => 3,
                    'has_finance' => false,
                    'has_payroll' => false,
                    'can_whitelabel_invoice' => false,
                    'has_activity_logs' => false,
                    'attendance_photo_retention_days' => 0,
                ],
                'is_active' => true,
            ],
            [
                'name' => 'Professional Plan',
                'description' => 'Advanced features and payroll support.',
                'price_monthly' => 1999.00,
                'price_yearly' => 19990.00,
                'features' => [
                    'max_locations' => 2,
                    'max_staff' => 10,
                    'has_finance' => true,
                    'has_payroll' => true,
                    'can_whitelabel_invoice' => true,
                    'has_activity_logs' => true,
                    'attendance_photo_retention_days' => 60,
                ],
                'is_active' => true,
            ],
            [
                'name' => 'Enterprise Plan',
                'description' => 'Complete suite with multi-branch and unlimited scale.',
                'price_monthly' => 3999.00,
                'price_yearly' => 39990.00,
                'features' => [
                    'max_locations' => 10,
                    'max_staff' => 50,
                    'has_finance' => true,
                    'has_payroll' => true,
                    'can_whitelabel_invoice' => true,
                    'has_activity_logs' => true,
                    'attendance_photo_retention_days' => 180,
                ],
                'is_active' => true,
            ],
        ];

        foreach ($plans as $planData) {
            Plan::create($planData);
        }
    }
}
