<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\PaymentService;
use Illuminate\Http\Request;
use App\Models\Invoice;

class PaymentController extends Controller
{
    protected PaymentService $service;

    public function __construct(PaymentService $service)
    {
        $this->service = $service;
    }

    public function store(Request $request, string $invoice_id)
    {
        $data = $request->validate([
            'amount' => 'required|numeric',
            'method' => 'nullable|string',
            'paid_at' => 'nullable|date',
            'external_id' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        // Ensure invoice_id is present for the service
        $data['invoice_id'] = $invoice_id;

        $payment = $this->service->createPayment($data);

        return response()->json($payment, 201);
    }
}
