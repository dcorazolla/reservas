import { createCrudService } from './crudService'
import type { Room, RoomPayload } from '@models/room'

export type { Room, RoomPayload }

const crud = createCrudService<Room, RoomPayload>('/api/rooms')

export const listRooms  = crud.list
export const getRoom    = crud.get
export const createRoom = crud.create
export const updateRoom = crud.update
export const deleteRoom = crud.remove

export default {
  listRooms,
  getRoom,
  createRoom,
  updateRoom,
  deleteRoom,
}
