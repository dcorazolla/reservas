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
            'expires_at' => now()->addMinutes(config('jwt.ttl')),
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'access_token' => $token,
            'refresh_token' => $refreshToken,
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
