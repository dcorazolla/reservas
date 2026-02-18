import { vi, describe, it, expect, beforeEach } from 'vitest'

vi.mock('./api', () => {
  const get = vi.fn()
  const post = vi.fn()
  const put = vi.fn()
  const del = vi.fn()
  return { default: { get, post, put, delete: del }, __mocks: { get, post, put, del } }
})

vi.mock('@utils/jwt', () => ({
  decodeJwtPayload: vi.fn((token) => {
    if (token === 'valid-token') {
      return { property_id: 'prop-123', uid: 'user-1' }
    }
    return null
  }),
}))

import { createCrudService, createNestedCrudService, createScopedCrudService } from './crudService'

type Item = { id: string; name: string }
type ItemPayload = { name: string }

const svc = createCrudService<Item, ItemPayload>('/api/items')

describe('crudService', () => {
  beforeEach(() => vi.clearAllMocks())

  it('list() calls GET on base path', async () => {
    const api = await import('./api')
    ;(api as any).__mocks.get.mockResolvedValueOnce({ data: [{ id: '1', name: 'A' }] })
    const res = await svc.list()
    expect(res).toEqual([{ id: '1', name: 'A' }])
    expect((api as any).__mocks.get).toHaveBeenCalledWith('/api/items')
  })

  it('get(id) calls GET on base path + id', async () => {
    const api = await import('./api')
    ;(api as any).__mocks.get.mockResolvedValueOnce({ data: { id: '1', name: 'A' } })
    const res = await svc.get('1')
    expect(res).toEqual({ id: '1', name: 'A' })
    expect((api as any).__mocks.get).toHaveBeenCalledWith('/api/items/1')
  })

  it('create(payload) calls POST on base path', async () => {
    const api = await import('./api')
    ;(api as any).__mocks.post.mockResolvedValueOnce({ data: { id: '2', name: 'B' } })
    const res = await svc.create({ name: 'B' })
    expect(res).toEqual({ id: '2', name: 'B' })
    expect((api as any).__mocks.post).toHaveBeenCalledWith('/api/items', { name: 'B' })
  })

  it('update(id, payload) calls PUT on base path + id', async () => {
    const api = await import('./api')
    ;(api as any).__mocks.put.mockResolvedValueOnce({ data: { id: '1', name: 'Updated' } })
    const res = await svc.update('1', { name: 'Updated' })
    expect(res).toEqual({ id: '1', name: 'Updated' })
    expect((api as any).__mocks.put).toHaveBeenCalledWith('/api/items/1', { name: 'Updated' })
  })

  it('remove(id) calls DELETE on base path + id', async () => {
    const api = await import('./api')
    ;(api as any).__mocks.del.mockResolvedValueOnce(undefined)
    await svc.remove('1')
    expect((api as any).__mocks.del).toHaveBeenCalledWith('/api/items/1')
  })
})

type Child = { id: string; parent_id: string; value: number }
type ChildPayload = { value: number }

const nested = createNestedCrudService<Child, ChildPayload>('/api/parents', 'children', '/api/children')

describe('createNestedCrudService', () => {
  beforeEach(() => vi.clearAllMocks())

  it('list(parentId) calls GET on parent path + sub', async () => {
    const api = await import('./api')
    ;(api as any).__mocks.get.mockResolvedValueOnce({ data: [{ id: 'c1', parent_id: 'p1', value: 10 }] })
    const res = await nested.list('p1')
    expect(res).toEqual([{ id: 'c1', parent_id: 'p1', value: 10 }])
    expect((api as any).__mocks.get).toHaveBeenCalledWith('/api/parents/p1/children')
  })

  it('create(parentId, payload) calls POST on parent path + sub', async () => {
    const api = await import('./api')
    ;(api as any).__mocks.post.mockResolvedValueOnce({ data: { id: 'c2', parent_id: 'p1', value: 20 } })
    const res = await nested.create('p1', { value: 20 })
    expect(res).toEqual({ id: 'c2', parent_id: 'p1', value: 20 })
    expect((api as any).__mocks.post).toHaveBeenCalledWith('/api/parents/p1/children', { value: 20 })
  })

  it('update(id, payload) calls PUT on item base + id', async () => {
    const api = await import('./api')
    ;(api as any).__mocks.put.mockResolvedValueOnce({ data: { id: 'c1', parent_id: 'p1', value: 30 } })
    const res = await nested.update('c1', { value: 30 })
    expect(res).toEqual({ id: 'c1', parent_id: 'p1', value: 30 })
    expect((api as any).__mocks.put).toHaveBeenCalledWith('/api/children/c1', { value: 30 })
  })

  it('remove(id) calls DELETE on item base + id', async () => {
    const api = await import('./api')
    ;(api as any).__mocks.del.mockResolvedValueOnce(undefined)
    await nested.remove('c1')
    expect((api as any).__mocks.del).toHaveBeenCalledWith('/api/children/c1')
  })
})

type Scoped = { id: string; property_id: string; data: string }
type ScopedPayload = { data: string }

describe('createScopedCrudService', () => {
  beforeEach(() => vi.clearAllMocks())

  it('throws error if token has no property_id', () => {
    expect(() => createScopedCrudService<Scoped, ScopedPayload>('/api/scoped', 'invalid-token')).toThrow(
      'No property_id found in JWT token'
    )
  })

  it('list(filters) calls GET with property_id in params', async () => {
    const api = await import('./api')
    ;(api as any).__mocks.get.mockResolvedValueOnce({ data: [{ id: 's1', property_id: 'prop-123', data: 'A' }] })

    const scoped = createScopedCrudService<Scoped, ScopedPayload>('/api/scoped', 'valid-token')
    const res = await scoped.list()

    expect(res).toEqual([{ id: 's1', property_id: 'prop-123', data: 'A' }])
    expect((api as any).__mocks.get).toHaveBeenCalledWith('/api/scoped', {
      params: { property_id: 'prop-123' },
    })
  })

  it('list(filters) merges custom filters with property_id', async () => {
    const api = await import('./api')
    ;(api as any).__mocks.get.mockResolvedValueOnce({ data: [] })

    const scoped = createScopedCrudService<Scoped, ScopedPayload>('/api/scoped', 'valid-token')
    await scoped.list({ type: 'maintenance', status: 'active' })

    expect((api as any).__mocks.get).toHaveBeenCalledWith('/api/scoped', {
      params: { property_id: 'prop-123', type: 'maintenance', status: 'active' },
    })
  })

  it('get(id) calls GET with property_id in params', async () => {
    const api = await import('./api')
    ;(api as any).__mocks.get.mockResolvedValueOnce({ data: { id: 's1', property_id: 'prop-123', data: 'A' } })

    const scoped = createScopedCrudService<Scoped, ScopedPayload>('/api/scoped', 'valid-token')
    const res = await scoped.get('s1')

    expect(res).toEqual({ id: 's1', property_id: 'prop-123', data: 'A' })
    expect((api as any).__mocks.get).toHaveBeenCalledWith('/api/scoped/s1', {
      params: { property_id: 'prop-123' },
    })
  })

  it('create(payload) calls POST with property_id in params', async () => {
    const api = await import('./api')
    ;(api as any).__mocks.post.mockResolvedValueOnce({ data: { id: 's2', property_id: 'prop-123', data: 'B' } })

    const scoped = createScopedCrudService<Scoped, ScopedPayload>('/api/scoped', 'valid-token')
    const res = await scoped.create({ data: 'B' })

    expect(res).toEqual({ id: 's2', property_id: 'prop-123', data: 'B' })
    expect((api as any).__mocks.post).toHaveBeenCalledWith('/api/scoped', { data: 'B' }, {
      params: { property_id: 'prop-123' },
    })
  })

  it('update(id, payload) calls PUT with property_id in params', async () => {
    const api = await import('./api')
    ;(api as any).__mocks.put.mockResolvedValueOnce({ data: { id: 's1', property_id: 'prop-123', data: 'Updated' } })

    const scoped = createScopedCrudService<Scoped, ScopedPayload>('/api/scoped', 'valid-token')
    const res = await scoped.update('s1', { data: 'Updated' })

    expect(res).toEqual({ id: 's1', property_id: 'prop-123', data: 'Updated' })
    expect((api as any).__mocks.put).toHaveBeenCalledWith('/api/scoped/s1', { data: 'Updated' }, {
      params: { property_id: 'prop-123' },
    })
  })

  it('remove(id) calls DELETE with property_id in params', async () => {
    const api = await import('./api')
    ;(api as any).__mocks.del.mockResolvedValueOnce(undefined)

    const scoped = createScopedCrudService<Scoped, ScopedPayload>('/api/scoped', 'valid-token')
    await scoped.remove('s1')

    expect((api as any).__mocks.del).toHaveBeenCalledWith('/api/scoped/s1', {
      params: { property_id: 'prop-123' },
    })
  })
})
