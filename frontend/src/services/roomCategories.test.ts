import { vi, describe, it, expect, beforeEach } from 'vitest'

vi.mock('./api', () => {
  const get = vi.fn()
  const post = vi.fn()
  const put = vi.fn()
  const del = vi.fn()
  return { default: { get, post, put, delete: del }, __mocks: { get, post, put, del } }
})

import * as svc from './roomCategories'

describe('roomCategories service', () => {
  beforeEach(() => vi.clearAllMocks())

  it('lists room categories', async () => {
    const api = await import('./api')
    ;(api as any).__mocks.get.mockResolvedValueOnce({ data: [{ id: 'rc-1', name: 'Cat A' }] })
    const res = await svc.listRoomCategories()
    expect(res).toHaveLength(1)
    expect((api as any).__mocks.get).toHaveBeenCalledWith('/api/room-categories')
  })

  it('gets a room category', async () => {
    const api = await import('./api')
    ;(api as any).__mocks.get.mockResolvedValueOnce({ data: { id: 'rc-1', name: 'Cat A' } })
    const res = await svc.getRoomCategory('rc-1')
    expect(res.id).toBe('rc-1')
    expect((api as any).__mocks.get).toHaveBeenCalledWith('/api/room-categories/rc-1')
  })

  it('creates a room category', async () => {
    const api = await import('./api')
    ;(api as any).__mocks.post.mockResolvedValueOnce({ data: { id: 'rc-2', name: 'New' } })
    const res = await svc.createRoomCategory({ name: 'New' })
    expect(res.id).toBe('rc-2')
    expect((api as any).__mocks.post).toHaveBeenCalledWith('/api/room-categories', { name: 'New' })
  })

  it('updates a room category', async () => {
    const api = await import('./api')
    ;(api as any).__mocks.put.mockResolvedValueOnce({ data: { id: 'rc-1', name: 'Updated' } })
    const res = await svc.updateRoomCategory('rc-1', { name: 'Updated' })
    expect(res.name).toBe('Updated')
    expect((api as any).__mocks.put).toHaveBeenCalledWith('/api/room-categories/rc-1', { name: 'Updated' })
  })

  it('deletes a room category', async () => {
    const api = await import('./api')
    ;(api as any).__mocks.del.mockResolvedValueOnce(undefined)
    await svc.deleteRoomCategory('rc-1')
    expect((api as any).__mocks.del).toHaveBeenCalledWith('/api/room-categories/rc-1')
  })
})
