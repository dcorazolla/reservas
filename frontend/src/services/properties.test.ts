import { vi, describe, it, expect, beforeEach } from 'vitest'

vi.mock('./api', () => {
  const get = vi.fn()
  const post = vi.fn()
  const put = vi.fn()
  const del = vi.fn()
  return { default: { get, post, put, delete: del }, __mocks: { get, post, put, del } }
})

import * as svc from './properties'

describe('properties service', () => {
  beforeEach(() => vi.clearAllMocks())

  it('lists properties', async () => {
    const api = await import('./api')
    ;(api as any).__mocks.get.mockResolvedValueOnce({ data: [{ id: 'p-1', name: 'Prop A', timezone: 'UTC' }] })
    const res = await svc.listProperties()
    expect(res).toHaveLength(1)
    expect((api as any).__mocks.get).toHaveBeenCalledWith('/api/properties')
  })

  it('gets a property', async () => {
    const api = await import('./api')
    ;(api as any).__mocks.get.mockResolvedValueOnce({ data: { id: 'p-1', name: 'Prop A', timezone: 'UTC' } })
    const res = await svc.getProperty('p-1')
    expect(res.id).toBe('p-1')
    expect((api as any).__mocks.get).toHaveBeenCalledWith('/api/properties/p-1')
  })

  it('creates a property', async () => {
    const api = await import('./api')
    ;(api as any).__mocks.post.mockResolvedValueOnce({ data: { id: 'p-2', name: 'New', timezone: 'UTC' } })
    const res = await svc.createProperty({ name: 'New', timezone: 'UTC' })
    expect(res.id).toBe('p-2')
    expect((api as any).__mocks.post).toHaveBeenCalledWith('/api/properties', { name: 'New', timezone: 'UTC' })
  })

  it('updates a property', async () => {
    const api = await import('./api')
    ;(api as any).__mocks.put.mockResolvedValueOnce({ data: { id: 'p-1', name: 'Updated', timezone: 'UTC' } })
    const res = await svc.updateProperty('p-1', { name: 'Updated', timezone: 'UTC' })
    expect(res.name).toBe('Updated')
    expect((api as any).__mocks.put).toHaveBeenCalledWith('/api/properties/p-1', { name: 'Updated', timezone: 'UTC' })
  })

  it('deletes a property', async () => {
    const api = await import('./api')
    ;(api as any).__mocks.del.mockResolvedValueOnce(undefined)
    await svc.deleteProperty('p-1')
    expect((api as any).__mocks.del).toHaveBeenCalledWith('/api/properties/p-1')
  })
})
