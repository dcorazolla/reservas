<?php

namespace Tests\Unit;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Services\InvoiceService;
use App\Services\PaymentService;
use App\Models\Partner;
use App\Models\InvoiceLinePayment;

class PaymentAllocationTest extends TestCase
{
    use RefreshDatabase;

    public function test_partial_payment_allocates_to_lines()
    {
        $partner = Partner::factory()->create();

        $invoiceService = new InvoiceService();
        $paymentService = new PaymentService();

        $invoice = $invoiceService->createInvoice([
            'partner_id' => $partner->id,
            'lines' => [
                ['description' => 'Line A', 'quantity' => 1, 'unit_price' => 100.0],
                ['description' => 'Line B', 'quantity' => 1, 'unit_price' => 100.0],
            ],
        ]);

        $payment = $paymentService->createPayment([
            'invoice_id' => $invoice->id,
            'amount' => 150.0,
            'method' => 'card',
        ]);

        $this->assertDatabaseHas('payments', ['id' => $payment->id, 'amount' => 150.0]);

        $allocations = InvoiceLinePayment::where('payment_id', $payment->id)->get();
        $this->assertCount(2, $allocations);
        $this->assertEquals(100.0, (float) $allocations[0]->amount);
        $this->assertEquals(50.0, (float) $allocations[1]->amount);

        $this->assertNotEquals('paid', $invoice->fresh()->status);
    }
}
