/**
 * Calendar Service
 * Fetch and manage calendar grid data for reservations
 */

import { apiClient } from './api'
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
  const current = new Date(startDate + 'T00:00:00')

  for (let i = 0; i < days; i++) {
    const year = current.getFullYear()
    const month = String(current.getMonth() + 1).padStart(2, '0')
    const day = String(current.getDate()).padStart(2, '0')
    dates.push(`${year}-${month}-${day}`)
    current.setDate(current.getDate() + 1)
  }

  return dates
}

/**
 * Format date to display format (DD/MM/YYYY)
 */
export function formatDateDisplay(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('pt-BR')
}

/**
 * Get current month start date (YYYY-MM-DD)
 */
export function getCurrentMonthStart(): string {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}-01`
}

/**
 * Get next month start date (YYYY-MM-DD)
 */
export function getNextMonthStart(fromDate: string): string {
  const date = new Date(fromDate + 'T00:00:00')
  date.setMonth(date.getMonth() + 1)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}-01`
}

/**
 * Get previous month start date (YYYY-MM-DD)
 */
export function getPreviousMonthStart(fromDate: string): string {
  const date = new Date(fromDate + 'T00:00:00')
  date.setMonth(date.getMonth() - 1)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}-01`
}

/**
 * Get month and year label (ex: "Fevereiro 2026")
 */
export function getMonthYearLabel(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
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
