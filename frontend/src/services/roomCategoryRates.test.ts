import { vi, describe, it, expect, beforeEach } from 'vitest'

vi.mock('./api', () => {
  const get = vi.fn()
  const post = vi.fn()
  const put = vi.fn()
  const del = vi.fn()
  return { default: { get, post, put, delete: del }, __mocks: { get, post, put, del } }
})

import * as svc from './roomCategoryRates'

describe('roomCategoryRates service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('lists rates', async () => {
    const api = await import('./api')
    api.__mocks.get.mockResolvedValueOnce({ data: [{ id: 'r-1', room_category_id: 'rc-1', base_one_adult: 10, base_two_adults: 15, additional_adult: 5, child_price: 2 }] })

    const res = await svc.listRates('rc-1')
    expect(res).toHaveLength(1)
    expect(api.__mocks.get).toHaveBeenCalledWith('/api/room-categories/rc-1/rates')
  })

  it('creates a rate', async () => {
    const api = await import('./api')
    api.__mocks.post.mockResolvedValueOnce({ data: { id: 'r-2', room_category_id: 'rc-2', base_one_adult: 20 } })

    const payload = { base_one_adult: 20, base_two_adults: 30, additional_adult: 5, child_price: 3 }
    const res = await svc.createRate('rc-2', payload)
    expect(res.id).toBe('r-2')
    expect(api.__mocks.post).toHaveBeenCalledWith('/api/room-categories/rc-2/rates', payload)
  })

  it('updates a rate', async () => {
    const api = await import('./api')
    api.__mocks.put.mockResolvedValueOnce({ data: { id: 'r-3', base_one_adult: 40 } })

    const payload = { base_one_adult: 40, base_two_adults: 50, additional_adult: 10, child_price: 4 }
    const res = await svc.updateRate('r-3', payload)
    expect(res.id).toBe('r-3')
    expect(api.__mocks.put).toHaveBeenCalledWith('/api/room-category-rates/r-3', payload)
  })

  it('deletes a rate', async () => {
    const api = await import('./api')
    api.__mocks.del.mockResolvedValueOnce(undefined)

    await svc.deleteRate('r-4')
    expect(api.__mocks.del).toHaveBeenCalledWith('/api/room-category-rates/r-4')
  })
})
