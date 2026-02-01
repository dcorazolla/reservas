<?php

namespace Tests\Unit;

use Tests\TestCase;
use Illuminate\Support\Str;

class AuthSessionTest extends TestCase
{
    public function test_auth_session_can_be_created_with_expires()
    {
        $property = \App\Models\Property::create(['id' => Str::uuid()->toString(), 'name' => 'P', 'timezone' => 'UTC']);
        $user = \App\Models\User::create(['id' => Str::uuid()->toString(), 'name' => 'u', 'email' => 'u@example.com', 'password' => 'secret', 'property_id' => $property->id]);

        $session = \App\Models\AuthSession::create([
            'id' => Str::uuid()->toString(),
            'user_id' => $user->id,
            'jwt_id' => Str::uuid()->toString(),
            'refresh_token_hash' => 'x',
            'expires_at' => now()->addHour()->toDateTimeString(),
        ]);

        $this->assertNotNull($session->expires_at);
    }
}
