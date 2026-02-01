<?php

namespace Tests\Unit;

use Tests\TestCase;
use Illuminate\Http\Request;

class MiddlewareAuthenticateTest extends TestCase
{
    public function test_redirect_to_is_null()
    {
        $ref = new \ReflectionClass(\App\Http\Middleware\Authenticate::class);
        $middleware = $ref->newInstanceWithoutConstructor();
        $ref = new \ReflectionClass($middleware);
        $m = $ref->getMethod('redirectTo');
        $m->setAccessible(true);
        $this->assertNull($m->invoke($middleware, Request::create('/', 'GET')));
    }
}
