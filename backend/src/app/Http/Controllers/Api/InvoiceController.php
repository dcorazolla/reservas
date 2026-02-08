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
        // Eager-load partner and allocations (payments) so frontend can show
        // payment history and allocation per line without extra requests.
        $invoice->load('partner', 'lines.allocations.payment');

        // Calculate total paid by summing allocations
        $lineIds = $invoice->lines->pluck('id')->all();
        $paid = 0;
        if (!empty($lineIds)) {
            $paid = (float) \App\Models\InvoiceLinePayment::whereIn('invoice_line_id', $lineIds)->sum('amount');
        }

        $payload = $invoice->toArray();
        $payload['paid_amount'] = $paid;
        $payload['balance'] = (float) $invoice->total - $paid;

        return response()->json($payload);
    }

    public function update(Request $request, Invoice $invoice)
    {
        $data = $request->validate([
            'partner_id' => 'nullable|uuid',
            'number' => 'nullable|string',
            'issued_at' => 'nullable|date',
            'due_at' => 'nullable|date',
            'status' => 'nullable|in:draft,issued,paid,cancelled',
        ]);

        $updated = $this->service->updateInvoice($invoice, $data);

        return response()->json($updated);
    }

    public function cancel(Request $request, Invoice $invoice)
    {
        // For now cancellation is a status flip; payments are not modified.
        $updated = $this->service->cancelInvoice($invoice);

        return response()->json($updated);
    }

    public function createFromReservations(Request $request)
    {
        $data = $request->validate([
            'partner_id' => 'required|uuid',
            'reservation_ids' => 'required|array',
            'reservation_ids.*' => 'required|uuid',
            'property_id' => 'nullable|uuid',
            'issued_at' => 'nullable|date',
            'due_at' => 'nullable|date',
        ]);

        $reservationIds = $data['reservation_ids'];

        $reservations = \App\Models\Reservation::whereIn('id', $reservationIds)->get();

        // Ensure all reservations exist
        if ($reservations->count() !== count($reservationIds)) {
            return response()->json(['error' => 'Algumas reservas não foram encontradas.'], 422);
        }

        // Ensure reservations belong to the partner (safety) - if not, reject
        $mismatch = $reservations->first(fn($r) => ($r->partner_id ?? null) !== $data['partner_id']);
        if ($mismatch) {
            return response()->json(['error' => 'Todas as reservas devem pertencer ao parceiro informado.'], 422);
        }

        // Build invoice lines from reservations
        $lines = $reservations->map(function ($r) {
            $roomName = $r->room?->name ?? $r->room_id;
            $desc = sprintf('Reserva %s - %s (Quarto %s)', $r->start_date->toDateString(), $r->end_date->toDateString(), $roomName);
            return [
                'description' => $desc,
                'quantity' => 1,
                'unit_price' => (float) $r->total_value,
            ];
        })->all();

        // Create invoice via service
        try {
            $invoice = $this->service->createInvoice([
                'partner_id' => $data['partner_id'],
                'property_id' => $data['property_id'] ?? $this->getPropertyId($request),
                'issued_at' => $data['issued_at'] ?? now(),
                'due_at' => $data['due_at'] ?? null,
                'lines' => $lines,
                'status' => 'issued',
            ]);
        } catch (\Throwable $e) {
            \App\Models\FinancialAuditLog::create([
                'event_type' => 'invoice.creation_failed',
                'payload' => ['error' => $e->getMessage(), 'reservation_ids' => $reservationIds],
                'resource_type' => 'reservation_batch',
                'resource_id' => null,
            ]);
            return response()->json(['error' => 'Falha ao criar fatura: ' . $e->getMessage()], 500);
        }

        // Link reservations to invoice
        foreach ($reservations as $r) {
            $r->invoice_id = $invoice->id;
            $r->save();

            \App\Models\FinancialAuditLog::create([
                'event_type' => 'reservation.invoiced',
                'payload' => ['reservation_id' => $r->id, 'invoice_id' => $invoice->id],
                'resource_type' => 'reservation',
                'resource_id' => $r->id,
            ]);
        }

        return response()->json($invoice, 201);
    }
}
