<?php

namespace Tests\Unit;

use Tests\TestCase;
use Illuminate\Http\Request;

class PaymentControllerTest extends TestCase
{
    public function test_store_validates_and_calls_service_and_returns_201()
    {
        $validated = [
            'amount' => 123.45,
            'method' => 'card',
            'paid_at' => '2026-01-01',
            'external_id' => 'ext-1',
            'notes' => 'ok',
        ];

        $payment = \App\Models\Payment::create([
            'external_id' => $validated['external_id'],
            'amount' => $validated['amount'],
            'method' => $validated['method'],
            'paid_at' => $validated['paid_at'],
            'notes' => $validated['notes'],
        ]);

        $mockService = $this->createMock(\App\Services\PaymentService::class);
        $mockService->expects($this->once())
            ->method('createPayment')
            ->with($this->callback(function($data) use ($validated) {
                // must contain invoice_id and same validated keys
                foreach ($validated as $k => $v) {
                    if (!array_key_exists($k, $data) || $data[$k] != $v) return false;
                }
                return isset($data['invoice_id']);
            }))
            ->willReturn($payment);

        $controller = new \App\Http\Controllers\Api\PaymentController($mockService);

        $request = new class extends Request {
            private $v;
            public function setValidated($v) { $this->v = $v; }
            public function validate($rules) { return $this->v; }
        };
        $request->setValidated($validated);

        $resp = $controller->store($request, 'inv-1');

        $this->assertEquals(201, $resp->getStatusCode());
        $data = json_decode($resp->getContent(), true);
        $this->assertEquals($payment->id, $data['id']);
        $this->assertEquals($payment->amount, $data['amount']);
    }
}
