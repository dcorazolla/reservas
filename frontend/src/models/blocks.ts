export type RoomBlockPayload = {
  room_id: string
  start_date: string // YYYY-MM-DD
  end_date: string // YYYY-MM-DD
  type: 'maintenance' | 'cleaning' | 'private' | 'custom'
  reason?: string | null
  recurrence?: 'none' | 'daily' | 'weekly' | 'monthly'
}

export type RoomBlock = {
  id: string
  room_id: string
  start_date: string // YYYY-MM-DD
  end_date: string // YYYY-MM-DD
  type: 'maintenance' | 'cleaning' | 'private' | 'custom'
  reason?: string | null
  recurrence: 'none' | 'daily' | 'weekly' | 'monthly'
  created_by?: string | null
  created_at?: string
  updated_at?: string
}
