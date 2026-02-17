export type PartnerPayload = {
  name: string
  email?: string | null
  phone?: string | null
  tax_id?: string | null
  address?: string | null
  notes?: string | null
  billing_rule?: 'none' | 'charge_partner' | 'charge_guest' | null
  partner_discount_percent?: number | null
}

export type Partner = {
  id: string
  property_id?: string
  name: string
  email?: string | null
  phone?: string | null
  tax_id?: string | null
  address?: string | null
  notes?: string | null
  billing_rule?: 'none' | 'charge_partner' | 'charge_guest' | null
  partner_discount_percent?: number | null
  created_at?: string
  updated_at?: string
}
