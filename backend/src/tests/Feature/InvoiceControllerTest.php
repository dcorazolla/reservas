<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\Partner;

class InvoiceControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_store_requires_validation()
    {
        $this->withoutMiddleware();

        $resp = $this->postJson('/api/invoices', []);

        $resp->assertStatus(422);
    }

    public function test_store_creates_invoice()
    {
        $this->withoutMiddleware();

        $partner = Partner::factory()->create();

        $payload = [
            'partner_id' => $partner->id,
            'lines' => [
                ['description' => 'Room', 'quantity' => 1, 'unit_price' => 120.0]
            ],
        ];

        $resp = $this->postJson('/api/invoices', $payload);

        $resp->assertStatus(201);
        $resp->assertJsonStructure(['id','partner_id','total']);
    }
}
