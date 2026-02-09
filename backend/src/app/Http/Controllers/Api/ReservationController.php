<?php

namespace App\Http\Controllers\Api;

use App\Models\Reservation;
use App\Http\Controllers\Api\BaseApiController;
use App\Http\Resources\ReservationResource;
use App\Services\CreateReservationService;
use App\Services\ReservationPriceCalculator;
use App\Services\ReservationService;
use App\Services\InvoiceService;
use App\Models\FinancialAuditLog;
use App\Models\Invoice;
use App\Models\InvoiceLine;
use Illuminate\Http\Request;

class ReservationController extends BaseApiController
{
    public function store(Request $request, CreateReservationService $service, ?InvoiceService $invoices = null)
    {

        $data = $request->validate([
            'room_id'        => 'required|exists:rooms,id',
            'partner_id'     => 'sometimes|nullable|uuid|exists:partners,id',
            'guest_name'     => 'required|string|max:255',
            'email'          => 'nullable|email',
            'phone'          => 'nullable|string',
            'adults_count'   => 'required|integer|min:1',
            'children_count' => 'required|integer|min:0',
            'infants_count'  => 'nullable|integer|min:0',
            'start_date'     => 'required|date',
            'end_date'       => 'required|date',
            'notes'          => 'nullable|string',
            'price_override' => 'sometimes|nullable|numeric|min:0',
        ]);

        // Manually enforce end_date > start_date using a safe parse to avoid
        // DateMalformedStringException in some environments when using the
        // built-in 'after' validator which relies on Carbon::parse.
        try {
            $start = \Carbon\Carbon::createFromFormat('Y-m-d', $data['start_date'])->startOfDay();
        } catch (\Throwable $e) {
            $start = \Carbon\Carbon::parse($data['start_date'])->startOfDay();
        }

        try {
            $end = \Carbon\Carbon::createFromFormat('Y-m-d', $data['end_date'])->startOfDay();
        } catch (\Throwable $e) {
            $end = \Carbon\Carbon::parse($data['end_date'])->startOfDay();
        }

        if ($end <= $start) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'end_date' => ['The end date must be a date after start date.'],
            ]);
        }

        $reservation = $service->create($data);

        // If a manual price override was provided, persist it and create an invoice
        if (array_key_exists('price_override', $data) && $data['price_override'] !== null) {
            $old = $reservation->total_value;
            $reservation->total_value = $data['price_override'];
            $reservation->save();

            // Create a simple invoice representing this reservation override
            try {
                $invoices = $invoices ?? app(InvoiceService::class);

                // If reservation already has an invoice in draft, update it instead
                $existing = null;
                if ($reservation->invoice_id) {
                    $existing = Invoice::find($reservation->invoice_id);
                }

                if ($existing && $existing->status === 'draft') {
                    // Replace invoice lines and totals to reflect override
                    $existing->lines()->delete();
                    $line = InvoiceLine::create([
                        'invoice_id' => $existing->id,
                        'description' => sprintf('Reserva %s', $reservation->id),
                        'quantity' => 1,
                        'unit_price' => (float) $reservation->total_value,
                        'line_total' => (float) $reservation->total_value,
                    ]);
                    $existing->total = (float) $line->line_total;
                    $existing->save();
                    $invoice = $existing;
                    FinancialAuditLog::create([
                        'event_type' => 'invoice.updated_from_reservation_override',
                        'payload' => ['reservation_id' => $reservation->id, 'invoice_id' => $invoice->id],
                        'resource_type' => 'reservation',
                        'resource_id' => $reservation->id,
                    ]);
                } else {
                    $invoice = $invoices->createInvoice([
                        'partner_id' => $reservation->partner_id,
                        'lines' => [
                            [
                                'description' => sprintf('Reserva %s', $reservation->id),
                                'quantity' => 1,
                                'unit_price' => (float) $reservation->total_value,
                            ],
                        ],
                        'status' => 'draft',
                    ]);
                    if (isset($invoice) && $invoice && $invoice->id) {
                        $reservation->invoice_id = $invoice->id;
                        $reservation->save();
                    }
                }
            } catch (\Throwable $e) {
                FinancialAuditLog::create([
                    'event_type' => 'reservation.invoice_creation_failed',
                    'payload' => ['reservation_id' => $reservation->id, 'error' => $e->getMessage()],
                    'resource_type' => 'reservation',
                    'resource_id' => $reservation->id,
                ]);
            }

            FinancialAuditLog::create([
                'event_type' => 'reservation.price_overridden',
                'payload' => ['reservation_id' => $reservation->id, 'old' => (float)$old, 'new' => (float)$reservation->total_value],
                'resource_type' => 'reservation',
                'resource_id' => $reservation->id,
            ]);
        }

        return $this->created(new ReservationResource($reservation));
    }

    public function update(
        Request $request,
        Reservation $reservation,
        ReservationPriceCalculator $calculator,
        ReservationService $service,
        ?InvoiceService $invoices = null
    ) {
        $data = $request->validate([
            'guest_name'     => 'sometimes|required|string|max:255',
            'partner_id'     => 'sometimes|nullable|uuid|exists:partners,id',
            'email'          => 'sometimes|nullable|email',
            'phone'          => 'sometimes|nullable|string',
            'people_count'   => 'sometimes|integer|min:1',
            'adults_count'   => 'sometimes|integer|min:1',
            'children_count' => 'sometimes|integer|min:0',
            'infants_count'  => 'sometimes|integer|min:0',
            'start_date'     => 'sometimes|date',
            'end_date'       => 'sometimes|date',
            'status'         => 'sometimes|string',
            'notes'          => 'sometimes|nullable|string',
            'price_override' => 'sometimes|nullable|numeric|min:0',
        ]);

        // If both dates are provided, validate ordering similarly to store().
        if (array_key_exists('start_date', $data) && array_key_exists('end_date', $data)) {
            try {
                $start = \Carbon\Carbon::createFromFormat('Y-m-d', $data['start_date'])->startOfDay();
            } catch (\Throwable $e) {
                $start = \Carbon\Carbon::parse($data['start_date'])->startOfDay();
            }

            try {
                $end = \Carbon\Carbon::createFromFormat('Y-m-d', $data['end_date'])->startOfDay();
            } catch (\Throwable $e) {
                $end = \Carbon\Carbon::parse($data['end_date'])->startOfDay();
            }

            if ($end <= $start) {
                throw \Illuminate\Validation\ValidationException::withMessages([
                    'end_date' => ['The end date must be a date after start date.'],
                ]);
            }
        }

        $room = $reservation->room;

        $start = $data['start_date'] ?? optional($reservation->start_date)->toDateString();
        $end   = $data['end_date'] ?? optional($reservation->end_date)->toDateString();

        // Derive counts
        $adults   = $data['adults_count'] ?? null;
        $children = $data['children_count'] ?? null;
        $infants  = $data['infants_count'] ?? $reservation->infants_count ?? 0;

        if ($adults === null && array_key_exists('people_count', $data)) {
            $adults = (int) $data['people_count'];
            $children = $children ?? 0;
        }

        $adults   = $adults   ?? $reservation->adults_count ?? 1;
        $children = $children ?? $reservation->children_count ?? 0;

        // Recalculate total using the backend engine
        $calc = $calculator->calculateDetailed($room, $start, $end, (int)$adults, (int)$children, (int)$infants);

        $update = [
            'partner_id'     => array_key_exists('partner_id', $data) ? $data['partner_id'] : $reservation->partner_id,
            'guest_name'     => $data['guest_name']     ?? $reservation->guest_name,
            'email'          => array_key_exists('email', $data) ? $data['email'] : $reservation->email,
            'phone'          => array_key_exists('phone', $data) ? $data['phone'] : $reservation->phone,
            'start_date'     => $start,
            'end_date'       => $end,
            'status'         => $data['status']         ?? $reservation->status,
            'notes'          => array_key_exists('notes', $data) ? $data['notes'] : $reservation->notes,
            'adults_count'   => (int) $adults,
            'children_count' => (int) $children,
            'infants_count'  => (int) $infants,
            'total_value'    => $calc['total'],
        ];

        // Apply price override if present
        if (array_key_exists('price_override', $data) && $data['price_override'] !== null) {
            $update['total_value'] = $data['price_override'];
        }

        $updated = $service->update($reservation, $update);

        // If there was a price override, create/update an invoice and write an audit entry
        if (array_key_exists('price_override', $data) && $data['price_override'] !== null) {
            $old = $reservation->total_value;
            try {
                $invoices = $invoices ?? app(InvoiceService::class);

                // Avoid creating duplicate invoices: update existing draft invoice if present
                $existing = null;
                if ($updated->invoice_id) {
                    $existing = Invoice::find($updated->invoice_id);
                }

                if ($existing && $existing->status === 'draft') {
                    $existing->lines()->delete();
                    $line = InvoiceLine::create([
                        'invoice_id' => $existing->id,
                        'description' => sprintf('Reserva %s (ajuste)', $updated->id),
                        'quantity' => 1,
                        'unit_price' => (float) $updated->total_value,
                        'line_total' => (float) $updated->total_value,
                    ]);
                    $existing->total = (float) $line->line_total;
                    $existing->save();
                    $invoice = $existing;
                    FinancialAuditLog::create([
                        'event_type' => 'invoice.updated_from_reservation_override',
                        'payload' => ['reservation_id' => $updated->id, 'invoice_id' => $invoice->id],
                        'resource_type' => 'reservation',
                        'resource_id' => $updated->id,
                    ]);
                } else {
                    $invoice = $invoices->createInvoice([
                        'partner_id' => $updated->partner_id,
                        'lines' => [
                            [
                                'description' => sprintf('Reserva %s (ajuste)', $updated->id),
                                'quantity' => 1,
                                'unit_price' => (float) $updated->total_value,
                            ],
                        ],
                        'status' => 'draft',
                    ]);
                    if (isset($invoice) && $invoice && $invoice->id) {
                        $updated->invoice_id = $invoice->id;
                        $updated->save();
                    }
                }
            } catch (\Throwable $e) {
                FinancialAuditLog::create([
                    'event_type' => 'reservation.invoice_creation_failed',
                    'payload' => ['reservation_id' => $updated->id, 'error' => $e->getMessage()],
                    'resource_type' => 'reservation',
                    'resource_id' => $updated->id,
                ]);
            }

            FinancialAuditLog::create([
                'event_type' => 'reservation.price_overridden',
                'payload' => ['reservation_id' => $updated->id, 'old' => (float)$old, 'new' => (float)$updated->total_value],
                'resource_type' => 'reservation',
                'resource_id' => $updated->id,
            ]);
        }

        return $this->ok(new ReservationResource($updated));
    }

    public function show(Reservation $reservation)
    {
        $reservation->loadMissing('partner');

        return $this->ok(new ReservationResource($reservation));
    }

    public function index(Request $request)
    {
        $propertyId = $this->getPropertyId($request);

        // Accept either `start_date`/`end_date` or `from`/`to` for compatibility
        $data = $request->validate([
            'start_date' => 'sometimes|date',
            'end_date' => 'sometimes|date',
            'from' => 'sometimes|date',
            'to' => 'sometimes|date',
        ]);

        $startParam = $data['start_date'] ?? $data['from'] ?? $request->query('start_date') ?? $request->query('from');
        $endParam = $data['end_date'] ?? $data['to'] ?? $request->query('end_date') ?? $request->query('to');

        if (!$startParam || !$endParam) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'start_date' => ['start_date (or from) and end_date (or to) are required'],
            ]);
        }

        try {
            $start = \Carbon\Carbon::createFromFormat('Y-m-d', $startParam)->startOfDay();
        } catch (\Throwable $e) {
            $start = \Carbon\Carbon::parse($startParam)->startOfDay();
        }

        try {
            $end = \Carbon\Carbon::createFromFormat('Y-m-d', $endParam)->endOfDay();
        } catch (\Throwable $e) {
            $end = \Carbon\Carbon::parse($endParam)->endOfDay();
        }

        $query = Reservation::whereHas('room', function ($q) use ($propertyId) {
            $q->where('property_id', $propertyId);
        });

        // Apply date overlap filter
        $query->where('start_date', '<', $end->toDateString())
              ->where('end_date', '>', $start->toDateString());

        // Optional: filter only billable reservations (checked-out)
        if ($request->query('billable') !== null) {
            $billable = filter_var($request->query('billable'), FILTER_VALIDATE_BOOLEAN);
            if ($billable) {
                $query->where('status', 'checked_out');
            }
        }

        $reservations = $query->with('partner')->get();

        return $this->ok(ReservationResource::collection($reservations));
    }

    public function checkin(Request $request, Reservation $reservation)
    {
        $reservation->status = 'checked_in';
        $reservation->save();

        FinancialAuditLog::create([
            'event_type' => 'reservation.checkin',
            'payload' => ['reservation_id' => $reservation->id, 'user_id' => $request->user()?->id ?? null],
            'resource_type' => 'reservation',
            'resource_id' => $reservation->id,
        ]);

        return $this->ok(new ReservationResource($reservation));
    }

    public function checkout(Request $request, Reservation $reservation, InvoiceService $invoices)
    {
        // Sum minibar consumptions for this reservation
        $minibarTotal = \App\Models\MinibarConsumption::where('reservation_id', $reservation->id)->sum('total');

        // Compute lodging unpaid amount based on linked invoice (if exists)
        $lodgingUnpaid = 0;
        if ($reservation->invoice_id) {
            $invoice = \App\Models\Invoice::find($reservation->invoice_id);
            if ($invoice) {
                $paid = (float) \App\Models\InvoiceLinePayment::whereIn('invoice_line_id', $invoice->lines()->pluck('id'))->sum('amount');
                $lodgingUnpaid = max(0, (float)$invoice->total - $paid);
            } else {
                // No invoice found but reservation points to one: treat as unpaid
                $lodgingUnpaid = (float)$reservation->total_value;
            }
        } else {
            // No invoice linked: assume lodging unpaid unless partner pays
            $lodgingUnpaid = (float)$reservation->total_value;
        }

        // If reservation has a partner, treat lodging as partner responsibility (do not block checkout for lodging unpaid)
        $partnerPays = (bool) $reservation->partner_id;

        $guestDue = 0.0;
        if (!$partnerPays) {
            // guest is responsible for lodging and minibar
            $guestDue += $lodgingUnpaid;
            $guestDue += (float)$minibarTotal;
        } else {
            // partner pays lodging; allow checkout to proceed and handle minibar invoicing separately
            $guestDue = 0.0;
        }

        // Allow forcing checkout with `force=1` param if user has permission `force_checkout`
        $force = filter_var($request->query('force', false), FILTER_VALIDATE_BOOLEAN);
        $user = $request->user();
        $canForce = $user && $user->can('force_checkout');

        if ($guestDue > 0 && !($force && $canForce)) {
            return response()->json([
                'message' => 'Checkout bloqueado: existem valores pendentes',
                'details' => [
                    'lodging_unpaid' => $lodgingUnpaid,
                    'minibar_total' => $minibarTotal,
                ],
            ], 422);
        }

        // Create minibar invoice for guest if there are consumptions
        if ((float)$minibarTotal > 0) {
            // Idempotency: check if a minibar invoice was already created for this reservation
            $already = \App\Models\FinancialAuditLog::where('event_type', 'reservation.minibar_invoice_created')
                ->where('resource_type', 'reservation')
                ->where('resource_id', $reservation->id)
                ->exists();

            if ($already) {
                // Already created — write an audit note and skip creating a duplicate invoice
                FinancialAuditLog::create([
                    'event_type' => 'reservation.minibar_invoice_skipped_duplicate',
                    'payload' => ['reservation_id' => $reservation->id],
                    'resource_type' => 'reservation',
                    'resource_id' => $reservation->id,
                ]);
            } else {
                try {
                    $invoice = $invoices->createInvoice([
                        'partner_id' => null,
                        'lines' => \App\Models\MinibarConsumption::where('reservation_id', $reservation->id)->get()->map(function ($c) {
                            return [
                                'description' => $c->description ?? sprintf('Frigobar - %s', $c->product_id ?? $c->id),
                                'quantity' => (int)$c->quantity,
                                'unit_price' => (float)$c->unit_price,
                            ];
                        })->toArray(),
                        'status' => 'draft',
                    ]);

                    FinancialAuditLog::create([
                        'event_type' => 'reservation.minibar_invoice_created',
                        'payload' => ['reservation_id' => $reservation->id, 'invoice_id' => $invoice->id ?? null],
                        'resource_type' => 'reservation',
                        'resource_id' => $reservation->id,
                    ]);
                } catch (\Throwable $e) {
                    FinancialAuditLog::create([
                        'event_type' => 'reservation.minibar_invoice_failed',
                        'payload' => ['reservation_id' => $reservation->id, 'error' => $e->getMessage()],
                        'resource_type' => 'reservation',
                        'resource_id' => $reservation->id,
                    ]);
                }
            }
        }

        // Mark checked out
        $reservation->status = 'checked_out';
        $reservation->save();

        FinancialAuditLog::create([
            'event_type' => 'reservation.checkout',
            'payload' => ['reservation_id' => $reservation->id, 'user_id' => $user?->id ?? null, 'forced' => $force && $canForce],
            'resource_type' => 'reservation',
            'resource_id' => $reservation->id,
        ]);

        if ($force && $canForce && $guestDue > 0) {
            FinancialAuditLog::create([
                'event_type' => 'reservation.checkout_forced',
                'payload' => ['reservation_id' => $reservation->id, 'user_id' => $user?->id ?? null, 'reason' => $request->input('reason') ?? null],
                'resource_type' => 'reservation',
                'resource_id' => $reservation->id,
            ]);
        }

        return $this->ok(new ReservationResource($reservation));
    }
}
