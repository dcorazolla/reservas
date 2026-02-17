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
