<?php

namespace App\Services;

use App\Models\Invoice;
use App\Models\InvoiceLine;
use App\Models\FinancialAuditLog;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class InvoiceService
{
    public function createInvoice(array $data): Invoice
    {
        return DB::transaction(function () use ($data) {
            $lines = Arr::get($data, 'lines', []);

            $invoice = Invoice::create([
                'id' => (string) Str::uuid(),
                'partner_id' => $data['partner_id'] ?? (isset($data['partner']) ? $data['partner']->id : null),
                'property_id' => $data['property_id'] ?? null,
                'number' => $data['number'] ?? null,
                'issued_at' => $data['issued_at'] ?? now(),
                'due_at' => $data['due_at'] ?? null,
                'total' => 0,
                'status' => $data['status'] ?? 'draft',
            ]);

            // Refresh to pick up DB-generated defaults (e.g. UUIDs set by DB)
            $invoice = $invoice->fresh();

            $total = 0;
            foreach ($lines as $l) {
                $line = InvoiceLine::create([
                    'invoice_id' => $invoice->id,
                    'description' => $l['description'],
                    'quantity' => $l['quantity'] ?? 1,
                    'unit_price' => $l['unit_price'],
                    'line_total' => ($l['quantity'] ?? 1) * $l['unit_price'],
                ]);
                $total += $line->line_total;
            }

            $invoice->total = $total;
            $invoice->save();

            FinancialAuditLog::create([
                'event_type' => 'invoice.created',
                'payload' => ['invoice_id' => $invoice->id, 'total' => $invoice->total],
                'resource_type' => 'invoice',
                'resource_id' => $invoice->id,
            ]);

            return $invoice->fresh();
        });
    }
}
