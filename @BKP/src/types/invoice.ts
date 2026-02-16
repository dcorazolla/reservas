import type { Partner } from './partner';

export type InvoiceLine = {
  id?: string;
  invoice_id?: string;
  description: string;
  quantity?: number;
  unit_price: number;
  line_total?: number;
};

export type Invoice = {
  id: string;
  partner_id?: string;
  property_id?: string;
  number?: string | null;
  issued_at?: string | null;
  due_at?: string | null;
  total: number;
  status: string;
  lines?: InvoiceLine[];
  partner?: Partner;
};
