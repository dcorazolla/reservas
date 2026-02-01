<?php

namespace Tests\Unit;

use Tests\TestCase;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use App\Models\Property;
use App\Models\Invoice;

class RouteServiceProviderTest extends TestCase
{
    public function test_invoice_binding_respects_property_attribute()
    {
        $property = Property::create([
            'id' => Str::uuid()->toString(),
            'name' => 'P1',
            'timezone' => 'UTC',
        ]);

        $partner = \App\Models\Partner::create([
            'id' => Str::uuid()->toString(),
            'name' => 'Partner A',
        ]);

        $invoice = Invoice::create([
            'id' => Str::uuid()->toString(),
            'partner_id' => $partner->id,
            'property_id' => $property->id,
            'number' => 'INV-1',
            'total' => 100,
        ]);

        $request = Request::create('/', 'GET');
        $request->attributes->set('property_id', $property->id);
        $this->app->instance('request', $request);

        $provider = new \App\Providers\RouteServiceProvider($this->app);
        $provider->boot();

        $router = $this->app['router'];
        $ref = new \ReflectionObject($router);
        $prop = $ref->getProperty('binders');
        $prop->setAccessible(true);
        $binders = $prop->getValue($router);

        $this->assertArrayHasKey('invoice', $binders);

        $closure = $binders['invoice'];

        $result = $closure($invoice->id);

        $this->assertEquals($invoice->id, $result->id);
    }

    public function test_invoice_binding_uses_authenticated_user_property()
    {
        $property = Property::create([
            'id' => \Illuminate\Support\Str::uuid()->toString(),
            'name' => 'P2',
            'timezone' => 'UTC',
        ]);

        $partner = \App\Models\Partner::create([
            'id' => \Illuminate\Support\Str::uuid()->toString(),
            'name' => 'Partner B',
        ]);

        $invoice = Invoice::create([
            'id' => \Illuminate\Support\Str::uuid()->toString(),
            'partner_id' => $partner->id,
            'property_id' => $property->id,
            'number' => 'INV-2',
            'total' => 200,
        ]);

        $user = \App\Models\User::create([
            'id' => \Illuminate\Support\Str::uuid()->toString(),
            'name' => 'User C',
            'email' => 'c@example.com',
            'password' => 'secret',
            'property_id' => $property->id,
        ]);

        $request = \Illuminate\Http\Request::create('/', 'GET');
        $request->setUserResolver(fn () => $user);
        $this->app->instance('request', $request);

        $provider = new \App\Providers\RouteServiceProvider($this->app);
        $provider->boot();

        $router = $this->app['router'];
        $ref = new \ReflectionObject($router);
        $prop = $ref->getProperty('binders');
        $prop->setAccessible(true);
        $binders = $prop->getValue($router);

        $closure = $binders['invoice'];

        $result = $closure($invoice->id);

        $this->assertEquals($invoice->id, $result->id);
    }

    public function test_invoice_binding_uses_header_and_query_and_fallback()
    {
        // header
        $propertyH = Property::create([
            'id' => \Illuminate\Support\Str::uuid()->toString(),
            'name' => 'P-H',
            'timezone' => 'UTC',
        ]);

        $partner = \App\Models\Partner::create([
            'id' => \Illuminate\Support\Str::uuid()->toString(),
            'name' => 'Partner H',
        ]);

        $invoiceH = Invoice::create([
            'id' => \Illuminate\Support\Str::uuid()->toString(),
            'partner_id' => $partner->id,
            'property_id' => $propertyH->id,
            'number' => 'INV-H',
            'total' => 10,
        ]);

        $request = \Illuminate\Http\Request::create('/', 'GET');
        $request->headers->set('X-Property-Id', $propertyH->id);
        $this->app->instance('request', $request);

        $provider = new \App\Providers\RouteServiceProvider($this->app);
        $provider->boot();

        $router = $this->app['router'];
        $ref = new \ReflectionObject($router);
        $prop = $ref->getProperty('binders');
        $prop->setAccessible(true);
        $binders = $prop->getValue($router);

        $closure = $binders['invoice'];
        $result = $closure($invoiceH->id);
        $this->assertEquals($invoiceH->id, $result->id);

        // query: create invoice and request with query param
        $propertyQ = Property::create([
            'id' => \Illuminate\Support\Str::uuid()->toString(),
            'name' => 'P-Q',
            'timezone' => 'UTC',
        ]);

        $invoiceQ = Invoice::create([
            'id' => \Illuminate\Support\Str::uuid()->toString(),
            'partner_id' => $partner->id,
            'property_id' => $propertyQ->id,
            'number' => 'INV-Q',
            'total' => 11,
        ]);

        $requestQ = \Illuminate\Http\Request::create('/?property_id=' . $propertyQ->id, 'GET');
        $this->app->instance('request', $requestQ);

        $provider = new \App\Providers\RouteServiceProvider($this->app);
        $provider->boot();
        $router = $this->app['router'];
        $ref = new \ReflectionObject($router);
        $prop = $ref->getProperty('binders');
        $prop->setAccessible(true);
        $binders = $prop->getValue($router);
        $closure = $binders['invoice'];
        $result = $closure($invoiceQ->id);
        $this->assertEquals($invoiceQ->id, $result->id);

        // fallback behaviour is tested separately to keep DB state simple
    }

    public function test_invoice_binding_fallback_uses_first_property()
    {
        $propFallback = Property::create([
            'id' => \Illuminate\Support\Str::uuid()->toString(),
            'name' => 'P-F',
            'timezone' => 'UTC',
        ]);

        $partner = \App\Models\Partner::create([
            'id' => \Illuminate\Support\Str::uuid()->toString(),
            'name' => 'Partner F',
        ]);

        $invoiceF = Invoice::create([
            'id' => \Illuminate\Support\Str::uuid()->toString(),
            'partner_id' => $partner->id,
            'property_id' => $propFallback->id,
            'number' => 'INV-F',
            'total' => 12,
        ]);

        $requestF = \Illuminate\Http\Request::create('/', 'GET');
        $this->app->instance('request', $requestF);

        $provider = new \App\Providers\RouteServiceProvider($this->app);
        $provider->boot();
        $router = $this->app['router'];
        $ref = new \ReflectionObject($router);
        $prop = $ref->getProperty('binders');
        $prop->setAccessible(true);
        $binders = $prop->getValue($router);
        $closure = $binders['invoice'];
        $res = $closure($invoiceF->id);
        $this->assertEquals($invoiceF->id, $res->id);
    }
}
