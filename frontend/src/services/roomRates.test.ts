import { vi, describe, it, expect, beforeEach } from 'vitest'

vi.mock('./api', () => {
  const get = vi.fn()
  const post = vi.fn()
  const put = vi.fn()
  const del = vi.fn()
  return { default: { get, post, put, delete: del }, __mocks: { get, post, put, del } }
})

import * as svc from './roomRates'

describe('roomRates service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('lists rates for a room', async () => {
    const api = await import('./api')
    api.__mocks.get.mockResolvedValueOnce({ data: [{ id: 'rr-1', room_id: 'r-1', people_count: 1, price_per_day: 100 }] })

    const res = await svc.listRates('r-1')
    expect(res).toHaveLength(1)
    expect(api.__mocks.get).toHaveBeenCalledWith('/api/rooms/r-1/rates')
  })

  it('creates a rate', async () => {
    const api = await import('./api')
    api.__mocks.post.mockResolvedValueOnce({ data: { id: 'rr-2', room_id: 'r-1', people_count: 2, price_per_day: 180 } })

    const payload = { people_count: 2, price_per_day: 180 }
    const res = await svc.createRate('r-1', payload)
    expect(res.id).toBe('rr-2')
    expect(api.__mocks.post).toHaveBeenCalledWith('/api/rooms/r-1/rates', payload)
  })

  it('updates a rate', async () => {
    const api = await import('./api')
    api.__mocks.put.mockResolvedValueOnce({ data: { id: 'rr-3', people_count: 1, price_per_day: 120 } })

    const payload = { people_count: 1, price_per_day: 120 }
    const res = await svc.updateRate('rr-3', payload)
    expect(res.id).toBe('rr-3')
    expect(api.__mocks.put).toHaveBeenCalledWith('/api/room-rates/rr-3', payload)
  })

  it('deletes a rate', async () => {
    const api = await import('./api')
    api.__mocks.del.mockResolvedValueOnce(undefined)

    await svc.deleteRate('rr-4')
    expect(api.__mocks.del).toHaveBeenCalledWith('/api/room-rates/rr-4')
  })
})
