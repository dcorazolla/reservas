/**
 * Cancellation Policy Models
 * Frontend types for cancellation policies, rules, and refund calculations
 */

export interface CancellationRefundRule {
  id: string
  cancellation_policy_id: string
  min_days_before_checkin: number
  max_days_before_checkin: number | null
  refund_percentage: number
  priority: number
  created_at: string
  updated_at: string
}

export interface CancellationPolicy {
  id: string
  property_id: string
  is_active: boolean
  rules: CancellationRefundRule[]
  created_at: string
  updated_at: string
}

export interface RefundCalculation {
  refund_percentage: number
  refund_amount: number
  total_price: number
  days_until_checkin: number
  matched_rule_id: string
  matched_rule_priority: number
  refund_reason?: string
}

export interface RefundPreview {
  reservation_id: string
  reservation_status: string
  guest_name: string
  check_in_date: string
  check_out_date: string
  total_days: number
  total_price: number
  cancellation_reason: string
  refund_calculation: RefundCalculation
  cancelled_at?: string
}

export interface CancelResponse {
  success: boolean
  reservation_id: string
  message: string
  refund_invoice_id?: string
  cancelled_at: string
  refund_amount: number
  status: string
}

export type CancellationModalState = 'preview' | 'confirm' | 'loading' | 'success' | 'error'

export interface CancellationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm?: () => void
  reservation: {
    id: string
    guest_name: string
    check_in_date: string
    check_out_date: string
    total_price: number
    status: string
  }
}
