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
