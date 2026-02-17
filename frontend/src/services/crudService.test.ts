import { vi, describe, it, expect, beforeEach } from 'vitest'

vi.mock('./api', () => {
  const get = vi.fn()
  const post = vi.fn()
  const put = vi.fn()
  const del = vi.fn()
  return { default: { get, post, put, delete: del }, __mocks: { get, post, put, del } }
})

import { createCrudService, createNestedCrudService } from './crudService'

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
