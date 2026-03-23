<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPermission
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $permission): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        // Super Admin / Admin bypass
        if ($user->role === 'admin' || $user->role === 'super_admin' || 
            ($user->roleDefinition && $user->roleDefinition->name === 'Administrator')) {
            return $next($request);
        }

        if (!$user->hasPermission($permission)) {
            return response()->json(['message' => 'Unauthorized. Missing permission: ' . $permission], 403);
        }

        return $next($request);
    }
}
