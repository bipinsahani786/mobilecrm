<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckFeatureAccess
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, string $feature): Response
    {
        $business = $request->attributes->get('business') ?? (app()->bound('tenant') ? app('tenant') : null);
        
        if (!$business) {
            return response()->json(['message' => 'No active business context.'], 403);
        }

        // If Superadmin or Plan doesn't exist, we might allow or deny based on business logic.
        // But normally every business needs a plan. Let's load the plan:
        $plan = $business->plan;
        
        if (!$plan) {
            return response()->json([
                'error' => 'plan_upgrade_required',
                'feature' => $feature,
                'message' => 'Your business does not have an active subscription plan.'
            ], 403);
        }

        $features = $plan->features ?? [];
        
        // If the feature is false or missing, block access
        if (!isset($features[$feature]) || $features[$feature] == false) {
            return response()->json([
                'error' => 'plan_upgrade_required',
                'feature' => $feature,
                'message' => 'This feature requires a plan upgrade.'
            ], 403);
        }

        return $next($request);
    }
}
