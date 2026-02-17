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
