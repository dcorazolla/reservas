<?php

namespace Tests\Unit;

use Tests\TestCase;
use Illuminate\Support\Str;
use App\Models\Payment;
use App\Models\Partner;
use App\Models\Property;
use App\Models\Invoice;
use App\Models\InvoiceLine;
use App\Models\InvoiceLinePayment;
use App\Services\PaymentService;
use App\Repositories\InvoiceRepositoryInterface;

class PaymentServiceTest extends TestCase
{
    public function test_create_payment_allocates_and_marks_invoice_paid()
    {
        $property = Property::create(['id' => Str::uuid()->toString(), 'name' => 'P', 'timezone' => 'UTC']);
        $partner = Partner::create(['id' => Str::uuid()->toString(), 'name' => 'Par']);

        $invoice = Invoice::create([
            'id' => Str::uuid()->toString(),
            'partner_id' => $partner->id,
            'property_id' => $property->id,
            'number' => 'I1',
            'total' => 300,
            'status' => 'open',
        ]);

        $l1 = InvoiceLine::create(['invoice_id' => $invoice->id, 'description' => 'A', 'quantity' => 1, 'unit_price' => 100, 'line_total' => 100]);
        $l2 = InvoiceLine::create(['invoice_id' => $invoice->id, 'description' => 'B', 'quantity' => 1, 'unit_price' => 200, 'line_total' => 200]);

        $repo = $this->createMock(InvoiceRepositoryInterface::class);
        $repo->method('find')->willReturn($invoice);

        $service = new PaymentService($repo);

        $data = ['invoice_id' => $invoice->id, 'amount' => 300, 'method' => 'card'];

        $payment = $service->createPayment($data);

        $this->assertInstanceOf(Payment::class, $payment);
        $this->assertDatabaseHas('payments', ['id' => $payment->id, 'amount' => 300]);

        $this->assertDatabaseHas('invoice_line_payments', ['payment_id' => $payment->id, 'invoice_line_id' => $l1->id, 'amount' => 100]);
        $this->assertDatabaseHas('invoice_line_payments', ['payment_id' => $payment->id, 'invoice_line_id' => $l2->id, 'amount' => 200]);

        $this->assertEquals('paid', $invoice->fresh()->status);

        $this->assertDatabaseHas('financial_audit_logs', ['event_type' => 'payment.created', 'resource_type' => 'payment', 'resource_id' => $payment->id]);
    }

    public function test_create_payment_with_external_id_returns_existing()
    {
        $property = Property::create(['id' => Str::uuid()->toString(), 'name' => 'P2', 'timezone' => 'UTC']);
        $partner = Partner::create(['id' => Str::uuid()->toString(), 'name' => 'Par2']);

        $invoice = Invoice::create([
            'id' => Str::uuid()->toString(),
            'partner_id' => $partner->id,
            'property_id' => $property->id,
            'number' => 'I2',
            'total' => 50,
            'status' => 'open',
        ]);

        $existing = Payment::create(['id' => Str::uuid()->toString(), 'external_id' => 'ext-1', 'partner_id' => $partner->id, 'amount' => 50]);

        $repo = $this->createMock(InvoiceRepositoryInterface::class);
        $repo->method('find')->willReturn($invoice);

        $service = new PaymentService($repo);

        $data = ['invoice_id' => $invoice->id, 'amount' => 50, 'external_id' => 'ext-1'];

        $res = $service->createPayment($data);

        $this->assertEquals($existing->id, $res->id);
    }

    public function test_create_payment_with_invalid_amount_throws()
    {
        $this->expectException(\InvalidArgumentException::class);

        $property = Property::create(['id' => Str::uuid()->toString(), 'name' => 'P3', 'timezone' => 'UTC']);
        $partner = Partner::create(['id' => Str::uuid()->toString(), 'name' => 'Par3']);

        $invoice = Invoice::create([
            'id' => Str::uuid()->toString(),
            'partner_id' => $partner->id,
            'property_id' => $property->id,
            'number' => 'I3',
            'total' => 10,
            'status' => 'open',
        ]);

        $repo = $this->createMock(InvoiceRepositoryInterface::class);
        $repo->method('find')->willReturn($invoice);

        $service = new PaymentService($repo);

        $service->createPayment(['invoice_id' => $invoice->id, 'amount' => 0]);
    }

    public function test_create_payment_without_invoice_throws()
    {
        $this->expectException(\Illuminate\Database\Eloquent\ModelNotFoundException::class);

        $repo = $this->createMock(InvoiceRepositoryInterface::class);
        $repo->method('find')->willReturn(null);

        $service = new PaymentService($repo);

        $service->createPayment(['amount' => 10]);
    }

    public function test_resolve_invoice_id_from_invoice_object()
    {
        $property = Property::create(['id' => Str::uuid()->toString(), 'name' => 'P4', 'timezone' => 'UTC']);
        $partner = Partner::create(['id' => Str::uuid()->toString(), 'name' => 'Par4']);

        $invoice = Invoice::create([
            'id' => Str::uuid()->toString(),
            'partner_id' => $partner->id,
            'property_id' => $property->id,
            'number' => 'I4',
            'total' => 100,
            'status' => 'open',
        ]);

        $repo = $this->createMock(InvoiceRepositoryInterface::class);
        $repo->method('find')->willReturn($invoice);

        $service = new PaymentService($repo);

        $data = ['invoice' => (object) ['id' => $invoice->id], 'amount' => 100, 'method' => 'cash'];

        $payment = $service->createPayment($data);

        $this->assertInstanceOf(Payment::class, $payment);
        $this->assertEquals(100, $payment->amount);
    }

    public function test_partial_payment_does_not_mark_invoice_paid()
    {
        $property = Property::create(['id' => Str::uuid()->toString(), 'name' => 'P5', 'timezone' => 'UTC']);
        $partner = Partner::create(['id' => Str::uuid()->toString(), 'name' => 'Par5']);

        $invoice = Invoice::create([
            'id' => Str::uuid()->toString(),
            'partner_id' => $partner->id,
            'property_id' => $property->id,
            'number' => 'I5',
            'total' => 300,
            'status' => 'open',
        ]);

        $l1 = InvoiceLine::create(['invoice_id' => $invoice->id, 'description' => 'A', 'quantity' => 1, 'unit_price' => 200, 'line_total' => 200]);
        $l2 = InvoiceLine::create(['invoice_id' => $invoice->id, 'description' => 'B', 'quantity' => 1, 'unit_price' => 100, 'line_total' => 100]);

        $repo = $this->createMock(InvoiceRepositoryInterface::class);
        $repo->method('find')->willReturn($invoice);

        $service = new PaymentService($repo);

        $data = ['invoice_id' => $invoice->id, 'amount' => 150, 'method' => 'card'];

        $payment = $service->createPayment($data);

        $this->assertDatabaseHas('invoice_line_payments', ['payment_id' => $payment->id]);
        $this->assertNotEquals('paid', $invoice->fresh()->status);
    }

    public function test_resolve_invoice_id_from_request_route()
    {
        $property = Property::create(['id' => Str::uuid()->toString(), 'name' => 'P6', 'timezone' => 'UTC']);
        $partner = Partner::create(['id' => Str::uuid()->toString(), 'name' => 'Par6']);

        $invoice = Invoice::create([
            'id' => Str::uuid()->toString(),
            'partner_id' => $partner->id,
            'property_id' => $property->id,
            'number' => 'I6',
            'total' => 20,
            'status' => 'open',
        ]);

        $repo = $this->createMock(InvoiceRepositoryInterface::class);
        $repo->method('find')->willReturn($invoice);

        $request = \Illuminate\Http\Request::create('/', 'POST');
        $request->setRouteResolver(fn() => new class($invoice) {
            private $invoiceId;
            public function __construct($inv) { $this->invoiceId = $inv->id; }
            public function parameter($key = null) { if ($key === 'invoice') return (object)['id' => $this->invoiceId]; return null; }
        });
        $this->app->instance('request', $request);

        $service = new PaymentService($repo);

        $data = ['amount' => 20, 'method' => 'cash'];

        $payment = $service->createPayment($data);

        $this->assertInstanceOf(Payment::class, $payment);
        $this->assertEquals(20, $payment->amount);
    }
}

