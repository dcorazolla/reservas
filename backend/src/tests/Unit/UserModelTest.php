<?php

namespace Tests\Unit;

use Tests\TestCase;
use Illuminate\Support\Str;
use App\Models\User;
use App\Models\Property;

class UserModelTest extends TestCase
{
    public function test_jwt_custom_claims_include_property_name()
    {
        $property = Property::create([
            'id' => Str::uuid()->toString(),
            'name' => 'Prop1',
            'timezone' => 'UTC',
        ]);

        $user = User::create([
            'id' => Str::uuid()->toString(),
            'name' => 'User A',
            'email' => 'a@example.com',
            'password' => 'secret',
            'property_id' => $property->id,
        ]);

        $claims = $user->getJWTCustomClaims();

        $this->assertEquals($user->id, $claims['uid']);
        $this->assertEquals($user->name, $claims['name']);
        $this->assertEquals($user->email, $claims['email']);
        $this->assertEquals($property->id, $claims['property_id']);
        $this->assertEquals($property->name, $claims['property_name']);
    }

    public function test_get_jwt_identifier_returns_key()
    {
        $user = User::create([
            'id' => Str::uuid()->toString(),
            'name' => 'User B',
            'email' => 'b@example.com',
            'password' => 'secret',
        ]);

        $this->assertEquals($user->getKey(), $user->getJWTIdentifier());
    }

    public function test_jwt_custom_claims_when_no_property()
    {
        $user = User::create([
            'id' => Str::uuid()->toString(),
            'name' => 'User NoProp',
            'email' => 'noprop@example.com',
            'password' => 'secret',
        ]);

        $claims = $user->getJWTCustomClaims();

        $this->assertArrayHasKey('property_name', $claims);
        $this->assertNull($claims['property_name']);
        $this->assertEquals($user->id, $claims['uid']);
    }

    public function test_casts_method_returns_expected_keys()
    {
        $user = new User();
        $ref = new \ReflectionClass($user);
        $method = $ref->getMethod('casts');
        $method->setAccessible(true);
        $casts = $method->invoke($user);

        $this->assertIsArray($casts);
        $this->assertArrayHasKey('email_verified_at', $casts);
        $this->assertArrayHasKey('password', $casts);
    }

    public function test_property_relation_and_auth_sessions()
    {
        $property = Property::create([
            'id' => Str::uuid()->toString(),
            'name' => 'Prop2',
            'timezone' => 'UTC',
        ]);

        $user = User::create([
            'id' => Str::uuid()->toString(),
            'name' => 'User D',
            'email' => 'd@example.com',
            'password' => 'secret',
            'property_id' => $property->id,
        ]);

        $session = \App\Models\AuthSession::create([
            'id' => Str::uuid()->toString(),
            'user_id' => $user->id,
            'jwt_id' => 'j1',
            'refresh_token_hash' => 'h',
            'expires_at' => now()->addDay(),
        ]);

        // Access relation methods directly
        $this->assertEquals($property->id, $user->property()->first()->id);
        $this->assertEquals(1, $user->authSessions()->count());
    }
}
