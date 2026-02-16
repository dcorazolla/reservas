export type RoomRate = {
  id: string;
  room_id: string;
  people_count: number;
  price_per_day: number;
};

export type RoomRatePeriod = {
  id: string;
  room_id: string;
  people_count: number;
  start_date: string; // YYYY-MM-DD
  end_date: string;   // YYYY-MM-DD
  price_per_day: number;
  description?: string | null;
};

export type PropertyPricing = {
  base_one_adult: number | null;
  base_two_adults: number | null;
  additional_adult: number | null;
  child_price: number | null;
  infant_max_age: number | null;
  child_max_age: number | null;
  child_factor: number | null;
};

export type RoomCategoryRate = {
  id: string;
  room_category_id: string;
  base_one_adult: number | null;
  base_two_adults: number | null;
  additional_adult: number | null;
  child_price: number | null;
};

export type RoomCategoryRatePeriod = {
  id: string;
  room_category_id: string;
  start_date: string;
  end_date: string;
  base_one_adult: number | null;
  base_two_adults: number | null;
  additional_adult: number | null;
  child_price: number | null;
  description?: string | null;
};
