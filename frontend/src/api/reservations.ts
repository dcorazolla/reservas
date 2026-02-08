import { apiFetch } from "./client";

export function createReservation(data: any) {
  return apiFetch("/reservations", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateReservation(id: string, data: any) {
  return apiFetch(`/reservations/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function calculateReservationPrice(data: {
  room_id: string;
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
  room_id: string;
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

export type ReservationListOpts = { from?: string; to?: string; partner_id?: string };

export function listReservations(opts: ReservationListOpts = {}) {
  const qs = new URLSearchParams();
  if (opts.from) qs.set('from', opts.from);
  if (opts.to) qs.set('to', opts.to);
  if (opts.partner_id) qs.set('partner_id', opts.partner_id);
  return apiFetch(`/reservations${qs.toString() ? `?${qs.toString()}` : ''}`);
}
