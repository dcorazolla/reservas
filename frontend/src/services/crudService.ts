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
