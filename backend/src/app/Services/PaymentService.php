<?php

namespace App\Services;

use App\Models\Payment;
use App\Models\Invoice;
use App\Models\FinancialAuditLog;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Models\InvoiceLinePayment;

class PaymentService
{
    /**
     * Create a payment and allocate it to the invoice.
     * Updates invoice status to 'paid' when fully paid.
     *
     * @param array $data
     * @return Payment
     */
    public function createPayment(array $data): Payment
    {
        return DB::transaction(function () use ($data) {
            $invoice = Invoice::findOrFail($data['invoice_id']);

            $payment = Payment::create([
                'id' => (string) Str::uuid(),
                'partner_id' => $invoice->partner_id ?? null,
                'amount' => $data['amount'],
                'method' => $data['method'] ?? 'unknown',
                'paid_at' => $data['paid_at'] ?? now(),
                'notes' => $data['notes'] ?? null,
            ]);

            // Allocation across invoice lines (greedy by line order).
            $remaining = $payment->amount;
            $lines = $invoice->lines()->orderBy('created_at')->get();
            foreach ($lines as $line) {
                if ($remaining <= 0) {
                    break;
                }

                $already = (float) $line->allocations()->sum('amount');
                $need = (float) $line->line_total - $already;
                if ($need <= 0) {
                    continue;
                }

                $alloc = min($remaining, $need);

                InvoiceLinePayment::create([
                    'id' => (string) Str::uuid(),
                    'payment_id' => $payment->id,
                    'invoice_line_id' => $line->id,
                    'amount' => $alloc,
                ]);

                $remaining -= $alloc;
            }

            // If total allocated equals invoice total, mark paid.
            $allocated = InvoiceLinePayment::whereIn('invoice_line_id', $invoice->lines()->pluck('id'))->sum('amount');
            if ((float) $allocated >= (float) $invoice->total) {
                $invoice->status = 'paid';
                $invoice->save();
            }

            FinancialAuditLog::create([
                'event_type' => 'payment.created',
                'payload' => ['invoice_id' => $invoice->id, 'payment_id' => $payment->id, 'amount' => $payment->amount],
                'resource_type' => 'payment',
                'resource_id' => $payment->id,
            ]);

            return $payment->fresh();
        });
    }
}
