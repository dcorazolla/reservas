<?php

namespace Tests\Unit;

use Tests\TestCase;
use Illuminate\Support\Str;

class ModelInvoiceLinePaymentTest extends TestCase
{
    public function test_invoice_line_payment_relations()
    {
        $partner = \App\Models\Partner::create(['id' => Str::uuid()->toString(), 'name' => 'P']);
        $property = \App\Models\Property::create(['id' => Str::uuid()->toString(), 'name' => 'Prop']);

        $invoice = \App\Models\Invoice::create([
            'id' => Str::uuid()->toString(),
            'partner_id' => $partner->id,
            'property_id' => $property->id,
            'number' => '1',
            'issued_at' => now()->toDateString(),
            'due_at' => now()->toDateString(),
            'total' => 100,
            'status' => 'draft',
        ]);

        $line = \App\Models\InvoiceLine::create([
            'id' => Str::uuid()->toString(),
            'invoice_id' => $invoice->id,
            'description' => 'L',
            'quantity' => 1,
            'unit_price' => 100,
            'line_total' => 100,
        ]);

        $payment = \App\Models\Payment::create([
            'id' => Str::uuid()->toString(),
            'partner_id' => $partner->id,
            'amount' => 100,
            'method' => 'cash',
            'paid_at' => now()->toDateString(),
        ]);

        $alloc = \App\Models\InvoiceLinePayment::create([
            'id' => Str::uuid()->toString(),
            'payment_id' => $payment->id,
            'invoice_line_id' => $line->id,
            'amount' => 100,
        ]);

        $this->assertInstanceOf(\App\Models\Payment::class, $alloc->payment);
        $this->assertInstanceOf(\App\Models\InvoiceLine::class, $alloc->invoiceLine);
    }
}
