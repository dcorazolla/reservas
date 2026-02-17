import { createNestedCrudService } from './crudService'
import type { RoomRate, RoomRatePayload } from '@models/roomRate'

export type { RoomRate, RoomRatePayload }

const crud = createNestedCrudService<RoomRate, RoomRatePayload>(
  '/api/rooms',
  'rates',
  '/api/room-rates'
)

export const listRates  = crud.list
export const createRate = crud.create
export const updateRate = crud.update
export const deleteRate = crud.remove

export default { listRates, createRate, updateRate, deleteRate }
