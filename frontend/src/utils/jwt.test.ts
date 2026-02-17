import { describe, it, expect } from 'vitest'
import { decodeJwtPayload } from './jwt'

describe('decodeJwtPayload', () => {
  function makeJwt(payload: Record<string, any>) {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
    const body = btoa(JSON.stringify(payload))
    return `${header}.${body}.signature`
  }

  it('returns null for null/undefined/empty', () => {
    expect(decodeJwtPayload(null)).toBeNull()
    expect(decodeJwtPayload(undefined)).toBeNull()
    expect(decodeJwtPayload('')).toBeNull()
  })

  it('returns null for token with < 2 parts', () => {
    expect(decodeJwtPayload('onlyonepart')).toBeNull()
  })

  it('decodes valid JWT payload', () => {
    const token = makeJwt({ sub: '42', name: 'John', property_name: 'Hotel' })
    const decoded = decodeJwtPayload(token)
    expect(decoded).toEqual({ sub: '42', name: 'John', property_name: 'Hotel' })
  })

  it('returns null for invalid base64', () => {
    expect(decodeJwtPayload('h.!!!.s')).toBeNull()
  })
})
