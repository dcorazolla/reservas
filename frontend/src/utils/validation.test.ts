import { describe, it, expect } from 'vitest'
import {
  requiredString,
  requiredPositiveNumber,
  requiredNumeric,
  runValidation,
  toNumberOrNull,
} from './validation'

const t = (key: string) => key

describe('validation helpers', () => {
  describe('requiredString', () => {
    it('returns error for empty string', () => {
      expect(requiredString('', t)).toBe('common.status.error_required')
    })
    it('returns error for whitespace-only', () => {
      expect(requiredString('   ', t)).toBe('common.status.error_required')
    })
    it('returns error for null', () => {
      expect(requiredString(null, t)).toBe('common.status.error_required')
    })
    it('returns error for undefined', () => {
      expect(requiredString(undefined, t)).toBe('common.status.error_required')
    })
    it('returns null for valid string', () => {
      expect(requiredString('hello', t)).toBeNull()
    })
  })

  describe('requiredPositiveNumber', () => {
    it('returns error for empty string', () => {
      expect(requiredPositiveNumber('', t)).toBe('common.status.error_required')
    })
    it('returns error for null', () => {
      expect(requiredPositiveNumber(null, t)).toBe('common.status.error_required')
    })
    it('returns error for NaN string', () => {
      expect(requiredPositiveNumber('abc', t)).toBe('common.status.error_required')
    })
    it('returns error for zero', () => {
      expect(requiredPositiveNumber(0, t)).toBe('common.status.error_required')
    })
    it('returns error for negative', () => {
      expect(requiredPositiveNumber(-1, t)).toBe('common.status.error_required')
    })
    it('returns null for positive number', () => {
      expect(requiredPositiveNumber(5, t)).toBeNull()
    })
    it('returns null for positive string number', () => {
      expect(requiredPositiveNumber('3', t)).toBeNull()
    })
  })

  describe('requiredNumeric', () => {
    it('returns error for empty string', () => {
      expect(requiredNumeric('', t)).toBe('common.status.error_required')
    })
    it('returns error for null', () => {
      expect(requiredNumeric(null, t)).toBe('common.status.error_required')
    })
    it('returns error for NaN', () => {
      expect(requiredNumeric('abc', t)).toBe('common.status.error_required')
    })
    it('returns null for zero', () => {
      expect(requiredNumeric(0, t)).toBeNull()
    })
    it('returns null for valid number string', () => {
      expect(requiredNumeric('42', t)).toBeNull()
    })
  })

  describe('runValidation', () => {
    it('returns empty object when all pass', () => {
      const result = runValidation({
        name: [null],
        age: [null],
      })
      expect(result).toEqual({})
    })

    it('returns first error per field', () => {
      const result = runValidation({
        name: ['required', 'too_short'],
        age: [null, 'too_old'],
      })
      expect(result).toEqual({ name: 'required', age: 'too_old' })
    })

    it('ignores fields with no errors', () => {
      const result = runValidation({
        ok: [null, null],
        bad: ['err'],
      })
      expect(result).toEqual({ bad: 'err' })
    })
  })

  describe('toNumberOrNull', () => {
    it('returns null for empty string', () => {
      expect(toNumberOrNull('')).toBeNull()
    })
    it('returns null for null', () => {
      expect(toNumberOrNull(null)).toBeNull()
    })
    it('returns null for undefined', () => {
      expect(toNumberOrNull(undefined)).toBeNull()
    })
    it('returns null for NaN string', () => {
      expect(toNumberOrNull('abc')).toBeNull()
    })
    it('returns number for valid string', () => {
      expect(toNumberOrNull('42')).toBe(42)
    })
    it('returns number for zero string', () => {
      expect(toNumberOrNull('0')).toBe(0)
    })
    it('returns number for decimal string', () => {
      expect(toNumberOrNull('3.14')).toBeCloseTo(3.14)
    })
  })
})
