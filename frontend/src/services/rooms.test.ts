import { vi, describe, it, expect, beforeEach } from 'vitest'

vi.mock('./api', () => {
  const get = vi.fn()
  const post = vi.fn()
  const put = vi.fn()
  const del = vi.fn()
  return { default: { get, post, put, delete: del }, __mocks: { get, post, put, del } }
})

import * as svc from './rooms'

describe('rooms service', () => {
  beforeEach(() => vi.clearAllMocks())

  it('lists rooms', async () => {
    const api = await import('./api')
    ;(api as any).__mocks.get.mockResolvedValueOnce({ data: [{ id: 'r-1', name: 'Room A' }] })
    const res = await svc.listRooms()
    expect(res).toHaveLength(1)
    expect((api as any).__mocks.get).toHaveBeenCalledWith('/api/rooms')
  })

  it('gets a room', async () => {
    const api = await import('./api')
    ;(api as any).__mocks.get.mockResolvedValueOnce({ data: { id: 'r-1', name: 'Room A' } })
    const res = await svc.getRoom('r-1')
    expect(res.id).toBe('r-1')
    expect((api as any).__mocks.get).toHaveBeenCalledWith('/api/rooms/r-1')
  })

  it('creates a room', async () => {
    const api = await import('./api')
    ;(api as any).__mocks.post.mockResolvedValueOnce({ data: { id: 'r-2', name: 'New' } })
    const res = await svc.createRoom({ name: 'New', beds: 2, capacity: 3 })
    expect(res.id).toBe('r-2')
    expect((api as any).__mocks.post).toHaveBeenCalledWith('/api/rooms', { name: 'New', beds: 2, capacity: 3 })
  })

  it('updates a room', async () => {
    const api = await import('./api')
    ;(api as any).__mocks.put.mockResolvedValueOnce({ data: { id: 'r-1', name: 'Updated' } })
    const res = await svc.updateRoom('r-1', { name: 'Updated', beds: 1, capacity: 2 })
    expect(res.name).toBe('Updated')
    expect((api as any).__mocks.put).toHaveBeenCalledWith('/api/rooms/r-1', { name: 'Updated', beds: 1, capacity: 2 })
  })

  it('deletes a room', async () => {
    const api = await import('./api')
    ;(api as any).__mocks.del.mockResolvedValueOnce(undefined)
    await svc.deleteRoom('r-1')
    expect((api as any).__mocks.del).toHaveBeenCalledWith('/api/rooms/r-1')
  })
})
