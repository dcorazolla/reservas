<?php

namespace Tests\Unit;

use Tests\TestCase;
use Illuminate\Support\Str;
use App\Models\Payment;
use App\Models\Partner;
use App\Models\Property;
use App\Models\InvoiceLinePayment;
use Illuminate\Support\Collection;

class ModelRelationsTest extends TestCase
{
    public function test_payment_model_can_be_created_and_relations_resolve()
    {
        $property = Property::create(['id' => Str::uuid()->toString(), 'name' => 'P-m', 'timezone' => 'UTC']);
        $partner = Partner::create(['id' => Str::uuid()->toString(), 'name' => 'PM']);

        $payment = Payment::create(['id' => Str::uuid()->toString(), 'external_id' => 'x1', 'partner_id' => $partner->id, 'amount' => 10, 'method' => 'cash']);

        $this->assertEquals($partner->id, $payment->partner->id);
        $this->assertInstanceOf(Collection::class, $payment->allocations()->get());
    }

    public function test_invoice_line_payment_model_relations()
    {
        $property = Property::create(['id' => Str::uuid()->toString(), 'name' => 'P-ilp', 'timezone' => 'UTC']);
        $partner = Partner::create(['id' => Str::uuid()->toString(), 'name' => 'PILP']);

        $invoice = \App\Models\Invoice::create(['id' => Str::uuid()->toString(), 'partner_id' => $partner->id, 'property_id' => $property->id, 'number' => 'ILP-1', 'total' => 10, 'status' => 'open']);

        $line = \App\Models\InvoiceLine::create(['invoice_id' => $invoice->id, 'description' => 'X', 'quantity' => 1, 'unit_price' => 10, 'line_total' => 10]);

        $payment = Payment::create(['id' => Str::uuid()->toString(), 'amount' => 5, 'method' => 'cash']);

        $ilp = InvoiceLinePayment::create(['id' => Str::uuid()->toString(), 'payment_id' => $payment->id, 'invoice_line_id' => $line->id, 'amount' => 5]);

        $this->assertEquals($payment->id, $ilp->payment->id);
        $this->assertEquals($ilp->payment_id, $ilp->payment->id);
    }
}
