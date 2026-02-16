import api from './api'

export type RoomCategoryRatePayload = {
  base_one_adult: number
  base_two_adults: number
  additional_adult: number
  child_price: number
}

export type RoomCategoryRate = RoomCategoryRatePayload & {
  id: string
  room_category_id: string
}

const BASE = '/api'

export async function listRates(roomCategoryId: string): Promise<RoomCategoryRate[]> {
  const resp = await api.get<RoomCategoryRate[]>(`${BASE}/room-categories/${roomCategoryId}/rates`)
  return resp.data
}

export async function createRate(roomCategoryId: string, payload: RoomCategoryRatePayload): Promise<RoomCategoryRate> {
  const resp = await api.post<RoomCategoryRate>(`${BASE}/room-categories/${roomCategoryId}/rates`, payload)
  return resp.data
}

export async function updateRate(rateId: string, payload: RoomCategoryRatePayload): Promise<RoomCategoryRate> {
  const resp = await api.put<RoomCategoryRate>(`${BASE}/room-category-rates/${rateId}`, payload)
  return resp.data
}

export async function deleteRate(rateId: string): Promise<void> {
  await api.delete(`${BASE}/room-category-rates/${rateId}`)
}

export default { listRates, createRate, updateRate, deleteRate }
