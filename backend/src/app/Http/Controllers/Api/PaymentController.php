<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\PaymentService;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    protected PaymentService $service;

    public function __construct(PaymentService $service)
    {
        $this->service = $service;
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'invoice_id' => 'required|uuid',
            'amount' => 'required|numeric',
            'method' => 'nullable|string',
            'paid_at' => 'nullable|date',
        ]);

        $payment = $this->service->createPayment($data);

        return response()->json($payment, 201);
    }
}
