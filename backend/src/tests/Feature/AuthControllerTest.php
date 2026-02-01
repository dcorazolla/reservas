<?php

namespace Tests\Feature;

use App\Models\AuthSession;
use App\Models\User;
use Illuminate\Support\Str;
use Tests\TestCase;

class AuthControllerTest extends TestCase
{
    public function test_login_returns_tokens_and_creates_session()
    {
        $user = User::factory()->create();

        $response = $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['access_token', 'refresh_token', 'token_type', 'expires_in']);

        $this->assertDatabaseHas('auth_sessions', [
            'user_id' => $user->id,
        ]);
    }

    public function test_login_with_invalid_credentials_returns_401()
    {
        $user = User::factory()->create();

        $response = $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(401);
    }

    public function test_refresh_rotates_session_and_returns_new_tokens()
    {
        $user = User::factory()->create();

        $login = $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'password',
        ])->assertStatus(200);

        $data = $login->json();
        $this->assertArrayHasKey('refresh_token', $data);

        $oldSession = AuthSession::where('user_id', $user->id)->whereNull('revoked_at')->first();
        $this->assertNotNull($oldSession);

        $refresh = $this->postJson('/api/auth/refresh', [
            'refresh_token' => $data['refresh_token'],
        ])->assertStatus(200);

        $newData = $refresh->json();
        $this->assertArrayHasKey('access_token', $newData);
        $this->assertArrayHasKey('refresh_token', $newData);
        $this->assertNotEquals($data['refresh_token'], $newData['refresh_token']);

        $oldSession->refresh();
        $this->assertNotNull($oldSession->revoked_at);

        $this->assertDatabaseHas('auth_sessions', [
            'user_id' => $user->id,
            'refresh_token_hash' => hash('sha256', $newData['refresh_token']),
        ]);
    }

    public function test_me_requires_auth_and_returns_user()
    {
        $user = User::factory()->create();

        $login = $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'password',
        ])->assertStatus(200);

        $token = $login->json('access_token');

        $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/auth/me')
            ->assertStatus(200)
            ->assertJsonFragment(['email' => $user->email]);
    }

    public function test_logout_revokes_session()
    {
        $user = User::factory()->create();

        $login = $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'password',
        ])->assertStatus(200);

        $token = $login->json('access_token');

        $session = AuthSession::where('user_id', $user->id)->whereNull('revoked_at')->first();
        $this->assertNotNull($session);

        $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/auth/logout')
            ->assertNoContent();

        $session->refresh();
        $this->assertNotNull($session->revoked_at);
    }

    public function test_logout_all_revokes_all_sessions()
    {
        $user = User::factory()->create();

        // login twice to create two sessions
        $first = $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'password',
        ])->assertStatus(200);

        $second = $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'password',
        ])->assertStatus(200);

        $this->assertDatabaseCount('auth_sessions', 2);

        $token = $first->json('access_token');

        $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/auth/logout-all')
            ->assertNoContent();

        $this->assertDatabaseMissing('auth_sessions', [
            'user_id' => $user->id,
            'revoked_at' => null,
        ]);
    }
}
