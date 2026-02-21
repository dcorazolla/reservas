/**
 * Cancellation Service
 * Frontend API client for cancellation operations
 */

import type { RefundPreview, CancelResponse, CancellationPolicy } from '@models/cancellation'

const BASE_PATH = '/api/room-reservations'

export const cancellationService = {
  /**
   * Get cancellation policy for a property
   */
  async getPolicy(propertyId: string): Promise<CancellationPolicy> {
    const response = await fetch(`/api/cancellation-policies/${propertyId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error(`Failed to get cancellation policy: ${response.statusText}`)
    }

    return response.json()
  },

  /**
   * Preview refund calculation before confirming cancellation
   */
  async preview(reservationId: string, reason: string): Promise<RefundPreview> {
    const response = await fetch(`${BASE_PATH}/${reservationId}/cancellation/preview`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ cancellation_reason: reason }),
    })

    if (!response.ok) {
      throw new Error(`Failed to preview cancellation: ${response.statusText}`)
    }

    return response.json()
  },

  /**
   * Execute cancellation with refund
   */
  async cancel(reservationId: string, reason: string): Promise<CancelResponse> {
    const response = await fetch(`${BASE_PATH}/${reservationId}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ cancellation_reason: reason }),
    })

    if (!response.ok) {
      throw new Error(`Failed to cancel reservation: ${response.statusText}`)
    }

    return response.json()
  },
}
