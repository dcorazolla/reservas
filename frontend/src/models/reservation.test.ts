import { describe, it, expect } from 'vitest'
import {
  ReservationStatus,
  PaymentStatus,
  getCalendarConfig,
  isValidReservationDates,
  getStayLength,
  isDateInReservation,
  canonicalizeStatus,
  CALENDAR_BREAKPOINTS,
  STATUS_COLORS,
  STATUS_LABELS,
  type Reservation,
} from './reservation'

describe('Reservation Models', () => {
  describe('ReservationStatus enum', () => {
    it('should have all 8 statuses', () => {
      expect(Object.keys(ReservationStatus)).toHaveLength(8)
    })

    it('should have correct values', () => {
      expect(ReservationStatus.PRE_RESERVA).toBe('pre-reserva')
      expect(ReservationStatus.CONFIRMADO).toBe('confirmado')
      expect(ReservationStatus.CHECKED_IN).toBe('checked_in')
    })
  })

  describe('PaymentStatus enum', () => {
    it('should have 3 payment statuses', () => {
      expect(Object.keys(PaymentStatus)).toHaveLength(3)
    })
  })

  describe('STATUS_COLORS', () => {
    it('should map all statuses to colors', () => {
      Object.values(ReservationStatus).forEach((status) => {
        expect(STATUS_COLORS[status as ReservationStatus]).toBeDefined()
        expect(STATUS_COLORS[status as ReservationStatus]).toMatch(/^#[0-9a-f]{6}$/)
      })
    })

    it('should have 8 color entries', () => {
      expect(Object.keys(STATUS_COLORS)).toHaveLength(8)
    })
  })

  describe('STATUS_LABELS', () => {
    it('should map all statuses to labels', () => {
      Object.values(ReservationStatus).forEach((status) => {
        expect(STATUS_LABELS[status as ReservationStatus]).toBeDefined()
        expect(STATUS_LABELS[status as ReservationStatus].length).toBeGreaterThan(0)
      })
    })
  })

  describe('CALENDAR_BREAKPOINTS', () => {
    it('should have 3 breakpoint configurations', () => {
      expect(Object.keys(CALENDAR_BREAKPOINTS)).toHaveLength(3)
    })

    it('should have valid mobile breakpoint', () => {
      const mobile = CALENDAR_BREAKPOINTS.MOBILE
      expect(mobile.breakpoint).toBe(600)
      expect(mobile.min_days).toBe(5)
      expect(mobile.max_days).toBe(10)
      expect(mobile.default_days).toBe(7)
    })

    it('should have valid tablet breakpoint', () => {
      const tablet = CALENDAR_BREAKPOINTS.TABLET
      expect(tablet.breakpoint).toBe(1024)
      expect(tablet.min_days).toBe(10)
      expect(tablet.max_days).toBe(15)
      expect(tablet.default_days).toBe(12)
    })

    it('should have valid desktop breakpoint', () => {
      const desktop = CALENDAR_BREAKPOINTS.DESKTOP
      expect(desktop.breakpoint).toBe(Infinity)
      expect(desktop.min_days).toBe(15)
      expect(desktop.max_days).toBe(35)
      expect(desktop.default_days).toBe(21)
    })
  })

  describe('getCalendarConfig', () => {
    it('should return MOBILE config for width < 600px', () => {
      const config = getCalendarConfig(500)
      expect(config).toBe(CALENDAR_BREAKPOINTS.MOBILE)
    })

    it('should return TABLET config for 600px <= width < 1024px', () => {
      const config = getCalendarConfig(800)
      expect(config).toBe(CALENDAR_BREAKPOINTS.TABLET)
    })

    it('should return DESKTOP config for width >= 1024px', () => {
      const config = getCalendarConfig(1200)
      expect(config).toBe(CALENDAR_BREAKPOINTS.DESKTOP)
    })

    it('should return TABLET for exact breakpoint 600', () => {
      const config = getCalendarConfig(600)
      expect(config).toBe(CALENDAR_BREAKPOINTS.TABLET)
    })

    it('should return DESKTOP for exact breakpoint 1024', () => {
      const config = getCalendarConfig(1024)
      expect(config).toBe(CALENDAR_BREAKPOINTS.DESKTOP)
    })
  })

  describe('isValidReservationDates', () => {
    it('should return true for valid date range', () => {
      expect(isValidReservationDates('2026-02-18', '2026-02-20')).toBe(true)
    })

    it('should return false when start_date >= end_date', () => {
      expect(isValidReservationDates('2026-02-20', '2026-02-20')).toBe(false)
      expect(isValidReservationDates('2026-02-20', '2026-02-18')).toBe(false)
    })

    it('should return true for dates far in the future', () => {
      expect(isValidReservationDates('2026-02-18', '2027-02-18')).toBe(true)
    })
  })

  describe('getStayLength', () => {
    it('should calculate 1 day stay', () => {
      expect(getStayLength('2026-02-18', '2026-02-19')).toBe(1)
    })

    it('should calculate 3 days stay', () => {
      expect(getStayLength('2026-02-18', '2026-02-21')).toBe(3)
    })

    it('should calculate multi-week stay', () => {
      expect(getStayLength('2026-02-18', '2026-03-18')).toBe(28)
    })

    it('should handle same-year and cross-year dates', () => {
      expect(getStayLength('2025-12-30', '2026-01-02')).toBe(3)
    })
  })

  describe('isDateInReservation', () => {
    const reservation: Reservation = {
      id: 'res-1',
      room_id: 'room-1',
      property_id: 'prop-1',
      guest_name: 'John Doe',
      adults_count: 2,
      children_count: 0,
      infants_count: 0,
      start_date: '2026-02-18',
      end_date: '2026-02-21',
      status: ReservationStatus.CONFIRMADO,
    }

    it('should return true for check-in date', () => {
      expect(isDateInReservation('2026-02-18', reservation)).toBe(true)
    })

    it('should return true for middle dates', () => {
      expect(isDateInReservation('2026-02-19', reservation)).toBe(true)
      expect(isDateInReservation('2026-02-20', reservation)).toBe(true)
    })

    it('should return false for check-out date', () => {
      expect(isDateInReservation('2026-02-21', reservation)).toBe(false)
    })

    it('should return false for dates before reservation', () => {
      expect(isDateInReservation('2026-02-17', reservation)).toBe(false)
    })

    it('should return false for dates after reservation', () => {
      expect(isDateInReservation('2026-02-22', reservation)).toBe(false)
    })
  })

  describe('canonicalizeStatus', () => {
    it('should handle pre-reserva variations', () => {
      expect(canonicalizeStatus('pre-reserva')).toBe(ReservationStatus.PRE_RESERVA)
      expect(canonicalizeStatus('pre_reserva')).toBe(ReservationStatus.PRE_RESERVA)
      expect(canonicalizeStatus('tentative')).toBe(ReservationStatus.PRE_RESERVA)
      expect(canonicalizeStatus('TENTATIVA')).toBe(ReservationStatus.PRE_RESERVA)
    })

    it('should handle reservado variations', () => {
      expect(canonicalizeStatus('reservado')).toBe(ReservationStatus.RESERVADO)
      expect(canonicalizeStatus('RESERVED')).toBe(ReservationStatus.RESERVADO)
      expect(canonicalizeStatus('booked')).toBe(ReservationStatus.RESERVADO)
    })

    it('should handle confirmado variations', () => {
      expect(canonicalizeStatus('confirmed')).toBe(ReservationStatus.CONFIRMADO)
      expect(canonicalizeStatus('CONFIRMADO')).toBe(ReservationStatus.CONFIRMADO)
      expect(canonicalizeStatus('guaranteed')).toBe(ReservationStatus.CONFIRMADO)
    })

    it('should handle checked_in variations', () => {
      expect(canonicalizeStatus('checked_in')).toBe(ReservationStatus.CHECKED_IN)
      expect(canonicalizeStatus('CHECKED-IN')).toBe(ReservationStatus.CHECKED_IN)
      expect(canonicalizeStatus('in-house')).toBe(ReservationStatus.CHECKED_IN)
      expect(canonicalizeStatus('in_house')).toBe(ReservationStatus.CHECKED_IN)
    })

    it('should handle checked_out variations', () => {
      expect(canonicalizeStatus('checked_out')).toBe(ReservationStatus.CHECKED_OUT)
      expect(canonicalizeStatus('CHECKED-OUT')).toBe(ReservationStatus.CHECKED_OUT)
      expect(canonicalizeStatus('checkout')).toBe(ReservationStatus.CHECKED_OUT)
      expect(canonicalizeStatus('departed')).toBe(ReservationStatus.CHECKED_OUT)
    })

    it('should handle no_show variations', () => {
      expect(canonicalizeStatus('no_show')).toBe(ReservationStatus.NO_SHOW)
      expect(canonicalizeStatus('NO-SHOW')).toBe(ReservationStatus.NO_SHOW)
      expect(canonicalizeStatus('no show')).toBe(ReservationStatus.NO_SHOW)
    })

    it('should handle cancelado variations', () => {
      expect(canonicalizeStatus('cancelado')).toBe(ReservationStatus.CANCELADO)
      expect(canonicalizeStatus('CANCELED')).toBe(ReservationStatus.CANCELADO)
      expect(canonicalizeStatus('cancelled')).toBe(ReservationStatus.CANCELADO)
    })

    it('should handle blocked variations', () => {
      expect(canonicalizeStatus('blocked')).toBe(ReservationStatus.BLOCKED)
      expect(canonicalizeStatus('BLOQUEADO')).toBe(ReservationStatus.BLOCKED)
      expect(canonicalizeStatus('manutenção')).toBe(ReservationStatus.BLOCKED)
    })

    it('should return PRE_RESERVA for null/undefined/empty', () => {
      expect(canonicalizeStatus(null)).toBe(ReservationStatus.PRE_RESERVA)
      expect(canonicalizeStatus(undefined)).toBe(ReservationStatus.PRE_RESERVA)
      expect(canonicalizeStatus('')).toBe(ReservationStatus.PRE_RESERVA)
    })

    it('should return PRE_RESERVA for unknown status', () => {
      expect(canonicalizeStatus('unknown_status')).toBe(ReservationStatus.PRE_RESERVA)
    })

    it('should be case-insensitive', () => {
      expect(canonicalizeStatus('RESERVADO')).toBe(ReservationStatus.RESERVADO)
      expect(canonicalizeStatus('ConfIRmADO')).toBe(ReservationStatus.CONFIRMADO)
    })
  })
})
