<?php

namespace Tests\Unit;

use Tests\TestCase;
use Illuminate\Support\Str;
use App\Models\User;
use App\Models\Property;

class UserModelExtraTest extends TestCase
{
    public function test_jwt_custom_claims_with_loaded_property()
    {
        $property = Property::create([
            'id' => Str::uuid()->toString(),
            'name' => 'Prop-Extra',
            'timezone' => 'UTC',
        ]);

        $user = User::create([
            'id' => Str::uuid()->toString(),
            'name' => 'User Extra',
            'email' => 'extra@example.com',
            'password' => 'secret',
            'property_id' => $property->id,
        ]);

        // ensure relation is loaded path is exercised
        $user->load('property');

        $claims = $user->getJWTCustomClaims();

        $this->assertEquals($property->name, $claims['property_name']);
        $this->assertEquals($property->id, $claims['property_id']);
    }

    public function test_auth_sessions_relation_is_populated()
    {
        $property = Property::create([
            'id' => Str::uuid()->toString(),
            'name' => 'Prop-AS',
            'timezone' => 'UTC',
        ]);

        $user = User::create([
            'id' => Str::uuid()->toString(),
            'name' => 'User AS',
            'email' => 'as@example.com',
            'password' => 'secret',
            'property_id' => $property->id,
        ]);

        $session = \App\Models\AuthSession::create([
            'id' => Str::uuid()->toString(),
            'user_id' => $user->id,
            'jwt_id' => 'j2',
            'refresh_token_hash' => 'h2',
            'expires_at' => now()->addDay(),
        ]);

        $this->assertCount(1, $user->authSessions()->get());
        $this->assertEquals($session->id, $user->authSessions()->first()->id);
    }
}
