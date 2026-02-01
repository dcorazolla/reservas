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

    public function index(Request $request)
    {
        $propertyId = $this->getPropertyId($request);
        $perPage = (int) $request->query('per_page', 15);

        $query = Invoice::with('lines')
            ->where('property_id', $propertyId)
            ->orderBy('issued_at', 'desc');

        return response()->json($query->paginate($perPage));
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

        // Ensure the invoice gets a property context when available so subsequent
        // operations (payments, allocations) can correctly scope resources.
        try {
            if (empty($data['property_id'])) {
                $data['property_id'] = $this->getPropertyId($request);
            }
        } catch (\Symfony\Component\HttpKernel\Exception\BadRequestHttpException $e) {
            // No property context available; proceed without setting it.
        }

        $invoice = $this->service->createInvoice($data);

        return response()->json($invoice, 201);
    }

    public function show(Invoice $invoice)
    {
        return response()->json($invoice->load('lines'));
    }
}
