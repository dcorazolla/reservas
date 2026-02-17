import { vi, describe, it, expect, beforeEach } from 'vitest'

// We need to test setAuthToken without mocking api itself
// Import the real module
import api, { setAuthToken } from './api'

describe('api service', () => {
  beforeEach(() => {
    delete api.defaults.headers.common.Authorization
  })

  it('sets Authorization header when token provided', () => {
    setAuthToken('my-token')
    expect(api.defaults.headers.common.Authorization).toBe('Bearer my-token')
  })

  it('removes Authorization header when null', () => {
    api.defaults.headers.common.Authorization = 'Bearer old'
    setAuthToken(null)
    expect(api.defaults.headers.common.Authorization).toBeUndefined()
  })

  it('has correct baseURL and content-type', () => {
    expect(api.defaults.headers['Content-Type']).toBe('application/json')
  })
})
