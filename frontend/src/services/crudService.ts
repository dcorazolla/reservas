import api from './api'
import { decodeJwtPayload } from '@utils/jwt'

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

/**
 * Scoped CRUD service with propertyId from JWT.
 * All operations automatically pass propertyId from JWT token.
 */
export interface ScopedCrudService<T, P> {
  list(filters?: Record<string, unknown>): Promise<T[]>
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
 * Create a scoped CRUD service that automatically injects propertyId from JWT.
 * 
 * Usage:
 * ```tsx
 * // In a component or service
 * const { token } = useAuth()
 * const blocksService = createScopedCrudService<RoomBlock, RoomBlockInput>(
 *   '/api/room-blocks',
 *   token
 * )
 * const blocks = await blocksService.list()  // propertyId injected automatically
 * ```
 * 
 * @param basePath - The API endpoint base path (e.g., '/api/room-blocks')
 * @param token - JWT token containing property_id claim
 */
export function createScopedCrudService<T, P>(
  basePath: string,
  token: string | null
): ScopedCrudService<T, P> {
  const payload = decodeJwtPayload(token)
  const propertyId = payload?.property_id

  if (!propertyId) {
    throw new Error('No property_id found in JWT token. Ensure token contains property_id claim.')
  }

  return {
    async list(filters: Record<string, unknown> = {}): Promise<T[]> {
      const params = { property_id: propertyId, ...filters }
      const resp = await api.get<T[]>(basePath, { params })
      return resp.data
    },
    async get(id: string): Promise<T> {
      const resp = await api.get<T>(`${basePath}/${id}`, {
        params: { property_id: propertyId },
      })
      return resp.data
    },
    async create(payload: P): Promise<T> {
      const resp = await api.post<T>(basePath, payload, {
        params: { property_id: propertyId },
      })
      return resp.data
    },
    async update(id: string, payload: P): Promise<T> {
      const resp = await api.put<T>(`${basePath}/${id}`, payload, {
        params: { property_id: propertyId },
      })
      return resp.data
    },
    async remove(id: string): Promise<void> {
      await api.delete(`${basePath}/${id}`, {
        params: { property_id: propertyId },
      })
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
