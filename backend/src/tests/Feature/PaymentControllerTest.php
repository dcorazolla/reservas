<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\Partner;
use App\Models\Invoice;

class PaymentControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_store_requires_validation()
    {
        $this->withoutMiddleware();

        $partner = Partner::factory()->create();
        $invResp = $this->postJson('/api/invoices', [
            'partner_id' => $partner->id,
            'lines' => [['description' => 'Room', 'quantity' => 1, 'unit_price' => 100.0]],
        ]);
        $invResp->assertStatus(201);
        $invoiceId = $invResp->json('data.id') ?? $invResp->json('id');
        $this->assertNotEmpty($invoiceId, 'Invoice id should not be empty after creation');
        $this->assertDatabaseHas('invoices', ['id' => $invoiceId]);

        // invoice exists check
        $this->assertDatabaseHas('invoices', ['id' => $invoiceId]);

        $resp = $this->postJson("/api/invoices/{$invoiceId}/payments", []);

        $resp->assertStatus(422);
    }

    public function test_store_creates_payment_and_allocates()
    {
        $this->withoutMiddleware();

        $partner = Partner::factory()->create();
        $invResp = $this->postJson('/api/invoices', [
            'partner_id' => $partner->id,
            'lines' => [['description' => 'Room', 'quantity' => 1, 'unit_price' => 100.0]],
        ]);
        $invResp->assertStatus(201);
        $invoiceId = $invResp->json('data.id') ?? $invResp->json('id');
        $this->assertNotEmpty($invoiceId, 'Invoice id should not be empty after creation');
        $this->assertDatabaseHas('invoices', ['id' => $invoiceId]);

        $payload = ['amount' => 100.0, 'method' => 'card'];

        $resp = $this->postJson("/api/invoices/{$invoiceId}/payments", $payload);

        $resp->assertStatus(201);
        $resp->assertJsonStructure(['id','amount']);

        $this->assertDatabaseHas('payments', ['amount' => 100.0]);
        $this->assertDatabaseHas('invoice_line_payments', ['amount' => 100.0]);
    }
}
