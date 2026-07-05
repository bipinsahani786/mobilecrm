<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class PartnerMiddleware
{
    /**
     * Handle an incoming request.
     * Ensures the authenticated user has the Partner role and an active partner record.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user || !$user->hasRole('Partner')) {
            return response()->json(['message' => 'Forbidden. Partner access required.'], 403);
        }

        $partner = $user->partner;

        if (!$partner || !$partner->status) {
            return response()->json(['message' => 'Your partner account is inactive or not found.'], 403);
        }

        return $next($request);
    }
}
