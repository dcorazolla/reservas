import { createNestedCrudService } from './crudService'
import type { RoomCategoryRate, RoomCategoryRatePayload } from '@models/roomCategoryRate'

export type { RoomCategoryRate, RoomCategoryRatePayload }

const crud = createNestedCrudService<RoomCategoryRate, RoomCategoryRatePayload>(
  '/api/room-categories',
  'rates',
  '/api/room-category-rates'
)

export const listRates  = crud.list
export const createRate = crud.create
export const updateRate = crud.update
export const deleteRate = crud.remove

export default { listRates, createRate, updateRate, deleteRate }
