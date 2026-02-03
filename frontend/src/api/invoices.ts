import { apiFetch } from './client';
import type { Invoice } from '../types/invoice';

export type InvoiceListOpts = { page?: number; per_page?: number; partner_id?: string; status?: string; from?: string; to?: string };

export function listInvoices(opts: InvoiceListOpts = {}) {
  const qs = new URLSearchParams();
  if (opts.per_page) qs.set('per_page', String(opts.per_page));
  if (opts.page) qs.set('page', String(opts.page));
  if (opts.partner_id) qs.set('partner_id', opts.partner_id);
  if (opts.status) qs.set('status', opts.status);
  if (opts.from) qs.set('from', opts.from);
  if (opts.to) qs.set('to', opts.to);
  const q = qs.toString();
  return apiFetch<any>(`/invoices${q ? `?${q}` : ''}`);
}

export function createInvoice(payload: Partial<Invoice> & { lines: any[] }) {
  return apiFetch<Invoice>('/invoices', { method: 'POST', body: JSON.stringify(payload) });
}

export function getInvoice(id: string) {
  return apiFetch<Invoice>(`/invoices/${id}`);
}
