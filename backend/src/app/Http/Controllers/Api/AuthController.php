<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuthSession;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if (empty(config('jwt.secret'))) {
            return response()->json([
                'message' => 'JWT configuration missing: set JWT_SECRET environment variable.'
            ], 500);
        }

        $user = User::where('email', $data['email'])->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            return response()->json([
                'message' => 'Invalid credentials',
            ], 401);
        }

        $sessionId = (string) Str::uuid();

        $token = auth('api')->claims([
            'sid' => $sessionId,
        ])->login($user);

        $payload = auth('api')->payload();

        $refreshToken = Str::random(64);

        AuthSession::create([
            'id' => $sessionId,
            'user_id' => $user->id,
            'jwt_id' => $payload->get('jti'),
            'refresh_token_hash' => hash('sha256', $refreshToken),
            // store refresh token expiry window
            'expires_at' => now()->addMinutes((int) config('jwt.refresh_ttl')),
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'last_used_at' => now(),
        ]);

        return response()->json([
            'access_token' => $token,
            'refresh_token' => $refreshToken,
            'token_type' => 'bearer',
            'expires_in' => config('jwt.ttl') * 60,
        ]);
    }

    public function refresh(Request $request)
    {
        $data = $request->validate([
            'refresh_token' => 'required|string',
        ]);

        if (empty(config('jwt.secret'))) {
            return response()->json([
                'message' => 'JWT configuration missing: set JWT_SECRET environment variable.'
            ], 500);
        }

        // Don't require a valid current token for refresh
        auth('api')->payload(false);

        // Find active session by refresh token
        $current = AuthSession::where('refresh_token_hash', hash('sha256', $data['refresh_token']))
            ->whereNull('revoked_at')
            ->where('expires_at', '>', now())
            ->first();

        if (!$current) {
            return response()->json(['message' => 'Refresh token inválido ou expirado'], 401);
        }

        $user = User::findOrFail($current->user_id);

        // Revoke the old session
        $current->update([
            'revoked_at' => now(),
        ]);

        // Create a new session with a new refresh token
        $newSessionId = (string) \Illuminate\Support\Str::uuid();
        $newRefreshToken = \Illuminate\Support\Str::random(64);

        $token = auth('api')->claims([
            'sid' => $newSessionId,
        ])->login($user);

        $newPayload = auth('api')->payload();

        AuthSession::create([
            'id' => $newSessionId,
            'user_id' => $user->id,
            'jwt_id' => $newPayload->get('jti'),
            'refresh_token_hash' => hash('sha256', $newRefreshToken),
            'expires_at' => now()->addMinutes((int) config('jwt.refresh_ttl')),
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'last_used_at' => now(),
        ]);

        return response()->json([
            'access_token' => $token,
            'refresh_token' => $newRefreshToken,
            'token_type' => 'bearer',
            'expires_in' => config('jwt.ttl') * 60,
        ]);
    }

    public function me()
    {
        return response()->json(auth('api')->user());
    }

    public function logout()
    {
        $payload = auth('api')->payload();

        AuthSession::where('jwt_id', $payload->get('jti'))
            ->update([
                'revoked_at' => now(),
            ]);

        auth('api')->logout();

        return response()->noContent();
    }

    public function logoutAll()
    {
        AuthSession::where('user_id', auth('api')->id())
            ->whereNull('revoked_at')
            ->update([
                'revoked_at' => now(),
            ]);

        auth('api')->logout();

        return response()->noContent();
    }
}
