<?php

use Illuminate\Database\Migrations\Migration;
use App\Models\Plan;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Adds has_quotations feature to existing plans.
     * Starter = false, Professional & Enterprise = true.
     */
    public function up(): void
    {
        $plans = Plan::all();
        foreach ($plans as $plan) {
            $features = $plan->features ?? [];
            if (!isset($features['has_quotations'])) {
                // Enable for non-starter plans (price > 1500)
                $features['has_quotations'] = $plan->price_monthly >= 1500;
                $plan->features = $features;
                $plan->save();
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $plans = Plan::all();
        foreach ($plans as $plan) {
            $features = $plan->features ?? [];
            unset($features['has_quotations']);
            $plan->features = $features;
            $plan->save();
        }
    }
};
