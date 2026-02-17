import { createCrudService } from './crudService'
import type { RoomCategory, RoomCategoryPayload } from '@models/roomCategory'

export type { RoomCategory, RoomCategoryPayload }

const crud = createCrudService<RoomCategory, RoomCategoryPayload>('/api/room-categories')

export const listRoomCategories  = crud.list
export const getRoomCategory     = crud.get
export const createRoomCategory  = crud.create
export const updateRoomCategory  = crud.update
export const deleteRoomCategory  = crud.remove

export default {
  listRoomCategories,
  getRoomCategory,
  createRoomCategory,
  updateRoomCategory,
  deleteRoomCategory,
}
