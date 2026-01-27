<?php

namespace App\Http\Middleware;

use App\Models\AuthSession;
use Closure;
use Illuminate\Http\Request;

class EnsureJwtSessionIsValid
{
    public function handle(Request $request, Closure $next)
    {
        $payload = auth('api')->payload();

        $session = AuthSession::where('jwt_id', $payload->get('jti'))
            ->whereNull('revoked_at')
            ->first();

        if (! $session) {
            return response()->json([
                'message' => 'Session revoked or invalid'
            ], 401);
        }

        if ($session->expires_at->isPast()) {
            return response()->json([
                'message' => 'Session expired'
            ], 401);
        }

        $session->update([
            'last_used_at' => now(),
        ]);

        return $next($request);
    }
}
