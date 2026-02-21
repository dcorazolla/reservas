/**
 * Price and Value Calculations
 * 
 * Utility functions for calculating prices, totals, and financial values.
 * Used across ReservationModal, MinibarPanel, and other components.
 */

import type { Consumption } from '@models/minibar'

/**
 * Calculate total quantity of items in consumptions array
 * @param consumptions Array of minibar consumptions
 * @returns Total quantity of items
 */
export function calculateConsumptionQuantityTotal(consumptions: Consumption[]): number {
  return consumptions.reduce((sum, consumption) => sum + (consumption.quantity || 0), 0)
}

/**
 * Calculate total value of consumptions
 * @param consumptions Array of minibar consumptions
 * @param priceResolver Optional function to resolve prices (fallback when consumption.product.price is not set)
 * @returns Total value in currency units
 */
export function calculateConsumptionValueTotal(
  consumptions: Consumption[],
  priceResolver?: (productId: string) => number | undefined
): number {
  return consumptions.reduce((sum, consumption) => {
    const price = consumption.product?.price_per_unit ?? (priceResolver?.(consumption.product_id) ?? 0)
    return sum + (price * (consumption.quantity || 0))
  }, 0)
}

/**
 * Calculate reservation total with minibar and optional price override
 * @param basePrice Base reservation price (from rate calculation)
 * @param minibarTotal Total minibar consumption value
 * @param priceOverride Optional manual price override (if user set custom total)
 * @returns Final total price
 */
export function calculateReservationTotal(
  basePrice: number,
  minibarTotal: number,
  priceOverride?: number | null
): number {
  if (priceOverride !== undefined && priceOverride !== null) {
    return priceOverride
  }
  return basePrice + minibarTotal
}

/**
 * Format a breakdown of prices by day
 * @param days Array of objects with date and price
 * @returns Formatted string like "01/02: R$ 150,00 | 02/02: R$ 150,00"
 */
export function formatDayBreakdown(days: Array<{ date: string; price: number }>): string {
  if (!days || days.length === 0) {
    return ''
  }
  
  return days
    .map(({ date, price }) => {
      // Extract day/month from YYYY-MM-DD format
      const [, month, day] = date.split('-')
      const formatted = `${day}/${month}`
      const priceStr = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(price)
      return `${formatted}: ${priceStr}`
    })
    .join(' | ')
}

/**
 * Round a value to 2 decimal places for currency
 * @param value Value to round
 * @returns Rounded value
 */
export function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100
}

/**
 * Format a number as Brazilian currency (BRL)
 * @param value Value to format
 * @param options Optional formatting options
 * @returns Formatted currency string like "R$ 1.234,56"
 */
export function formatBRL(
  value: number,
  options?: {
    minimumFractionDigits?: number
    maximumFractionDigits?: number
  }
): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: options?.minimumFractionDigits ?? 2,
    maximumFractionDigits: options?.maximumFractionDigits ?? 2,
  }).format(value)
}

/**
 * Parse a BRL formatted string back to number
 * @param formatted Formatted BRL string like "R$ 1.234,56"
 * @returns Numeric value
 */
export function parseBRL(formatted: string): number {
  // Remove currency symbol, spaces, and thousand separators
  // Handle both "R$ 1.234,56" and variations
  const cleaned = formatted
    .replace(/[R$\s]/g, '')       // Remove R$ and spaces
    .replace(/\./g, '')            // Remove thousand separators (dots)
    .replace(',', '.')             // Replace decimal comma with dot
  
  return parseFloat(cleaned) || 0
}

/**
 * Calculate percentage of a total
 * @param value Value to calculate percentage for
 * @param total Total value
 * @param decimals Number of decimal places (default 2)
 * @returns Percentage value
 */
export function calculatePercentage(value: number, total: number, decimals = 2): number {
  if (total === 0) return 0
  const percentage = (value / total) * 100
  return Math.round(percentage * Math.pow(10, decimals)) / Math.pow(10, decimals)
}

/**
 * Calculate discount amount
 * @param original Original price
 * @param discounted Discounted price
 * @returns Discount amount
 */
export function calculateDiscount(original: number, discounted: number): number {
  return original - discounted
}

/**
 * Calculate discounted price from percentage
 * @param price Original price
 * @param discountPercent Discount percentage (0-100)
 * @returns Discounted price
 */
export function applyDiscount(price: number, discountPercent: number): number {
  return price * (1 - discountPercent / 100)
}

/**
 * Check if a value is valid for currency (positive number with max 2 decimals)
 * @param value Value to validate
 * @returns True if valid currency value
 */
export function isValidCurrency(value: number | string): boolean {
  const num = typeof value === 'string' ? parseFloat(value) : value
  
  // Check if it's a valid number
  if (isNaN(num)) return false
  
  // Check if positive
  if (num < 0) return false
  
  // Check if max 2 decimal places
  const decimals = (num.toString().split('.')[1] || '').length
  if (decimals > 2) return false
  
  return true
}

/**
 * Convert cents to currency units (e.g., 15000 cents = 150.00)
 * @param cents Value in cents
 * @returns Value in currency units
 */
export function centsToUnits(cents: number): number {
  return cents / 100
}

/**
 * Convert currency units to cents (e.g., 150.00 = 15000 cents)
 * @param units Value in currency units
 * @returns Value in cents
 */
export function unitsToCents(units: number): number {
  return Math.round(units * 100)
}

/**
 * Calculate average price per unit
 * @param totalPrice Total price
 * @param quantity Quantity of units
 * @returns Average price per unit
 */
export function calculateUnitPrice(totalPrice: number, quantity: number): number {
  if (quantity === 0) return 0
  return totalPrice / quantity
}

/**
 * Sum an array of numbers with protection against floating-point errors
 * @param numbers Array of numbers to sum
 * @returns Sum of all numbers
 */
export function sumNumbers(numbers: number[]): number {
  return numbers.reduce((sum, num) => {
    return roundCurrency(sum + (num || 0))
  }, 0)
}

/**
 * Calculate average of numbers
 * @param numbers Array of numbers
 * @returns Average value
 */
export function averageNumbers(numbers: number[]): number {
  if (numbers.length === 0) return 0
  return sumNumbers(numbers) / numbers.length
}

/**
 * Find min and max values in array
 * @param numbers Array of numbers
 * @returns Object with min and max values
 */
export function getMinMax(numbers: number[]): { min: number; max: number } {
  if (numbers.length === 0) {
    return { min: 0, max: 0 }
  }
  return {
    min: Math.min(...numbers),
    max: Math.max(...numbers),
  }
}
