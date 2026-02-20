/**
 * Minibar Models
 *
 * Types for minibar products and consumptions
 */

export interface MinibarProduct {
  id: string
  name: string
  sku?: string
  price?: number
  price_per_unit?: number
  stock?: number | null
  available_stock?: number
  property_id?: string
  created_at?: string
  updated_at?: string
}

export interface MinibarConsumption {
  id: string
  reservation_id: string
  product_id: string
  quantity: number
  unit_price: number
  total_price: number
  created_at?: string
  updated_at?: string
}

export interface CreateConsumptionPayload {
  reservation_id: string
  product_id: string
  quantity: number
  unit_price: number
}
