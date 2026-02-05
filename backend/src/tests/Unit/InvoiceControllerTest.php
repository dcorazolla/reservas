<?php

namespace Tests\Unit;

use Tests\TestCase;
use Illuminate\Http\Request;
use App\Models\Invoice;
use App\Models\Property;
use App\Models\Partner;

class InvoiceControllerTest extends TestCase
{
    public function test_index_returns_paginated_invoices_for_property()
    {
        $property = Property::create(['name' => 'P', 'timezone' => 'UTC']);

        $partner = Partner::create(['name' => 'P1']);
        Invoice::create(['id' => (string) \Illuminate\Support\Str::uuid(), 'property_id' => $property->id, 'partner_id' => $partner->id, 'issued_at' => now()]);
        Invoice::create(['id' => (string) \Illuminate\Support\Str::uuid(), 'property_id' => $property->id, 'partner_id' => $partner->id, 'issued_at' => now()]);

        $service = $this->createMock(\App\Services\InvoiceService::class);
        $controller = new \App\Http\Controllers\Api\InvoiceController($service);

        $request = new Request();
        $request->attributes->set('property_id', (string) $property->id);

        $resp = $controller->index($request);

        $this->assertEquals(200, $resp->getStatusCode());
        $data = $resp->getData(true);
        $this->assertArrayHasKey('data', $data);
    }

    public function test_store_calls_service_and_returns_201()
    {
        $property = Property::create(['name' => 'P2', 'timezone' => 'UTC']);

        $payload = [
            'partner_id' => '00000000-0000-0000-0000-000000000000',
            'lines' => [
                ['description' => 'L1', 'unit_price' => 100],
            ],
        ];

        $partner = Partner::create(['name' => 'PS']);

        $mockService = $this->createMock(\App\Services\InvoiceService::class);
        $mockService->expects($this->once())
            ->method('createInvoice')
            ->with($this->isType('array'))
            ->willReturn(Invoice::create(['id' => (string) \Illuminate\Support\Str::uuid(), 'property_id' => $property->id, 'partner_id' => $partner->id]));

        $controller = new \App\Http\Controllers\Api\InvoiceController($mockService);

        $req = new class($payload) extends Request {
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

        // ensure getPropertyId fallback works
        $req->attributes->set('property_id', (string) $property->id);

        $resp = $controller->store($req);

        $this->assertEquals(201, $resp->getStatusCode());
        $this->assertEquals('inv-1', $resp->getData(true)['id']);
    }

    public function test_show_returns_invoice_with_relations()
    {
        $partner2 = Partner::create(['name' => 'P2']);
        $invoice = Invoice::create(['id' => (string) \Illuminate\Support\Str::uuid(), 'property_id' => null, 'partner_id' => $partner2->id, 'issued_at' => now()]);

        $service = $this->createMock(\App\Services\InvoiceService::class);
        $controller = new \App\Http\Controllers\Api\InvoiceController($service);

        $resp = $controller->show($invoice);

        $this->assertEquals(200, $resp->getStatusCode());
        $this->assertEquals('inv-show', $resp->getData(true)['id']);
    }
}
