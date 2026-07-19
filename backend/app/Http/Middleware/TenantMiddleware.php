<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\Business;

class TenantMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $tenantId = $request->header('X-Tenant-ID');

        if (!$tenantId) {
            return response()->json(['message' => 'Missing Tenant ID header.'], 400);
        }

        $business = Business::find($tenantId);

        if (!$business) {
            return response()->json(['message' => 'Tenant not found.'], 404);
        }

        if ($business->status === 'suspended') {
            return response()->json(['message' => 'This business account has been suspended by the administrator.'], 403);
        }

        // Verify user belongs to this business
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        // Simplest check: is the user the owner? 
        // Later we can check business_user table if staff roles are implemented
        if ($business->owner_id !== $user->id) {
            // Check business_user table for staff using eloquent relationship
            $isStaff = $user->businesses()->where('businesses.id', $business->id)->exists();
                
            if (!$isStaff && !$user->hasRole('Superadmin')) {
                 return response()->json(['message' => 'Unauthorized access to this tenant.'], 403);
            }
        }

        // Store tenant in Laravel's service container for easy access globally
        app()->instance('tenant', $business);
        app()->instance('current_business_id', $business->id);
        
        // Let Spatie permissions know which business context we are in
        setPermissionsTeamId($business->id);

        return $next($request);
    }
}
