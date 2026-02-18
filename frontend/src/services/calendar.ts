/**
 * Calendar Service
 * Fetch and manage calendar grid data for reservations
 */

import { apiClient } from './api'
import { format, addDays, startOfMonth, endOfMonth, addMonths, subMonths, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { CalendarResponse, Room } from '@models/reservation'

/**
 * Fetch calendar grid data with rooms and reservations for a date range
 */
export async function getCalendarData(
  propertyId: string,
  startDate: string,
  endDate: string
): Promise<CalendarResponse> {
  const response = await apiClient.get<CalendarResponse>('/api/calendar', {
    params: {
      property_id: propertyId,
      start: startDate,
      end: endDate,
    },
  })
  return response.data
}

/**
 * Generate date range array (YYYY-MM-DD format)
 * Used to render calendar grid headers
 */
export function generateDateRange(startDate: string, days: number): string[] {
  const dates: string[] = []
  let current = parseISO(startDate)

  for (let i = 0; i < days; i++) {
    dates.push(format(current, 'yyyy-MM-dd'))
    current = addDays(current, 1)
  }

  return dates
}

/**
 * Format date to display format (DD/MM/YYYY)
 */
export function formatDateDisplay(dateStr: string): string {
  try {
    const date = parseISO(dateStr)
    return format(date, 'dd/MM/yyyy', { locale: ptBR })
  } catch {
    return dateStr
  }
}

/**
 * Get current month start date (YYYY-MM-DD)
 */
export function getCurrentMonthStart(): string {
  const start = startOfMonth(new Date())
  return format(start, 'yyyy-MM-dd')
}

/**
 * Get next month start date (YYYY-MM-DD)
 */
export function getNextMonthStart(fromDate: string): string {
  try {
    const date = parseISO(fromDate)
    const next = addMonths(date, 1)
    const start = startOfMonth(next)
    return format(start, 'yyyy-MM-dd')
  } catch {
    return fromDate
  }
}

/**
 * Get previous month start date (YYYY-MM-DD)
 */
export function getPreviousMonthStart(fromDate: string): string {
  try {
    const date = parseISO(fromDate)
    const prev = subMonths(date, 1)
    const start = startOfMonth(prev)
    return format(start, 'yyyy-MM-dd')
  } catch {
    return fromDate
  }
}

/**
 * Get month and year label (ex: "Fevereiro 2026")
 */
export function getMonthYearLabel(dateStr: string): string {
  try {
    const date = parseISO(dateStr)
    return format(date, 'MMMM yyyy', { locale: ptBR })
  } catch {
    return dateStr
  }
}

/**
 * Sort rooms by name
 */
export function sortRoomsByName(rooms: Room[]): Room[] {
  return [...rooms].sort((a, b) => a.name.localeCompare(b.name))
}

/**
 * Filter rooms by name (case-insensitive)
 */
export function filterRoomsByName(rooms: Room[], searchTerm: string): Room[] {
  if (!searchTerm) return rooms
  const lower = searchTerm.toLowerCase()
  return rooms.filter((room) => room.name.toLowerCase().includes(lower))
}

/**
 * Validate date is within calendar range
 */
export function isDateInRange(date: string, startDate: string, endDate: string): boolean {
  return date >= startDate && date <= endDate
}
