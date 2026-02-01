<?php

namespace App\Services;

use App\Models\Payment;
use App\Models\FinancialAuditLog;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Models\InvoiceLinePayment;
use App\Repositories\InvoiceRepositoryInterface;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class PaymentService
{
    protected InvoiceRepositoryInterface $invoices;

    public function __construct(?InvoiceRepositoryInterface $invoices = null)
    {
        $this->invoices = $invoices ?? app(InvoiceRepositoryInterface::class);
    }
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
            $invoiceId = $this->resolveInvoiceId($data);
            $invoice = $this->findInvoiceOrFail($invoiceId);

            $this->validateAmount($data);

            if (!empty($data['external_id'])) {
                $existing = Payment::where('external_id', $data['external_id'])->first();
                if ($existing) {
                    return $existing;
                }
            }

            $payment = $this->createPaymentRecord($data, $invoice);

            $this->allocateToLines($payment, $invoice);

            $this->markInvoiceIfPaid($invoice);

            $this->logAudit($payment, $invoice);

            return $payment->fresh();
        });
    }

    private function resolveInvoiceId(array $data): string
    {
        $invoiceId = $data['invoice_id'] ?? null;
        if (!$invoiceId && isset($data['invoice']) && is_object($data['invoice']) && property_exists($data['invoice'], 'id')) {
            $invoiceId = $data['invoice']->id;
        }

        if (!$invoiceId && function_exists('request')) {
            $routeInvoice = request()->route('invoice');
            if ($routeInvoice && is_object($routeInvoice) && property_exists($routeInvoice, 'id')) {
                $invoiceId = $routeInvoice->id;
            }
        }

        if (!$invoiceId) {
            throw new ModelNotFoundException('Invoice id not provided');
        }

        return (string) $invoiceId;
    }

    private function findInvoiceOrFail(string $invoiceId)
    {
        $invoice = $this->invoices->find($invoiceId);
        if (!$invoice) {
            throw new ModelNotFoundException('Invoice not found');
        }
        return $invoice;
    }

    private function validateAmount(array $data): void
    {
        if (!isset($data['amount']) || (float) $data['amount'] <= 0) {
            throw new \InvalidArgumentException('Payment amount must be greater than zero');
        }
    }

    private function createPaymentRecord(array $data, $invoice): Payment
    {
        return Payment::create([
            'id' => (string) Str::uuid(),
            'external_id' => $data['external_id'] ?? null,
            'partner_id' => $invoice->partner_id ?? null,
            'amount' => $data['amount'],
            'method' => $data['method'] ?? 'unknown',
            'paid_at' => $data['paid_at'] ?? now(),
            'notes' => $data['notes'] ?? null,
        ]);
    }

    private function allocateToLines(Payment $payment, $invoice): void
    {
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
    }

    private function markInvoiceIfPaid($invoice): void
    {
        $allocated = InvoiceLinePayment::whereIn('invoice_line_id', $invoice->lines()->pluck('id'))->sum('amount');
        if ((float) $allocated >= (float) $invoice->total) {
            $invoice->status = 'paid';
            $invoice->save();
        }
    }

    private function logAudit(Payment $payment, $invoice): void
    {
        FinancialAuditLog::create([
            'event_type' => 'payment.created',
            'payload' => ['invoice_id' => $invoice->id, 'payment_id' => $payment->id, 'amount' => $payment->amount],
            'resource_type' => 'payment',
            'resource_id' => $payment->id,
        ]);
    }
}
