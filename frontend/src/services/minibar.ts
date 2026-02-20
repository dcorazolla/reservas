/**
 * Minibar Service
 * Manage minibar products and consumptions
 */

import { createCrudService } from './crudService'
import type { MinibarProduct, MinibarConsumption, CreateConsumptionPayload } from '@models/minibar'
import api from './api'

// CRUD services
const productsService = createCrudService<MinibarProduct, MinibarProduct>('/api/products')
const consumptionsService = createCrudService<MinibarConsumption, CreateConsumptionPayload>('/api/minibar-consumptions')

/**
 * List all minibar products
 */
export async function listMinibarProducts(): Promise<MinibarProduct[]> {
  return productsService.list()
}

/**
 * Get a single minibar product
 */
export async function getMinibarProduct(id: string): Promise<MinibarProduct> {
  return productsService.get(id)
}

/**
 * Create a minibar consumption for a reservation
 */
export async function createMinibarConsumption(
  payload: CreateConsumptionPayload
): Promise<MinibarConsumption> {
  return consumptionsService.create(payload)
}

/**
 * List consumptions for a reservation
 */
export async function listConsumptions(reservationId: string): Promise<MinibarConsumption[]> {
  const response = await api.get<MinibarConsumption[]>(
    `/api/minibar-consumptions`,
    {
      params: { reservation_id: reservationId },
    }
  )
  return response.data
}

/**
 * Delete a minibar consumption
 */
export async function deleteConsumption(id: string): Promise<void> {
  await consumptionsService.remove(id)
}
