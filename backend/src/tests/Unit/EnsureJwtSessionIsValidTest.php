<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\AuthSession;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Mockery;

class EnsureJwtSessionIsValidTest extends TestCase
{
    public function test_handle_allows_request_when_session_valid()
    {
        $jti = 'test-jti-123';

        $user = User::create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'secret',
        ]);

        $session = AuthSession::create([
            'user_id' => $user->id,
            'jwt_id' => $jti,
            'refresh_token_hash' => '',
            'expires_at' => now()->addHour(),
        ]);

        // Create a lightweight payload object with get('jti')
        $payload = new class($jti) {
            private $jti;
            public function __construct($j){$this->jti=$j;}
            public function get($k){ if($k==='jti') return $this->jti; return null; }
        };

        // Guard mock that exposes payload() and implements the Guard contract
        $guardStub = Mockery::mock(\Illuminate\Contracts\Auth\Guard::class);
        $guardStub->shouldReceive('payload')->andReturn($payload);

        // Create an Auth factory mock that returns our guard stub
        $authManager = Mockery::mock(\Illuminate\Contracts\Auth\Factory::class);
        $authManager->shouldReceive('guard')->with('api')->andReturn($guardStub);
        $this->app->instance('auth', $authManager);

        $middleware = new \App\Http\Middleware\EnsureJwtSessionIsValid();

        $req = \Illuminate\Http\Request::create('/api/ok', 'GET');

        $called = false;
        $response = $middleware->handle($req, function($r) use (&$called){ $called=true; return response()->json(['ok'=>true]); });

        $this->assertTrue($called);
        $this->assertEquals(200, $response->getStatusCode());
    }
}
