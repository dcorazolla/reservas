import api from './api'

export type RoomCategoryPayload = {
  name: string
  description?: string | null
}

export type RoomCategory = {
  id: string
  name: string
  description?: string | null
}

const BASE = '/api/room-categories'

export async function listRoomCategories(): Promise<RoomCategory[]> {
  const resp = await api.get<RoomCategory[]>(BASE)
  return resp.data
}

export async function getRoomCategory(id: string): Promise<RoomCategory> {
  const resp = await api.get<RoomCategory>(`${BASE}/${id}`)
  return resp.data
}

export async function createRoomCategory(payload: RoomCategoryPayload): Promise<RoomCategory> {
  const resp = await api.post<RoomCategory>(BASE, payload)
  return resp.data
}

export async function updateRoomCategory(id: string, payload: RoomCategoryPayload): Promise<RoomCategory> {
  const resp = await api.put<RoomCategory>(`${BASE}/${id}`, payload)
  return resp.data
}

export async function deleteRoomCategory(id: string): Promise<void> {
  await api.delete(`${BASE}/${id}`)
}

export default {
  listRoomCategories,
  getRoomCategory,
  createRoomCategory,
  updateRoomCategory,
  deleteRoomCategory,
}
