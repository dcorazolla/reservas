<?php

namespace Tests\Unit;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Services\InvoiceService;
use App\Services\PaymentService;
use App\Models\Partner;

class MultiplePaymentsTest extends TestCase
{
    use RefreshDatabase;

    public function test_multiple_payments_accumulate_and_mark_invoice_paid()
    {
        $partner = Partner::factory()->create();

        $invoiceService = new InvoiceService();
        $paymentService = new PaymentService();

        $invoice = $invoiceService->createInvoice([
            'partner_id' => $partner->id,
            'lines' => [
                ['description' => 'A', 'quantity' => 1, 'unit_price' => 150.0],
                ['description' => 'B', 'quantity' => 1, 'unit_price' => 150.0],
            ],
        ]);

        $p1 = $paymentService->createPayment(['invoice_id' => $invoice->id, 'amount' => 100.0]);
        $this->assertEquals('draft', $invoice->fresh()->status);

        $p2 = $paymentService->createPayment(['invoice_id' => $invoice->id, 'amount' => 200.0]);

        $this->assertEquals('paid', $invoice->fresh()->status);
        $this->assertDatabaseHas('invoice_line_payments', ['payment_id' => $p1->id]);
        $this->assertDatabaseHas('invoice_line_payments', ['payment_id' => $p2->id]);
    }
}
