import { describe, it, expect, vi } from 'vitest'
import {
  generateDateRange,
  formatDateDisplay,
  getCurrentMonthStart,
  getNextMonthStart,
  getPreviousMonthStart,
  getMonthYearLabel,
  sortRoomsByName,
  filterRoomsByName,
  isDateInRange,
} from './calendar'
import type { Room } from '@models/reservation'
import { ReservationStatus } from '@models/reservation'

describe('Calendar Service', () => {
  describe('generateDateRange', () => {
    it('should generate correct number of dates', () => {
      const dates = generateDateRange('2026-02-18', 7)
      expect(dates).toHaveLength(7)
    })

    it('should start with correct date', () => {
      const dates = generateDateRange('2026-02-18', 5)
      expect(dates[0]).toBe('2026-02-18')
    })

    it('should generate sequential dates', () => {
      const dates = generateDateRange('2026-02-18', 5)
      expect(dates).toEqual([
        '2026-02-18',
        '2026-02-19',
        '2026-02-20',
        '2026-02-21',
        '2026-02-22',
      ])
    })

    it('should handle month boundary', () => {
      const dates = generateDateRange('2026-02-28', 2)
      expect(dates).toEqual(['2026-02-28', '2026-03-01'])
    })

    it('should handle year boundary', () => {
      const dates = generateDateRange('2026-12-31', 2)
      expect(dates).toEqual(['2026-12-31', '2027-01-01'])
    })

    it('should generate 0 dates', () => {
      const dates = generateDateRange('2026-02-18', 0)
      expect(dates).toHaveLength(0)
    })
  })

  describe('formatDateDisplay', () => {
    it('should format date to DD/MM/YYYY', () => {
      const formatted = formatDateDisplay('2026-02-18')
      expect(formatted).toBe('18/02/2026')
    })

    it('should handle single digit dates', () => {
      const formatted = formatDateDisplay('2026-02-05')
      expect(formatted).toBe('05/02/2026')
    })

    it('should handle year boundary', () => {
      const formatted = formatDateDisplay('2026-01-01')
      expect(formatted).toBe('01/01/2026')
    })
  })

  describe('getCurrentMonthStart', () => {
    it('should return date in YYYY-MM-DD format', () => {
      const date = getCurrentMonthStart()
      expect(date).toMatch(/^\d{4}-\d{2}-01$/)
    })

    it('should return first day of month', () => {
      const date = getCurrentMonthStart()
      expect(date).toMatch(/-01$/)
    })

    it('should return current month', () => {
      const date = getCurrentMonthStart()
      const today = new Date()
      const expectedMonth = String(today.getMonth() + 1).padStart(2, '0')
      const expectedYear = today.getFullYear()
      expect(date).toBe(`${expectedYear}-${expectedMonth}-01`)
    })
  })

  describe('getNextMonthStart', () => {
    it('should return next month start date', () => {
      const next = getNextMonthStart('2026-02-18')
      expect(next).toBe('2026-03-01')
    })

    it('should handle year boundary', () => {
      const next = getNextMonthStart('2026-12-15')
      expect(next).toBe('2027-01-01')
    })

    it('should always return day 01', () => {
      const next = getNextMonthStart('2026-02-28')
      expect(next).toMatch(/-01$/)
    })
  })

  describe('getPreviousMonthStart', () => {
    it('should return previous month start date', () => {
      const prev = getPreviousMonthStart('2026-02-18')
      expect(prev).toBe('2026-01-01')
    })

    it('should handle year boundary', () => {
      const prev = getPreviousMonthStart('2026-01-15')
      expect(prev).toBe('2025-12-01')
    })

    it('should always return day 01', () => {
      const prev = getPreviousMonthStart('2026-02-15')
      expect(prev).toMatch(/-01$/)
    })
  })

  describe('getMonthYearLabel', () => {
    it('should return month and year in Portuguese', () => {
      const label = getMonthYearLabel('2026-02-18')
      expect(label).toContain('fevereiro')
      expect(label).toContain('2026')
    })

    it('should work for different months', () => {
      const jan = getMonthYearLabel('2026-01-15')
      const dec = getMonthYearLabel('2026-12-25')
      expect(jan).toContain('janeiro')
      expect(dec).toContain('dezembro')
    })
  })

  describe('sortRoomsByName', () => {
    const rooms: Room[] = [
      {
        id: '3',
        property_id: 'prop-1',
        name: 'Quarto 3',
        capacity: 2,
        reservations: [],
      },
      {
        id: '1',
        property_id: 'prop-1',
        name: 'Quarto 1',
        capacity: 2,
        reservations: [],
      },
      {
        id: '2',
        property_id: 'prop-1',
        name: 'Quarto 2',
        capacity: 2,
        reservations: [],
      },
    ]

    it('should sort rooms alphabetically by name', () => {
      const sorted = sortRoomsByName(rooms)
      expect(sorted[0].name).toBe('Quarto 1')
      expect(sorted[1].name).toBe('Quarto 2')
      expect(sorted[2].name).toBe('Quarto 3')
    })

    it('should not mutate original array', () => {
      const original = [...rooms]
      sortRoomsByName(rooms)
      expect(rooms).toEqual(original)
    })
  })

  describe('filterRoomsByName', () => {
    const rooms: Room[] = [
      { id: '1', property_id: 'prop-1', name: 'Quarto Luxo', capacity: 2, reservations: [] },
      { id: '2', property_id: 'prop-1', name: 'Quarto Standard', capacity: 2, reservations: [] },
      { id: '3', property_id: 'prop-1', name: 'Suite Premium', capacity: 4, reservations: [] },
    ]

    it('should filter rooms by name', () => {
      const filtered = filterRoomsByName(rooms, 'Quarto')
      expect(filtered).toHaveLength(2)
      expect(filtered[0].name).toBe('Quarto Luxo')
      expect(filtered[1].name).toBe('Quarto Standard')
    })

    it('should be case-insensitive', () => {
      const filtered = filterRoomsByName(rooms, 'quarto')
      expect(filtered).toHaveLength(2)
    })

    it('should return all rooms for empty search', () => {
      const filtered = filterRoomsByName(rooms, '')
      expect(filtered).toHaveLength(3)
    })

    it('should return empty array for no matches', () => {
      const filtered = filterRoomsByName(rooms, 'Deluxe')
      expect(filtered).toHaveLength(0)
    })

    it('should not mutate original array', () => {
      const original = [...rooms]
      filterRoomsByName(rooms, 'Quarto')
      expect(rooms).toEqual(original)
    })
  })

  describe('isDateInRange', () => {
    it('should return true for date in range', () => {
      expect(isDateInRange('2026-02-19', '2026-02-18', '2026-02-20')).toBe(true)
    })

    it('should return true for start date', () => {
      expect(isDateInRange('2026-02-18', '2026-02-18', '2026-02-20')).toBe(true)
    })

    it('should return true for end date', () => {
      expect(isDateInRange('2026-02-20', '2026-02-18', '2026-02-20')).toBe(true)
    })

    it('should return false for date before range', () => {
      expect(isDateInRange('2026-02-17', '2026-02-18', '2026-02-20')).toBe(false)
    })

    it('should return false for date after range', () => {
      expect(isDateInRange('2026-02-21', '2026-02-18', '2026-02-20')).toBe(false)
    })
  })
})
