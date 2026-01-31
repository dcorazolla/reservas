<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\InvoiceService;
use Illuminate\Http\Request;
use App\Models\Invoice;

class InvoiceController extends Controller
{
    protected InvoiceService $service;

    public function __construct(InvoiceService $service)
    {
        $this->service = $service;
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'partner_id' => 'required|uuid',
            'property_id' => 'nullable|uuid',
            'number' => 'nullable|string',
            'issued_at' => 'nullable|date',
            'due_at' => 'nullable|date',
            'lines' => 'array|required',
            'lines.*.description' => 'required|string',
            'lines.*.quantity' => 'nullable|numeric',
            'lines.*.unit_price' => 'required|numeric',
        ]);

        $invoice = $this->service->createInvoice($data);

        return response()->json($invoice, 201);
    }

    public function show(Invoice $invoice)
    {
        return response()->json($invoice->load('lines','payments'));
    }
}
