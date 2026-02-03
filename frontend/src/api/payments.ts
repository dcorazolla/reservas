import { apiFetch } from './client';

export function createPayment(invoiceId: string, payload: { amount: number; method?: string; paid_at?: string; external_id?: string; notes?: string }) {
  return apiFetch(`/invoices/${invoiceId}/payments`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
