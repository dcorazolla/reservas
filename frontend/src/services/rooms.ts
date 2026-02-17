import api from './api'

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

const BASE = '/api/rooms'

export async function listRooms(): Promise<Room[]> {
  const resp = await api.get<Room[]>(BASE)
  return resp.data
}

export async function getRoom(id: string): Promise<Room> {
  const resp = await api.get<Room>(`${BASE}/${id}`)
  return resp.data
}

export async function createRoom(payload: RoomPayload): Promise<Room> {
  const resp = await api.post<Room>(BASE, payload)
  return resp.data
}

export async function updateRoom(id: string, payload: RoomPayload): Promise<Room> {
  const resp = await api.put<Room>(`${BASE}/${id}`, payload)
  return resp.data
}

export async function deleteRoom(id: string): Promise<void> {
  await api.delete(`${BASE}/${id}`)
}

export default {
  listRooms,
  getRoom,
  createRoom,
  updateRoom,
  deleteRoom,
}
