export type Partner = {
  id: string;
  property_id?: string | null;
  name: string;
  email?: string | null;
  phone?: string | null;
  tax_id?: string | null;
  address?: string | null;
  notes?: string | null;
  // Billing configuration
  billing_rule?: 'none' | 'charge_partner' | 'charge_guest';
  partner_discount_percent?: number | null; // percentage discount for partner billing
};
