export type RoomRatePayload = {
  people_count: number
  price_per_day: number
}

export type RoomRate = RoomRatePayload & {
  id: string
  room_id: string
  created_at?: string
  updated_at?: string
}
