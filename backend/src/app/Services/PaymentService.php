<?php

namespace App\Services;

use App\Models\Payment;
use App\Models\Invoice;
use App\Models\FinancialAuditLog;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

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

            // Simple allocation logic for Phase 1: if this payment covers the invoice, mark as paid.
            if ($payment->amount >= $invoice->total) {
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
