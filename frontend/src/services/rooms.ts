import { createCrudService } from './crudService'

export type RoomPayload = {
  name: string
  number?: string | null
  room_category_id?: string | null
  beds: number
  capacity: number
  active?: boolean | null
  notes?: string | null
}

export type Room = {
  id: string
  name: string
  number?: string | null
  room_category_id?: string | null
  beds: number
  capacity: number
  active?: boolean | null
  notes?: string | null
}

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
