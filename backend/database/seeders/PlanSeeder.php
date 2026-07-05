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
                'name' => 'Free Tier',
                'description' => 'Basic features for small businesses just getting started.',
                'price_monthly' => 0.00,
                'price_yearly' => 0.00,
                'features' => ['inventory'], // Minimal access
                'is_active' => true,
            ],
            [
                'name' => 'Starter Plan',
                'description' => 'Essential tools for growing businesses.',
                'price_monthly' => 999.00,
                'price_yearly' => 9990.00, // 2 months free
                'features' => ['inventory', 'suppliers', 'parties', 'pos', 'expenses'],
                'is_active' => true,
            ],
            [
                'name' => 'Professional',
                'description' => 'Advanced features and GST compliance reports.',
                'price_monthly' => 1999.00,
                'price_yearly' => 19990.00,
                'features' => ['inventory', 'suppliers', 'parties', 'pos', 'emi', 'expenses', 'payroll', 'gst_billing', 'gst_reports'],
                'is_active' => true,
            ],
            [
                'name' => 'Enterprise',
                'description' => 'Complete suite with multi-branch and staff roles.',
                'price_monthly' => 3999.00,
                'price_yearly' => 39990.00,
                'features' => ['inventory', 'suppliers', 'parties', 'pos', 'emi', 'expenses', 'payroll', 'gst_billing', 'gst_reports', 'multi_branch', 'staff_roles'],
                'is_active' => true,
            ],
        ];

        foreach ($plans as $planData) {
            Plan::create($planData);
        }
    }
}
