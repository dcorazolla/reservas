import api from './api'

/**
 * Generic CRUD service factory.
 *
 * Creates list / get / create / update / delete functions
 * for any REST resource that follows the pattern:
 *   GET    {base}        → T[]
 *   GET    {base}/{id}   → T
 *   POST   {base}        → T
 *   PUT    {base}/{id}   → T
 *   DELETE {base}/{id}   → void
 */
export interface CrudService<T, P> {
  list(): Promise<T[]>
  get(id: string): Promise<T>
  create(payload: P): Promise<T>
  update(id: string, payload: P): Promise<T>
  remove(id: string): Promise<void>
}

export function createCrudService<T, P>(basePath: string): CrudService<T, P> {
  return {
    async list(): Promise<T[]> {
      const resp = await api.get<T[]>(basePath)
      return resp.data
    },
    async get(id: string): Promise<T> {
      const resp = await api.get<T>(`${basePath}/${id}`)
      return resp.data
    },
    async create(payload: P): Promise<T> {
      const resp = await api.post<T>(basePath, payload)
      return resp.data
    },
    async update(id: string, payload: P): Promise<T> {
      const resp = await api.put<T>(`${basePath}/${id}`, payload)
      return resp.data
    },
    async remove(id: string): Promise<void> {
      await api.delete(`${basePath}/${id}`)
    },
  }
}

/**
 * Nested CRUD service factory for sub-resources.
 *
 * Follows the pattern:
 *   GET    {parentBase}/{parentId}/{sub}      → T[]  (list)
 *   POST   {parentBase}/{parentId}/{sub}      → T    (create)
 *   PUT    {itemBase}/{id}                    → T    (update)
 *   DELETE {itemBase}/{id}                    → void (remove)
 *
 * Example: parentBase="/api/rooms", sub="rates", itemBase="/api/room-rates"
 */
export interface NestedCrudService<T, P> {
  list(parentId: string): Promise<T[]>
  create(parentId: string, payload: P): Promise<T>
  update(id: string, payload: P): Promise<T>
  remove(id: string): Promise<void>
}

export function createNestedCrudService<T, P>(
  parentBase: string,
  sub: string,
  itemBase: string
): NestedCrudService<T, P> {
  return {
    async list(parentId: string): Promise<T[]> {
      const resp = await api.get<T[]>(`${parentBase}/${parentId}/${sub}`)
      return resp.data
    },
    async create(parentId: string, payload: P): Promise<T> {
      const resp = await api.post<T>(`${parentBase}/${parentId}/${sub}`, payload)
      return resp.data
    },
    async update(id: string, payload: P): Promise<T> {
      const resp = await api.put<T>(`${itemBase}/${id}`, payload)
      return resp.data
    },
    async remove(id: string): Promise<void> {
      await api.delete(`${itemBase}/${id}`)
    },
  }
}
