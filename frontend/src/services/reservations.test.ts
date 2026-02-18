import { vi, describe, it, expect, beforeEach } from 'vitest'

vi.mock('./api', () => {
  const get = vi.fn()
  const post = vi.fn()
  const put = vi.fn()
  const del = vi.fn()
  return { default: { get, post, put, delete: del }, __mocks: { get, post, put, del } }
})

import * as svc from './reservations'
import type { ReservationFilters } from '@models/reservation'
import { ReservationStatus } from '@models/reservation'

describe('reservations service', () => {
  const propertyId = 'prop-123'
  const reservationId = 'res-456'

  beforeEach(() => vi.clearAllMocks())

  describe('listReservations', () => {
    it('fetches reservations list', async () => {
      const api = await import('./api')
      const mockReservations = [
        {
          id: 'res-1',
          property_id: propertyId,
          room_id: 'room-1',
          guest_name: 'John Doe',
          check_in: '2026-02-18',
          check_out: '2026-02-20',
          status: ReservationStatus.CONFIRMED,
        },
      ]
      ;(api as any).__mocks.get.mockResolvedValueOnce({ data: mockReservations })

      const result = await svc.listReservations(propertyId)
      expect(result).toHaveLength(1)
      expect((api as any).__mocks.get).toHaveBeenCalledWith(
        '/api/reservations',
        expect.any(Object)
      )
    })

    it('filters by guest name', async () => {
      const api = await import('./api')
      ;(api as any).__mocks.get.mockResolvedValueOnce({ data: [] })

      const filters: ReservationFilters = { guest_name: 'John' }
      await svc.listReservations(propertyId, filters)

      const options = (api as any).__mocks.get.mock.calls[0][1] as any
      expect(options.params['search[guest]']).toBe('John')
    })

    it('filters by partner ID', async () => {
      const api = await import('./api')
      ;(api as any).__mocks.get.mockResolvedValueOnce({ data: [] })

      const filters: ReservationFilters = { partner_id: 'partner-1' }
      await svc.listReservations(propertyId, filters)

      const options = (api as any).__mocks.get.mock.calls[0][1] as any
      expect(options.params['search[partner_id]']).toBe('partner-1')
    })

    it('filters by status', async () => {
      const api = await import('./api')
      ;(api as any).__mocks.get.mockResolvedValueOnce({ data: [] })

      const filters: ReservationFilters = { status: [ReservationStatus.CONFIRMED] }
      await svc.listReservations(propertyId, filters)

      const options = (api as any).__mocks.get.mock.calls[0][1] as any
      expect(options.params['search[status][]']).toBeDefined()
      expect(Array.isArray(options.params['search[status][]'])).toBe(true)
    })

    it('filters by multiple statuses', async () => {
      const api = await import('./api')
      ;(api as any).__mocks.get.mockResolvedValueOnce({ data: [] })

      const filters: ReservationFilters = {
        status: [ReservationStatus.CONFIRMED, ReservationStatus.RESERVED],
      }
      await svc.listReservations(propertyId, filters)

      const options = (api as any).__mocks.get.mock.calls[0][1] as any
      expect(Array.isArray(options.params['search[status][]'])).toBe(true)
      expect(options.params['search[status][]'].length).toBe(2)
    })

    it('supports pagination', async () => {
      const api = await import('./api')
      ;(api as any).__mocks.get.mockResolvedValueOnce({ data: [] })

      const filters: ReservationFilters = { page: 2, per_page: 20 }
      await svc.listReservations(propertyId, filters)

      const options = (api as any).__mocks.get.mock.calls[0][1] as any
      expect(options.params.page).toBe(2)
      expect(options.params.per_page).toBe(20)
    })

    it('supports sorting', async () => {
      const api = await import('./api')
      ;(api as any).__mocks.get.mockResolvedValueOnce({ data: [] })

      const filters: ReservationFilters = { sort: 'check_in', order: 'desc' }
      await svc.listReservations(propertyId, filters)

      const options = (api as any).__mocks.get.mock.calls[0][1] as any
      expect(options.params.sort).toBe('check_in')
      expect(options.params.order).toBe('desc')
    })

    it('combines multiple filters', async () => {
      const api = await import('./api')
      ;(api as any).__mocks.get.mockResolvedValueOnce({ data: [] })

      const filters: ReservationFilters = {
        guest_name: 'John',
        partner_id: 'partner-1',
        status: [ReservationStatus.CONFIRMED],
        page: 1,
        per_page: 10,
      }
      await svc.listReservations(propertyId, filters)

      const options = (api as any).__mocks.get.mock.calls[0][1] as any
      expect(options.params['search[guest]']).toBe('John')
      expect(options.params['search[partner_id]']).toBe('partner-1')
      expect(Array.isArray(options.params['search[status][]'])).toBe(true)
      expect(options.params.page).toBe(1)
      expect(options.params.per_page).toBe(10)
    })

    it('ignores undefined filters', async () => {
      const api = await import('./api')
      ;(api as any).__mocks.get.mockResolvedValueOnce({ data: [] })

      const filters: ReservationFilters = {
        guest_name: 'John',
        partner_id: undefined,
      }
      await svc.listReservations(propertyId, filters)

      const options = (api as any).__mocks.get.mock.calls[0][1] as any
      expect(options.params['search[guest]']).toBe('John')
      expect(options.params['search[partner_id]']).toBeUndefined()
    })

    it('includes property_id in URL', async () => {
      const api = await import('./api')
      ;(api as any).__mocks.get.mockResolvedValueOnce({ data: [] })

      await svc.listReservations(propertyId)

      const call = (api as any).__mocks.get.mock.calls[0]
      const options = call[1] as any
      expect(options.params?.property_id).toBe(propertyId)
    })
  })

  describe('getReservation', () => {
    it('fetches single reservation', async () => {
      const api = await import('./api')
      const mockReservation = {
        id: reservationId,
        property_id: propertyId,
        room_id: 'room-1',
        guest_name: 'John Doe',
        check_in: '2026-02-18',
        check_out: '2026-02-20',
        status: ReservationStatus.CONFIRMED,
      }
      ;(api as any).__mocks.get.mockResolvedValueOnce({ data: mockReservation })

      const result = await svc.getReservation(propertyId, reservationId)
      expect(result.id).toBe(reservationId)
      expect((api as any).__mocks.get).toHaveBeenCalledWith(
        `/api/reservations/${reservationId}`,
        expect.any(Object)
      )
    })
  })

  describe('createReservation', () => {
    it('creates reservation', async () => {
      const api = await import('./api')
      const newReservation = {
        room_id: 'room-1',
        guest_name: 'John Doe',
        check_in: '2026-02-18',
        check_out: '2026-02-20',
        people_count: 2,
      }
      const created = { ...newReservation, id: reservationId, property_id: propertyId }
      ;(api as any).__mocks.post.mockResolvedValueOnce({ data: created })

      const result = await svc.createReservation(propertyId, newReservation)
      expect(result.id).toBe(reservationId)
      expect((api as any).__mocks.post).toHaveBeenCalledWith(
        '/api/reservations',
        expect.objectContaining({ property_id: propertyId }),
        expect.any(Object)
      )
    })

    it('includes property_id in URL', async () => {
      const api = await import('./api')
      ;(api as any).__mocks.post.mockResolvedValueOnce({ data: {} })

      await svc.createReservation(propertyId, { room_id: 'room-1' } as any)

      const call = (api as any).__mocks.post.mock.calls[0]
      const payload = call[1] as any
      expect(payload.property_id).toBe(propertyId)
    })
  })

  describe('updateReservation', () => {
    it('updates reservation', async () => {
      const api = await import('./api')
      const updates = { guest_name: 'Jane Doe' }
      const updated = { id: reservationId, property_id: propertyId, ...updates }
      ;(api as any).__mocks.put.mockResolvedValueOnce({ data: updated })

      const result = await svc.updateReservation(propertyId, reservationId, updates)
      expect(result.guest_name).toBe('Jane Doe')
      expect((api as any).__mocks.put).toHaveBeenCalledWith(
        `/api/reservations/${reservationId}`,
        updates,
        expect.any(Object)
      )
    })

    it('includes property_id in URL', async () => {
      const api = await import('./api')
      ;(api as any).__mocks.put.mockResolvedValueOnce({ data: {} })

      await svc.updateReservation(propertyId, reservationId, {})

      const call = (api as any).__mocks.put.mock.calls[0]
      const options = call[2] as any
      expect(options.params?.property_id).toBe(propertyId)
    })
  })

  describe('deleteReservation', () => {
    it('deletes reservation', async () => {
      const api = await import('./api')
      ;(api as any).__mocks.del.mockResolvedValueOnce({ data: { success: true } })

      await svc.deleteReservation(propertyId, reservationId)
      expect((api as any).__mocks.del).toHaveBeenCalledWith(
        `/api/reservations/${reservationId}`,
        expect.any(Object)
      )
    })

    it('includes property_id in URL', async () => {
      const api = await import('./api')
      ;(api as any).__mocks.del.mockResolvedValueOnce({ data: {} })

      await svc.deleteReservation(propertyId, reservationId)

      const call = (api as any).__mocks.del.mock.calls[0]
      const options = call[1] as any
      expect(options.params?.property_id).toBe(propertyId)
    })
  })

  describe('State Transitions', () => {
    it('checks in reservation', async () => {
      const api = await import('./api')
      const updated = {
        id: reservationId,
        property_id: propertyId,
        status: ReservationStatus.CHECKED_IN,
      }
      ;(api as any).__mocks.post.mockResolvedValueOnce({ data: updated })

      const result = await svc.checkInReservation(propertyId, reservationId)
      expect(result.status).toBe(ReservationStatus.CHECKED_IN)
      expect((api as any).__mocks.post).toHaveBeenCalledWith(
        `/api/reservations/${reservationId}/check-in`,
        {},
        expect.any(Object)
      )
    })

    it('checks out reservation', async () => {
      const api = await import('./api')
      const updated = {
        id: reservationId,
        property_id: propertyId,
        status: ReservationStatus.CHECKED_OUT,
      }
      ;(api as any).__mocks.post.mockResolvedValueOnce({ data: updated })

      const result = await svc.checkOutReservation(propertyId, reservationId)
      expect(result.status).toBe(ReservationStatus.CHECKED_OUT)
      expect((api as any).__mocks.post).toHaveBeenCalledWith(
        `/api/reservations/${reservationId}/check-out`,
        {},
        expect.any(Object)
      )
    })

    it('confirms reservation', async () => {
      const api = await import('./api')
      const updated = {
        id: reservationId,
        property_id: propertyId,
        status: ReservationStatus.CONFIRMED,
      }
      ;(api as any).__mocks.post.mockResolvedValueOnce({ data: updated })

      const result = await svc.confirmReservation(propertyId, reservationId)
      expect(result.status).toBe(ReservationStatus.CONFIRMED)
      expect((api as any).__mocks.post).toHaveBeenCalledWith(
        `/api/reservations/${reservationId}/confirm`,
        {},
        expect.any(Object)
      )
    })

    it('cancels reservation', async () => {
      const api = await import('./api')
      const updated = {
        id: reservationId,
        property_id: propertyId,
        status: ReservationStatus.CANCELLED,
      }
      ;(api as any).__mocks.post.mockResolvedValueOnce({ data: updated })

      const result = await svc.cancelReservation(propertyId, reservationId)
      expect(result.status).toBe(ReservationStatus.CANCELLED)
      expect((api as any).__mocks.post).toHaveBeenCalledWith(
        `/api/reservations/${reservationId}/cancel`,
        {},
        expect.any(Object)
      )
    })

    it('includes property_id in state transition URLs', async () => {
      const api = await import('./api')
      ;(api as any).__mocks.post.mockResolvedValueOnce({ data: {} })

      await svc.checkInReservation(propertyId, reservationId)

      const call = (api as any).__mocks.post.mock.calls[0]
      const options = call[2] as any
      expect(options.params?.property_id).toBe(propertyId)
    })
  })

  describe('calculateReservationPrice', () => {
    it('calculates reservation price', async () => {
      const api = await import('./api')
      const priceRequest = {
        room_id: 'room-1',
        check_in: '2026-02-18',
        check_out: '2026-02-20',
        people_count: 2,
      }
      const priceResponse = {
        total_price: 300.0,
        breakdown: {
          room_period: null,
          category_period: null,
          room_base: null,
          category_base: null,
          property_base: 300.0,
        },
        source: 'property_base',
      }
      ;(api as any).__mocks.post.mockResolvedValueOnce({ data: priceResponse })

      const result = await svc.calculateReservationPrice(propertyId, priceRequest)
      expect(result.total_price).toBe(300.0)
      expect(result.source).toBe('property_base')
      expect((api as any).__mocks.post).toHaveBeenCalledWith(
        '/api/reservations/calculate-detailed',
        priceRequest,
        expect.any(Object)
      )
    })

    it('returns cascade source in price response', async () => {
      const api = await import('./api')
      const priceRequest = {
        room_id: 'room-1',
        check_in: '2026-02-18',
        check_out: '2026-02-20',
        people_count: 2,
      }
      const priceResponse = {
        total_price: 250.0,
        breakdown: {
          room_period: 250.0,
          category_period: null,
          room_base: null,
          category_base: null,
          property_base: null,
        },
        source: 'room_period',
      }
      ;(api as any).__mocks.post.mockResolvedValueOnce({ data: priceResponse })

      const result = await svc.calculateReservationPrice(propertyId, priceRequest)
      expect(result.total_price).toBe(250.0)
      expect(result.source).toBe('room_period')
    })

    it('includes property_id in URL', async () => {
      const api = await import('./api')
      ;(api as any).__mocks.post.mockResolvedValueOnce({ data: {} })

      await svc.calculateReservationPrice(propertyId, { room_id: 'room-1' } as any)

      const call = (api as any).__mocks.post.mock.calls[0]
      const options = call[2] as any
      expect(options.params?.property_id).toBe(propertyId)
    })
  })

  describe('Error Handling', () => {
    it('propagates API errors on list', async () => {
      const api = await import('./api')
      ;(api as any).__mocks.get.mockRejectedValueOnce(new Error('Network Error'))

      try {
        await svc.listReservations(propertyId)
        expect.fail('Should have thrown')
      } catch (err: any) {
        expect(err.message).toBe('Network Error')
      }
    })

    it('handles 404 on getReservation', async () => {
      const api = await import('./api')
      ;(api as any).__mocks.get.mockRejectedValueOnce(new Error('Not Found'))

      try {
        await svc.getReservation(propertyId, 'invalid-id')
        expect.fail('Should have thrown')
      } catch (err: any) {
        expect(err.message).toBe('Not Found')
      }
    })

    it('handles invalid state transitions', async () => {
      const api = await import('./api')
      ;(api as any).__mocks.post.mockRejectedValueOnce(new Error('Conflict'))

      try {
        await svc.checkInReservation(propertyId, reservationId)
        expect.fail('Should have thrown')
      } catch (err: any) {
        expect(err.message).toBe('Conflict')
      }
    })
  })

  describe('Batch Operations', () => {
    it('handles concurrent list requests', async () => {
      const api = await import('./api')
      ;(api as any).__mocks.get.mockResolvedValueOnce({ data: [] })
      ;(api as any).__mocks.get.mockResolvedValueOnce({ data: [] })

      const filter1 = { status: [ReservationStatus.CONFIRMED] }
      const filter2 = { status: [ReservationStatus.CANCELLED] }

      await Promise.all([
        svc.listReservations(propertyId, filter1),
        svc.listReservations(propertyId, filter2),
      ])

      expect((api as any).__mocks.get).toHaveBeenCalledTimes(2)
    })
  })
})
