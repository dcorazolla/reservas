<?php

namespace Tests\Unit;

use Tests\TestCase;
use Illuminate\Http\Request;
use App\Models\Partner;
use Illuminate\Support\Str;

class PartnerControllerTest extends TestCase
{
    public function test_index_returns_all_partners()
    {
        Partner::create(['id' => (string) Str::uuid(), 'name' => 'P1']);
        Partner::create(['id' => (string) Str::uuid(), 'name' => 'P2']);

        $resp = (new \App\Http\Controllers\Api\PartnerController())->index();

        $this->assertEquals(200, $resp->getStatusCode());
        $data = $resp->getData(true);
        $this->assertCount(2, $data);
    }

    public function test_store_creates_partner_and_returns_201()
    {
        $validated = [
            'name' => 'New Partner',
            'email' => 'p@example.test',
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
            public function all($keys = null)
            {
                return $this->v;
            }
        };

        $resp = (new \App\Http\Controllers\Api\PartnerController())->store($request);

        $this->assertEquals(201, $resp->getStatusCode());
        $data = $resp->getData(true);
        $this->assertEquals('New Partner', $data['name']);
        $this->assertNotEmpty($data['id']);
        $this->assertDatabaseHas('partners', ['id' => $data['id']]);
    }

    public function test_show_returns_partner()
    {
        $p = Partner::create(['id' => (string) Str::uuid(), 'name' => 'ShowP']);

        $resp = (new \App\Http\Controllers\Api\PartnerController())->show($p);

        $this->assertEquals(200, $resp->getStatusCode());
        $this->assertEquals($p->id, $resp->getData(true)['id']);
    }

    public function test_update_updates_partner()
    {
        $p = Partner::create(['id' => (string) Str::uuid(), 'name' => 'OldName']);

        $validated = ['name' => 'Updated'];

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

        $resp = (new \App\Http\Controllers\Api\PartnerController())->update($request, $p);

        $this->assertEquals(200, $resp->getStatusCode());
        $this->assertDatabaseHas('partners', ['id' => $p->id, 'name' => 'Updated']);
    }

    public function test_destroy_deletes_partner_and_returns_204()
    {
        $p = Partner::create(['id' => (string) Str::uuid(), 'name' => 'Del']);

        $resp = (new \App\Http\Controllers\Api\PartnerController())->destroy($p);

        $this->assertEquals(204, $resp->getStatusCode());
        $this->assertDatabaseMissing('partners', ['id' => $p->id]);
    }
}
