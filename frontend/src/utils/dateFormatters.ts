/**
 * Date Formatting and Manipulation Utilities
 * 
 * Utility functions for formatting dates consistently across the application.
 * All use date-fns library with pt-BR locale.
 */

import { format, parse, parseISO, differenceInDays, addDays, isBefore, isAfter, isSameDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'

/**
 * Format ISO date string to short date format (DD/MM/YYYY)
 * @param isoDate ISO date string (YYYY-MM-DD) or Date object
 * @returns Formatted date string (DD/MM/YYYY)
 */
export function formatShortDate(isoDate: string | Date): string {
  try {
    const date = typeof isoDate === 'string' ? parseISO(isoDate) : isoDate
    return format(date, 'dd/MM/yyyy', { locale: ptBR })
  } catch {
    return ''
  }
}

/**
 * Format ISO date string to long date format (d 'de' MMMM 'de' yyyy)
 * @param isoDate ISO date string or Date object
 * @returns Formatted date string (e.g., "5 de fevereiro de 2026")
 */
export function formatLongDate(isoDate: string | Date): string {
  try {
    const date = typeof isoDate === 'string' ? parseISO(isoDate) : isoDate
    return format(date, "d 'de' MMMM 'de' yyyy", { locale: ptBR })
  } catch {
    return ''
  }
}

/**
 * Format ISO date string to day of month (DD)
 * @param isoDate ISO date string or Date object
 * @returns Day of month (e.g., "05")
 */
export function formatDayOfMonth(isoDate: string | Date): string {
  try {
    const date = typeof isoDate === 'string' ? parseISO(isoDate) : isoDate
    return format(date, 'dd', { locale: ptBR })
  } catch {
    return ''
  }
}

/**
 * Format ISO date string to day name (e.g., "segunda-feira")
 * @param isoDate ISO date string or Date object
 * @returns Day name in Portuguese
 */
export function formatDayName(isoDate: string | Date): string {
  try {
    const date = typeof isoDate === 'string' ? parseISO(isoDate) : isoDate
    return format(date, 'EEEE', { locale: ptBR })
  } catch {
    return ''
  }
}

/**
 * Format ISO date string to abbreviated day name (e.g., "seg")
 * @param isoDate ISO date string or Date object
 * @returns Abbreviated day name in Portuguese
 */
export function formatDayNameShort(isoDate: string | Date): string {
  try {
    const date = typeof isoDate === 'string' ? parseISO(isoDate) : isoDate
    return format(date, 'EEE', { locale: ptBR })
  } catch {
    return ''
  }
}

/**
 * Format ISO date string to month and day (DD/MM)
 * @param isoDate ISO date string or Date object
 * @returns Formatted date (DD/MM)
 */
export function formatMonthDay(isoDate: string | Date): string {
  try {
    const date = typeof isoDate === 'string' ? parseISO(isoDate) : isoDate
    return format(date, 'dd/MM', { locale: ptBR })
  } catch {
    return ''
  }
}

/**
 * Format ISO date string to full month name and day (e.g., "5 de fevereiro")
 * @param isoDate ISO date string or Date object
 * @returns Formatted date
 */
export function formatMonthDayLong(isoDate: string | Date): string {
  try {
    const date = typeof isoDate === 'string' ? parseISO(isoDate) : isoDate
    return format(date, "d 'de' MMMM", { locale: ptBR })
  } catch {
    return ''
  }
}

/**
 * Format date range as "DD/MM - DD/MM" or "DD/MM/YYYY - DD/MM/YYYY"
 * @param startDate ISO start date or Date object
 * @param endDate ISO end date or Date object
 * @param includeYear Whether to include year (default: false)
 * @returns Formatted range
 */
export function formatDateRange(
  startDate: string | Date,
  endDate: string | Date,
  includeYear = false
): string {
  try {
    const start = typeof startDate === 'string' ? parseISO(startDate) : startDate
    const end = typeof endDate === 'string' ? parseISO(endDate) : endDate
    
    const formatter = includeYear ? 'dd/MM/yyyy' : 'dd/MM'
    const startStr = format(start, formatter, { locale: ptBR })
    const endStr = format(end, formatter, { locale: ptBR })
    
    return `${startStr} - ${endStr}`
  } catch {
    return ''
  }
}

/**
 * Format date range with readable format (e.g., "5 até 10 de fevereiro de 2026")
 * @param startDate ISO start date or Date object
 * @param endDate ISO end date or Date object
 * @returns Formatted range
 */
export function formatDateRangeLong(startDate: string | Date, endDate: string | Date): string {
  try {
    const start = typeof startDate === 'string' ? parseISO(startDate) : startDate
    const end = typeof endDate === 'string' ? parseISO(endDate) : endDate
    
    const startDay = format(start, 'd', { locale: ptBR })
    const endStr = format(end, "d 'de' MMMM 'de' yyyy", { locale: ptBR })
    
    return `${startDay} até ${endStr}`
  } catch {
    return ''
  }
}

/**
 * Format time from date (HH:mm)
 * @param date ISO date string or Date object
 * @returns Formatted time (HH:mm)
 */
export function formatTime(date: string | Date): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return format(dateObj, 'HH:mm', { locale: ptBR })
  } catch {
    return ''
  }
}

/**
 * Format date and time (DD/MM/YYYY HH:mm)
 * @param date ISO date string or Date object
 * @returns Formatted date and time
 */
export function formatDateTime(date: string | Date): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return format(dateObj, 'dd/MM/yyyy HH:mm', { locale: ptBR })
  } catch {
    return ''
  }
}

/**
 * Calculate number of days between two dates
 * @param startDate ISO start date or Date object
 * @param endDate ISO end date or Date object
 * @returns Number of days (positive if endDate is after startDate)
 */
export function getDaysBetween(startDate: string | Date, endDate: string | Date): number {
  try {
    const start = typeof startDate === 'string' ? parseISO(startDate) : startDate
    const end = typeof endDate === 'string' ? parseISO(endDate) : endDate
    
    return differenceInDays(end, start)
  } catch {
    return 0
  }
}

/**
 * Generate array of dates between two dates (inclusive)
 * @param startDate ISO start date or Date object
 * @param endDate ISO end date or Date object
 * @returns Array of ISO date strings
 */
export function getDateRange(startDate: string | Date, endDate: string | Date): string[] {
  try {
    const start = typeof startDate === 'string' ? parseISO(startDate) : startDate
    const end = typeof endDate === 'string' ? parseISO(endDate) : endDate
    
    const dates: string[] = []
    let current = start
    
    while (isBefore(current, end) || isSameDay(current, end)) {
      dates.push(format(current, 'yyyy-MM-dd'))
      current = addDays(current, 1)
    }
    
    return dates
  } catch {
    return []
  }
}

/**
 * Format a breakdown of prices by day (date range format)
 * @param days Array of { date: string, price: number }
 * @returns Formatted string like "01/02: R$ 150,00 | 02/02: R$ 150,00"
 */
export function formatDayBreakdownDisplay(
  days: Array<{ date: string; price: number }>
): string {
  if (!days || days.length === 0) {
    return ''
  }
  
  return days
    .map(({ date, price }) => {
      const dayMonthStr = formatMonthDay(date)
      const priceStr = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(price)
      return `${dayMonthStr}: ${priceStr}`
    })
    .join(' | ')
}

/**
 * Check if a date string is in valid ISO format (YYYY-MM-DD)
 * @param dateStr Date string to validate
 * @returns True if valid ISO format
 */
export function isValidISODate(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return false
  }
  
  try {
    const date = parseISO(dateStr)
    return date instanceof Date && !isNaN(date.getTime())
  } catch {
    return false
  }
}

/**
 * Parse a date string in DD/MM/YYYY format to ISO format (YYYY-MM-DD)
 * @param dateStr Date string in DD/MM/YYYY format
 * @returns ISO date string or empty string if invalid
 */
export function parseDisplayDateToISO(dateStr: string): string {
  try {
    const date = parse(dateStr, 'dd/MM/yyyy', new Date())
    if (isNaN(date.getTime())) {
      return ''
    }
    return format(date, 'yyyy-MM-dd')
  } catch {
    return ''
  }
}

/**
 * Get current date as ISO string (YYYY-MM-DD)
 * @returns ISO date string for today
 */
export function getTodayISO(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

/**
 * Get current date as display format (DD/MM/YYYY)
 * @returns Display date string for today
 */
export function getTodayDisplay(): string {
  return formatShortDate(new Date())
}

/**
 * Check if a date is in the past
 * @param date ISO date string or Date object
 * @returns True if date is in the past
 */
export function isDateInPast(date: string | Date): boolean {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return isBefore(dateObj, new Date())
  } catch {
    return false
  }
}

/**
 * Check if a date is in the future
 * @param date ISO date string or Date object
 * @returns True if date is in the future
 */
export function isDateInFuture(date: string | Date): boolean {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return isAfter(dateObj, new Date())
  } catch {
    return false
  }
}

/**
 * Check if a date is today
 * @param date ISO date string or Date object
 * @returns True if date is today
 */
export function isDateToday(date: string | Date): boolean {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return isSameDay(dateObj, new Date())
  } catch {
    return false
  }
}
