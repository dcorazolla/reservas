<?php

namespace Tests\Unit;

use Tests\TestCase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\AuthSession;
use Mockery;

class AuthControllerTest extends TestCase
{
    public function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    public function test_login_success_creates_session_and_returns_tokens()
    {
        config(['jwt.secret' => 'secret', 'jwt.ttl' => 60, 'jwt.refresh_ttl' => 10080]);

        $user = User::create([
            'email' => 'u@example.test',
            'password' => Hash::make('s3cret'),
            'name' => 'U',
        ]);

        $guard = Mockery::mock(\Illuminate\Contracts\Auth\Guard::class);
        $guard->shouldReceive('claims')->with(Mockery::any())->andReturnSelf();
        $guard->shouldReceive('login')->with(Mockery::type(User::class))->andReturn('access-token-xyz');

        $payload = Mockery::mock();
        $payload->shouldReceive('get')->with('jti')->andReturn('jti-123');
        $guard->shouldReceive('payload')->andReturn($payload);

        $authManager = Mockery::mock(\Illuminate\Contracts\Auth\Factory::class);
        $authManager->shouldReceive('guard')->with('api')->andReturn($guard);
        $this->app->instance('auth', $authManager);

        $req = Request::create('/login', 'POST', [
            'email' => 'u@example.test',
            'password' => 's3cret',
        ]);
        $req->server->set('REMOTE_ADDR', '127.0.0.1');
        $req->headers->set('User-Agent', 'phpunit');

        $resp = (new \App\Http\Controllers\Api\AuthController())->login($req);

        $this->assertEquals(200, $resp->getStatusCode());
        $json = $resp->getData(true);
        $this->assertArrayHasKey('access_token', $json);
        $this->assertArrayHasKey('refresh_token', $json);

        // AuthSession record created
        $this->assertDatabaseHas('auth_sessions', [
            'user_id' => $user->id,
        ]);
    }

    public function test_login_invalid_credentials_returns_401()
    {
        config(['jwt.secret' => 'secret']);

        User::create([
            'email' => 'v@example.test',
            'password' => Hash::make('right'),
            'name' => 'V',
        ]);

        $req = Request::create('/login', 'POST', [
            'email' => 'v@example.test',
            'password' => 'wrong',
        ]);

        $resp = (new \App\Http\Controllers\Api\AuthController())->login($req);

        $this->assertEquals(401, $resp->getStatusCode());
        $this->assertEquals(['message' => 'Invalid credentials'], $resp->getData(true));
    }

    public function test_refresh_with_invalid_token_returns_401()
    {
        config(['jwt.secret' => 'secret']);

        $guard = Mockery::mock(\Illuminate\Contracts\Auth\Guard::class);
        // allow payload(false) call
        $guard->shouldReceive('payload')->with(false)->andReturn(null);
        $authManager = Mockery::mock(\Illuminate\Contracts\Auth\Factory::class);
        $authManager->shouldReceive('guard')->with('api')->andReturn($guard);
        $this->app->instance('auth', $authManager);

        $req = Request::create('/refresh', 'POST', [
            'refresh_token' => 'nope',
        ]);

        $resp = (new \App\Http\Controllers\Api\AuthController())->refresh($req);

        $this->assertEquals(401, $resp->getStatusCode());
    }

    public function test_refresh_success_rotates_session_and_returns_tokens()
    {
        config(['jwt.secret' => 'secret', 'jwt.ttl' => 60, 'jwt.refresh_ttl' => 10080]);

        $user = User::create([
            'email' => 'r@example.test',
            'password' => Hash::make('pass'),
            'name' => 'R',
        ]);

        $oldId = (string) \Illuminate\Support\Str::uuid();
        AuthSession::create([
            'id' => $oldId,
            'user_id' => $user->id,
            'jwt_id' => 'old-jti',
            'refresh_token_hash' => hash('sha256', 'rtok'),
            'expires_at' => now()->addMinutes(10),
            'ip' => '127.0.0.1',
            'user_agent' => 'phpunit',
            'last_used_at' => now(),
        ]);

        $guard = Mockery::mock(\Illuminate\Contracts\Auth\Guard::class);
        $guard->shouldReceive('payload')->with(false)->andReturnNull();
        $guard->shouldReceive('claims')->andReturnSelf();
        $guard->shouldReceive('login')->with(Mockery::type(User::class))->andReturn('new-access-token');

        $newPayload = Mockery::mock();
        $newPayload->shouldReceive('get')->with('jti')->andReturn('new-jti');
        $guard->shouldReceive('payload')->withNoArgs()->andReturn($newPayload);

        $authManager = Mockery::mock(\Illuminate\Contracts\Auth\Factory::class);
        $authManager->shouldReceive('guard')->with('api')->andReturn($guard);
        $this->app->instance('auth', $authManager);

        $req = Request::create('/refresh', 'POST', ['refresh_token' => 'rtok']);
        $req->server->set('REMOTE_ADDR', '127.0.0.1');
        $req->headers->set('User-Agent', 'phpunit');

        $resp = (new \App\Http\Controllers\Api\AuthController())->refresh($req);

        $this->assertEquals(200, $resp->getStatusCode());
        $json = $resp->getData(true);
        $this->assertArrayHasKey('access_token', $json);
        $this->assertArrayHasKey('refresh_token', $json);

        // old session revoked, a new active session exists
        $this->assertDatabaseMissing('auth_sessions', ['id' => $oldId, 'revoked_at' => null]);
        $this->assertDatabaseHas('auth_sessions', ['user_id' => $user->id, 'revoked_at' => null]);
    }

    public function test_me_returns_authenticated_user()
    {
        $user = User::create([
            'email' => 'm@example.test',
            'password' => Hash::make('pass'),
            'name' => 'M',
        ]);

        $guard = Mockery::mock(\Illuminate\Contracts\Auth\Guard::class);
        $guard->shouldReceive('user')->andReturn($user);
        $authManager = Mockery::mock(\Illuminate\Contracts\Auth\Factory::class);
        $authManager->shouldReceive('guard')->with('api')->andReturn($guard);
        $this->app->instance('auth', $authManager);

        $resp = (new \App\Http\Controllers\Api\AuthController())->me();

        $this->assertEquals(200, $resp->getStatusCode());
        $this->assertEquals($user->id, $resp->getData(true)['id']);
    }

    public function test_logout_revokes_current_session_and_logs_out()
    {
        $user = User::create([
            'email' => 'l@example.test',
            'password' => Hash::make('pass'),
            'name' => 'L',
        ]);

        $sessId = (string) \Illuminate\Support\Str::uuid();
        AuthSession::create([
            'id' => $sessId,
            'user_id' => $user->id,
            'jwt_id' => 'jti-logout',
            'refresh_token_hash' => hash('sha256', 'x'),
            'expires_at' => now()->addMinutes(10),
            'ip' => '127.0.0.1',
            'user_agent' => 'phpunit',
            'last_used_at' => now(),
        ]);

        $payload = Mockery::mock();
        $payload->shouldReceive('get')->with('jti')->andReturn('jti-logout');

        $guard = Mockery::mock(\Illuminate\Contracts\Auth\Guard::class);
        $guard->shouldReceive('payload')->andReturn($payload);
        $guard->shouldReceive('logout')->andReturnNull();

        $authManager = Mockery::mock(\Illuminate\Contracts\Auth\Factory::class);
        $authManager->shouldReceive('guard')->with('api')->andReturn($guard);
        $this->app->instance('auth', $authManager);

        $resp = (new \App\Http\Controllers\Api\AuthController())->logout();

        $this->assertEquals(204, $resp->getStatusCode());
        $this->assertDatabaseMissing('auth_sessions', ['id' => $sessId, 'revoked_at' => null]);
    }

    public function test_logoutAll_revokes_all_sessions_and_logs_out()
    {
        $user = User::create([
            'email' => 'la@example.test',
            'password' => Hash::make('pass'),
            'name' => 'LA',
        ]);

        AuthSession::create([
            'id' => (string) \Illuminate\Support\Str::uuid(),
            'user_id' => $user->id,
            'jwt_id' => 'j1',
            'refresh_token_hash' => hash('sha256', 'a'),
            'expires_at' => now()->addMinutes(10),
            'ip' => '127.0.0.1',
            'user_agent' => 'phpunit',
            'last_used_at' => now(),
        ]);
        AuthSession::create([
            'id' => (string) \Illuminate\Support\Str::uuid(),
            'user_id' => $user->id,
            'jwt_id' => 'j2',
            'refresh_token_hash' => hash('sha256', 'b'),
            'expires_at' => now()->addMinutes(10),
            'ip' => '127.0.0.1',
            'user_agent' => 'phpunit',
            'last_used_at' => now(),
        ]);

        $guard = Mockery::mock(\Illuminate\Contracts\Auth\Guard::class);
        $guard->shouldReceive('id')->andReturn($user->id);
        $guard->shouldReceive('logout')->andReturnNull();

        $authManager = Mockery::mock(\Illuminate\Contracts\Auth\Factory::class);
        $authManager->shouldReceive('guard')->with('api')->andReturn($guard);
        $this->app->instance('auth', $authManager);

        $resp = (new \App\Http\Controllers\Api\AuthController())->logoutAll();

        $this->assertEquals(204, $resp->getStatusCode());
        $this->assertDatabaseMissing('auth_sessions', ['user_id' => $user->id, 'revoked_at' => null]);
    }
}
