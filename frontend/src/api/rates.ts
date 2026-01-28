import { apiFetch } from "./client";
import type { RoomRate, RoomRatePeriod, RoomCategoryRate, RoomCategoryRatePeriod } from "../types/rate";

export function listRoomRates(roomId: number) {
  return apiFetch<RoomRate[]>(`/rooms/${roomId}/rates`);
}

export function createRoomRate(roomId: number, data: Partial<RoomRate>) {
  return apiFetch<RoomRate>(`/rooms/${roomId}/rates`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateRoomRate(id: number, data: Partial<RoomRate>) {
  return apiFetch<RoomRate>(`/room-rates/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteRoomRate(id: number) {
  return apiFetch<void>(`/room-rates/${id}`, { method: "DELETE" });
}

export function listRoomRatePeriods(roomId: number) {
  return apiFetch<RoomRatePeriod[]>(`/rooms/${roomId}/rate-periods`);
}

export function createRoomRatePeriod(roomId: number, data: Partial<RoomRatePeriod>) {
  return apiFetch<RoomRatePeriod>(`/rooms/${roomId}/rate-periods`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateRoomRatePeriod(id: number, data: Partial<RoomRatePeriod>) {
  return apiFetch<RoomRatePeriod>(`/room-rate-periods/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteRoomRatePeriod(id: number) {
  return apiFetch<void>(`/room-rate-periods/${id}`, { method: "DELETE" });
}

// Category rates
export function listCategoryRates(categoryId: number) {
  return apiFetch<RoomCategoryRate[]>(`/room-categories/${categoryId}/rates`);
}

export function createCategoryRate(categoryId: number, data: Partial<RoomCategoryRate>) {
  return apiFetch<RoomCategoryRate>(`/room-categories/${categoryId}/rates`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateCategoryRate(id: number, data: Partial<RoomCategoryRate>) {
  return apiFetch<RoomCategoryRate>(`/room-category-rates/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteCategoryRate(id: number) {
  return apiFetch<void>(`/room-category-rates/${id}`, { method: "DELETE" });
}

export function listCategoryRatePeriods(categoryId: number) {
  return apiFetch<RoomCategoryRatePeriod[]>(`/room-categories/${categoryId}/rate-periods`);
}

export function createCategoryRatePeriod(categoryId: number, data: Partial<RoomCategoryRatePeriod>) {
  return apiFetch<RoomCategoryRatePeriod>(`/room-categories/${categoryId}/rate-periods`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateCategoryRatePeriod(id: number, data: Partial<RoomCategoryRatePeriod>) {
  return apiFetch<RoomCategoryRatePeriod>(`/room-category-rate-periods/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteCategoryRatePeriod(id: number) {
  return apiFetch<void>(`/room-category-rate-periods/${id}`, { method: "DELETE" });
}
