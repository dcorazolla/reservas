<?php

namespace Tests\Unit;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Services\InvoiceService;
use App\Services\PaymentService;
use App\Models\Partner;

class PaymentServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_create_payment_and_marks_invoice_paid()
    {
        $partner = Partner::factory()->create();

        $invoiceService = new InvoiceService();
        $paymentService = new PaymentService();

        $invoice = $invoiceService->createInvoice([
            'partner_id' => $partner->id,
            'lines' => [
                ['description' => 'Room', 'quantity' => 1, 'unit_price' => 200.0],
            ],
        ]);

        $payment = $paymentService->createPayment([
            'invoice_id' => $invoice->id,
            'amount' => 200.0,
            'method' => 'card',
        ]);

        $this->assertDatabaseHas('payments', ['id' => $payment->id, 'amount' => 200.0]);
        $this->assertDatabaseHas('financial_audit_logs', ['event_type' => 'payment.created', 'resource_type' => 'payment', 'resource_id' => $payment->id]);
        $this->assertEquals('paid', $invoice->fresh()->status);
    }
}
