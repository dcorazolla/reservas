import { vi, describe, it, expect, beforeEach } from 'vitest'

vi.mock('./api', () => {
  const get = vi.fn()
  const post = vi.fn()
  const put = vi.fn()
  const del = vi.fn()
  return { default: { get, post, put, delete: del }, __mocks: { get, post, put, del } }
})

import * as svc from './partners'

describe('partners service', () => {
  beforeEach(() => vi.clearAllMocks())

  it('lists partners', async () => {
    const api = await import('./api')
    ;(api as any).__mocks.get.mockResolvedValueOnce({ data: [{ id: 'par-1', name: 'Partner A', email: 'a@example.com' }] })
    const res = await svc.listPartners()
    expect(res).toHaveLength(1)
    expect((api as any).__mocks.get).toHaveBeenCalledWith('/api/partners')
  })

  it('creates a partner', async () => {
    const api = await import('./api')
    ;(api as any).__mocks.post.mockResolvedValueOnce({ data: { id: 'par-2', name: 'New Partner', email: 'new@example.com' } })
    const res = await svc.createPartner({ name: 'New Partner', email: 'new@example.com' })
    expect(res.id).toBe('par-2')
    expect((api as any).__mocks.post).toHaveBeenCalledWith('/api/partners', { name: 'New Partner', email: 'new@example.com' })
  })

  it('updates a partner', async () => {
    const api = await import('./api')
    ;(api as any).__mocks.put.mockResolvedValueOnce({ data: { id: 'par-1', name: 'Updated', email: 'updated@example.com' } })
    const res = await svc.updatePartner('par-1', { name: 'Updated', email: 'updated@example.com' })
    expect(res.name).toBe('Updated')
    expect((api as any).__mocks.put).toHaveBeenCalledWith('/api/partners/par-1', { name: 'Updated', email: 'updated@example.com' })
  })

  it('deletes a partner', async () => {
    const api = await import('./api')
    ;(api as any).__mocks.del.mockResolvedValueOnce(undefined)
    await svc.deletePartner('par-1')
    expect((api as any).__mocks.del).toHaveBeenCalledWith('/api/partners/par-1')
  })
})
