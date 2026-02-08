<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\Partner;

class InvoicePaymentAuditTest extends TestCase
{
    use RefreshDatabase;

    public function test_invoice_and_payment_create_financial_audit_entries_transactionally()
    {
        $this->withoutMiddleware();

        $partner = Partner::factory()->create();

        $payload = [
            'partner_id' => $partner->id,
            'lines' => [
                ['description' => 'Room', 'quantity' => 1, 'unit_price' => 100.0]
            ],
        ];

        $invResp = $this->postJson('/api/invoices', $payload);
        $invResp->assertStatus(201);

        $invoiceId = $invResp->json('data.id') ?? $invResp->json('id');
        $this->assertNotEmpty($invoiceId);

        $this->assertDatabaseHas('invoices', ['id' => $invoiceId]);

        $this->assertDatabaseHas('financial_audit_logs', [
            'event_type' => 'invoice.created',
            'resource_type' => 'invoice',
            'resource_id' => $invoiceId,
        ]);

        $paymentPayload = ['amount' => 100.0, 'method' => 'card'];

        $payResp = $this->postJson("/api/invoices/{$invoiceId}/payments", $paymentPayload);
        $payResp->assertStatus(201);

        $paymentId = $payResp->json('data.id') ?? $payResp->json('id');
        $this->assertNotEmpty($paymentId);

        $this->assertDatabaseHas('payments', ['id' => $paymentId]);

        $this->assertDatabaseHas('financial_audit_logs', [
            'event_type' => 'payment.created',
            'resource_type' => 'payment',
            'resource_id' => $paymentId,
        ]);

        $this->assertDatabaseHas('invoices', ['id' => $invoiceId, 'status' => 'paid']);
    }
}
