import { apiFetch } from "./client";

export function createReservation(data: any) {
  return apiFetch("/reservations", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateReservation(id: number, data: any) {
  return apiFetch(`/reservations/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function calculateReservationPrice(data: {
  room_id: number;
  start_date: string;
  end_date: string;
  people_count: number;
}) {
  return apiFetch("/reservations/calculate", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function calculateReservationPriceDetailed(data: {
  room_id: number;
  start_date: string;
  end_date: string;
  adults_count: number;
  children_count: number;
  infants_count?: number;
}) {
  return apiFetch("/reservations/calculate-detailed", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
