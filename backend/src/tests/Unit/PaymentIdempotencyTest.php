<?php

namespace Tests\Unit;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Services\InvoiceService;
use App\Services\PaymentService;
use App\Models\Partner;

class PaymentIdempotencyTest extends TestCase
{
    use RefreshDatabase;

    public function test_duplicate_external_id_returns_same_payment()
    {
        $partner = Partner::factory()->create();

        $invoiceService = new InvoiceService();
        $paymentService = new PaymentService();

        $invoice = $invoiceService->createInvoice([
            'partner_id' => $partner->id,
            'lines' => [ ['description' => 'Room', 'quantity' => 1, 'unit_price' => 100.0] ],
        ]);

        $payload = ['invoice_id' => $invoice->id, 'amount' => 100.0, 'external_id' => 'ext-123'];

        $p1 = $paymentService->createPayment($payload);
        $p2 = $paymentService->createPayment($payload);

        $this->assertEquals($p1->id, $p2->id);
        $this->assertCount(1, \DB::table('payments')->where('external_id', 'ext-123')->get());
    }
}
