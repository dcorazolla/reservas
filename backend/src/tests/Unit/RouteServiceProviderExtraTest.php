<?php

namespace Tests\Unit;

use Tests\TestCase;
use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use App\Models\Property;
use App\Models\Invoice;

class RouteServiceProviderExtraTest extends TestCase
{
    public function test_invoice_binding_throws_when_property_mismatch()
    {
        $p1 = Property::create([
            'id' => Str::uuid()->toString(),
            'name' => 'P-A',
            'timezone' => 'UTC',
        ]);

        $p2 = Property::create([
            'id' => Str::uuid()->toString(),
            'name' => 'P-B',
            'timezone' => 'UTC',
        ]);

        $partner = \App\Models\Partner::create([
            'id' => Str::uuid()->toString(),
            'name' => 'Partner X',
        ]);

        $invoice = Invoice::create([
            'id' => Str::uuid()->toString(),
            'partner_id' => $partner->id,
            'property_id' => $p1->id,
            'number' => 'INV-X',
            'total' => 50,
        ]);

        // request claims property p2, while invoice belongs to p1 -> should throw
        $request = Request::create('/', 'GET');
        $request->attributes->set('property_id', $p2->id);
        $this->app->instance('request', $request);

        $provider = new \App\Providers\RouteServiceProvider($this->app);
        $provider->boot();

        $router = $this->app['router'];
        $ref = new \ReflectionObject($router);
        $prop = $ref->getProperty('binders');
        $prop->setAccessible(true);
        $binders = $prop->getValue($router);
        $closure = $binders['invoice'];

        $this->expectException(ModelNotFoundException::class);
        $closure($invoice->id);
    }

    public function test_invoice_binding_prefers_attribute_over_other_sources()
    {
        $p = Property::create([
            'id' => Str::uuid()->toString(),
            'name' => 'P-Attr',
            'timezone' => 'UTC',
        ]);

        $partner = \App\Models\Partner::create([
            'id' => Str::uuid()->toString(),
            'name' => 'Partner Y',
        ]);

        $inv = Invoice::create([
            'id' => Str::uuid()->toString(),
            'partner_id' => $partner->id,
            'property_id' => $p->id,
            'number' => 'INV-ATTR',
            'total' => 60,
        ]);

        $otherProp = Property::create([
            'id' => Str::uuid()->toString(),
            'name' => 'P-Other',
            'timezone' => 'UTC',
        ]);

        $user = \App\Models\User::create([
            'id' => Str::uuid()->toString(),
            'name' => 'U-Attr',
            'email' => 'uattr@example.com',
            'password' => 'secret',
            'property_id' => $otherProp->id, // different
        ]);

        $request = Request::create('/', 'GET');
        $request->attributes->set('property_id', $p->id);
        // also set user resolver to something else to ensure attribute wins
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

        $res = $closure($inv->id);
        $this->assertEquals($inv->id, $res->id);
    }
}
