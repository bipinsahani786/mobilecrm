<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetTenantContext
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Retrieve business_id from Header or Session
        $businessId = $request->header('X-Business-ID') ?? $request->session()->get('current_business_id');

        if ($businessId) {
            // Verify if the authenticated user belongs to this business
            if ($request->user() && $request->user()->businesses()->where('businesses.id', $businessId)->exists()) {
                
                // Set the current business ID in the container for the TenantScope to use
                app()->instance('current_business_id', $businessId);
                
                // Tell Spatie Permissions which business (team) roles to check against
                setPermissionsTeamId($businessId);
                
            } else {
                return response()->json(['message' => 'Unauthorized for this business.'], 403);
            }
        }

        return $next($request);
    }
}
