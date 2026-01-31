<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\Partner;

class PaymentControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_store_requires_validation()
    {
        $this->withoutMiddleware();

        // create an invoice first
        $partner = Partner::factory()->create();
        $invResp = $this->postJson('/api/invoices', [
            'partner_id' => $partner->id,
            'lines' => [ ['description' => 'Room', 'quantity' => 1, 'unit_price' => 100.0] ],
        ]);
        $invoiceId = $invResp->json('id');

        $resp = $this->postJson("/api/invoices/{$invoiceId}/payments", []);

        $resp->assertStatus(422);
    }

    public function test_store_creates_payment_and_allocates()
    {
        $this->withoutMiddleware();

        $partner = Partner::factory()->create();
        $invResp = $this->postJson('/api/invoices', [
            'partner_id' => $partner->id,
            'lines' => [ ['description' => 'Room', 'quantity' => 1, 'unit_price' => 100.0] ],
        ]);
        $invoiceId = $invResp->json('id');

        $payload = [ 'invoice_id' => $invoiceId, 'amount' => 100.0, 'method' => 'card' ];

        $resp = $this->postJson("/api/invoices/{$invoiceId}/payments", $payload);

        $resp->assertStatus(201);
        $resp->assertJsonStructure(['id','amount']);

        $this->assertDatabaseHas('payments', ['amount' => 100.0]);
        $this->assertDatabaseHas('invoice_line_payments', ['amount' => 100.0]);
    }
}
