<?php

namespace Tests\Unit;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Services\InvoiceService;
use App\Services\PaymentService;
use App\Models\Partner;

class PaymentValidationTest extends TestCase
{
    use RefreshDatabase;

    public function test_zero_or_negative_amount_throws()
    {
        $this->expectException(\InvalidArgumentException::class);

        $partner = Partner::factory()->create();
        $invoiceService = new InvoiceService();
        $paymentService = new PaymentService();

        $invoice = $invoiceService->createInvoice([
            'partner_id' => $partner->id,
            'lines' => [ ['description' => 'Room', 'quantity' => 1, 'unit_price' => 50.0] ],
        ]);

        $paymentService->createPayment(['invoice_id' => $invoice->id, 'amount' => 0]);
    }
}
