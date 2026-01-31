<?php

namespace Tests\Unit;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Services\InvoiceService;
use App\Models\Partner;

class InvoiceServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_create_invoice_with_lines_and_audit()
    {
        $partner = Partner::factory()->create();

        $service = new InvoiceService();

        $data = [
            'partner_id' => $partner->id,
            'lines' => [
                ['description' => 'Room charge', 'quantity' => 1, 'unit_price' => 150.0],
            ],
        ];

        $invoice = $service->createInvoice($data);

        $this->assertDatabaseHas('invoices', ['id' => $invoice->id, 'total' => 150.0]);
        $this->assertDatabaseHas('invoice_lines', ['invoice_id' => $invoice->id, 'line_total' => 150.0]);
        $this->assertDatabaseHas('financial_audit_logs', ['event_type' => 'invoice.created', 'resource_type' => 'invoice', 'resource_id' => $invoice->id]);
    }
}
