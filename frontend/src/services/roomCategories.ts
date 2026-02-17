import { createCrudService } from './crudService'

export type RoomCategoryPayload = {
  name: string
  description?: string | null
}

export type RoomCategory = {
  id: string
  name: string
  description?: string | null
}

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
