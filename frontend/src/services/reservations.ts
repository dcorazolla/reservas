/**
 * Reservation Service
 * CRUD operations for reservations
 */

import api from './api'
import type {
  Reservation,
  ReservationListResponse,
  ReservationPriceCalculation,
  ReservationFilters,
} from '@models/reservation'

/**
 * Fetch calendar grid data for a given date range
 */
export async function getCalendar(
  propertyId: string,
  startDate: string,
  endDate: string
) {
  const response = await api.get('/api/calendar', {
    params: {
      property_id: propertyId,
      start: startDate,
      end: endDate,
    },
  })
  return response.data
}

/**
 * Fetch paginated list of reservations with filters
 */
export async function listReservations(
  propertyId: string,
  filters: ReservationFilters = {}
) {
  const params: Record<string, unknown> = {
    property_id: propertyId,
  }

  if (filters.month && filters.year) {
    const from = new Date(filters.year, filters.month - 1, 1).toISOString().split('T')[0]
    const to = new Date(filters.year, filters.month, 0).toISOString().split('T')[0]
    params.from = from
    params.to = to
  }

  if (filters.guest_name) params['search[guest]'] = filters.guest_name
  if (filters.contact) params['search[contact]'] = filters.contact
  if (filters.partner_id !== undefined) params['search[partner_id]'] = filters.partner_id
  if (filters.status && filters.status.length > 0) {
    params['search[status][]'] = filters.status
  }

  if (filters.sort) params.sort = filters.sort
  if (filters.order) params.order = filters.order
  if (filters.page) params.page = filters.page
  if (filters.per_page) params.per_page = filters.per_page

  const response = await api.get<ReservationListResponse>('/api/reservations', {
    params,
  })
  return response.data
}

/**
 * Get a single reservation by ID
 */
export async function getReservation(propertyId: string, id: string) {
  const response = await api.get<Reservation>(`/api/reservations/${id}`, {
    params: { property_id: propertyId },
  })
  return response.data
}

/**
 * Create a new reservation
 */
export async function createReservation(
  propertyId: string,
  data: Omit<Reservation, 'id' | 'property_id' | 'created_at' | 'updated_at'>
) {
  const payload = {
    ...data,
    property_id: propertyId,
  }
  const response = await api.post<Reservation>('/api/reservations', payload, {
    params: { property_id: propertyId },
  })
  return response.data
}

/**
 * Update an existing reservation
 */
export async function updateReservation(
  propertyId: string,
  id: string,
  data: Partial<Omit<Reservation, 'id' | 'property_id'>>
) {
  const response = await api.put<Reservation>(`/api/reservations/${id}`, data, {
    params: { property_id: propertyId },
  })
  return response.data
}

/**
 * Delete a reservation
 */
export async function deleteReservation(propertyId: string, id: string) {
  await api.delete(`/api/reservations/${id}`, {
    params: { property_id: propertyId },
  })
}

/**
 * Check-in a reservation
 */
export async function checkInReservation(propertyId: string, id: string) {
  const response = await api.post<Reservation>(
    `/api/reservations/${id}/check-in`,
    {},
    { params: { property_id: propertyId } }
  )
  return response.data
}

/**
 * Check-out a reservation
 */
export async function checkOutReservation(propertyId: string, id: string) {
  const response = await api.post<Reservation>(
    `/api/reservations/${id}/check-out`,
    {},
    { params: { property_id: propertyId } }
  )
  return response.data
}

/**
 * Confirm a reservation
 */
export async function confirmReservation(propertyId: string, id: string, data: any = {}) {
  const response = await api.post<Reservation>(
    `/api/reservations/${id}/confirm`,
    data,
    { params: { property_id: propertyId } }
  )
  return response.data
}

/**
 * Cancel a reservation
 */
export async function cancelReservation(propertyId: string, id: string) {
  const response = await api.post<Reservation>(
    `/api/reservations/${id}/cancel`,
    {},
    { params: { property_id: propertyId } }
  )
  return response.data
}

/**
 * Calculate reservation price with detailed breakdown
 */
export async function calculateReservationPrice(propertyId: string, data: {
  room_id: string
  start_date: string
  end_date: string
  adults_count: number
  children_count: number
  infants_count?: number
}) {
  const response = await api.post<ReservationPriceCalculation>(
    '/api/reservations/calculate-detailed',
    data,
    { params: { property_id: propertyId } }
  )
  return response.data
}

/**
 * Create a CRUD service for reservations
 * Utility similar to createCrudService but specific to reservations
 */
export function createReservationCrudService(propertyId: string) {
  return {
    list: (filters?: ReservationFilters) => listReservations(propertyId, filters),
    get: (id: string) => getReservation(propertyId, id),
    create: (data: Omit<Reservation, 'id' | 'property_id' | 'created_at' | 'updated_at'>) =>
      createReservation(propertyId, data),
    update: (id: string, data: Partial<Omit<Reservation, 'id' | 'property_id'>>) =>
      updateReservation(propertyId, id, data),
    delete: (id: string) => deleteReservation(propertyId, id),
    checkIn: (id: string) => checkInReservation(propertyId, id),
    checkOut: (id: string) => checkOutReservation(propertyId, id),
    confirm: (id: string, data?: any) => confirmReservation(propertyId, id, data),
    cancel: (id: string) => cancelReservation(propertyId, id),
    calculatePrice: (data: any) => calculateReservationPrice(propertyId, data),
  }
}
