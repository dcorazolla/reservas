import { apiFetch } from "./client";

export type AvailabilityRequest = {
  checkin: string; // YYYY-MM-DD
  checkout: string; // YYYY-MM-DD
  adults: number;
  children: number;
  infants?: number;
  property_ids?: number[];
};

export type AvailabilityDay = { date: string; price: number };

export type AvailabilityItem = {
  room_id: number;
  room_name: string;
  room_number?: string;
  capacity: number;
  property_id: number;
  property_name?: string;
  category_id?: number | null;
  category_name?: string | null;
  adults: number;
  children: number;
  infants: number;
  pricing_source: 'room_period'|'category_period'|'room_base'|'category_base'|'property_base';
  total: number;
  days: AvailabilityDay[];
};

export function searchAvailability(req: AvailabilityRequest) {
  return apiFetch<AvailabilityItem[]>(`/availability/search`, {
    method: "POST",
    body: JSON.stringify(req),
  });
}
