<?php

namespace Tests\Unit;

use Tests\TestCase;
use Illuminate\Http\Request;
use App\Models\Property;

class PropertyControllerTest extends TestCase
{
    public function test_index_returns_properties_ordered()
    {
        Property::create(['name' => 'B', 'timezone' => 'UTC']);
        Property::create(['name' => 'A', 'timezone' => 'UTC']);

        $resp = (new \App\Http\Controllers\Api\PropertyController())->index();

        $this->assertEquals(200, $resp->getStatusCode());
        $data = $resp->getData(true);
        $this->assertEquals('A', $data[0]['name']);
    }

    public function test_store_creates_property_and_returns_201()
    {
        $validated = [
            'name' => 'NewProp',
            'timezone' => 'UTC',
        ];

        $request = new class($validated) extends Request {
            private $v;
            public function __construct($v)
            {
                parent::__construct();
                $this->v = $v;
            }
            public function validate($rules)
            {
                return $this->v;
            }
        };

        $resp = (new \App\Http\Controllers\Api\PropertyController())->store($request);

        $this->assertEquals(201, $resp->getStatusCode());
        $this->assertDatabaseHas('properties', ['name' => 'NewProp']);
    }

    public function test_show_returns_property()
    {
        $p = Property::create(['name' => 'ShowProp', 'timezone' => 'UTC']);
        $resp = (new \App\Http\Controllers\Api\PropertyController())->show($p);

        $this->assertEquals(200, $resp->getStatusCode());
        $this->assertEquals($p->id, $resp->getData(true)['id']);
    }

    public function test_update_updates_property()
    {
        $p = Property::create(['name' => 'Old', 'timezone' => 'UTC']);

        $validated = ['name' => 'Updated', 'timezone' => 'UTC'];

        $request = new class($validated) extends Request {
            private $v;
            public function __construct($v)
            {
                parent::__construct();
                $this->v = $v;
            }
            public function validate($rules)
            {
                return $this->v;
            }
        };

        $resp = (new \App\Http\Controllers\Api\PropertyController())->update($request, $p);

        $this->assertEquals(200, $resp->getStatusCode());
        $this->assertDatabaseHas('properties', ['id' => $p->id, 'name' => 'Updated']);
    }

    public function test_destroy_conflict_when_reservations_exist()
    {
        $p = new class extends Property {
            public $id = 'stub-conflict';
            public function reservations()
            {
                return new class { public function exists() { return true; } };
            }
        };

        $resp = (new \App\Http\Controllers\Api\PropertyController())->destroy($p);

        $this->assertEquals(409, $resp->getStatusCode());
    }

    public function test_destroy_deletes_when_no_reservations()
    {
        $p = new class extends Property {
            public $id = 'stub-delete';
            public function reservations()
            {
                return new class { public function exists() { return false; } };
            }
            public function delete()
            {
                return true;
            }
        };

        $resp = (new \App\Http\Controllers\Api\PropertyController())->destroy($p);

        $this->assertEquals(204, $resp->getStatusCode());
    }
}
