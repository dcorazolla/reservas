import { apiFetch } from "./client";
import type { RoomRate, RoomRatePeriod, RoomCategoryRate, RoomCategoryRatePeriod } from "../types/rate";

export function listRoomRates(roomId: string) {
  return apiFetch<RoomRate[]>(`/rooms/${roomId}/rates`);
}

export function createRoomRate(roomId: string, data: Partial<RoomRate>) {
  return apiFetch<RoomRate>(`/rooms/${roomId}/rates`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateRoomRate(id: string, data: Partial<RoomRate>) {
  return apiFetch<RoomRate>(`/room-rates/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteRoomRate(id: string) {
  return apiFetch<void>(`/room-rates/${id}`, { method: "DELETE" });
}

export function listRoomRatePeriods(roomId: string) {
  return apiFetch<RoomRatePeriod[]>(`/rooms/${roomId}/rate-periods`);
}

export function createRoomRatePeriod(roomId: string, data: Partial<RoomRatePeriod>) {
  return apiFetch<RoomRatePeriod>(`/rooms/${roomId}/rate-periods`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateRoomRatePeriod(id: string, data: Partial<RoomRatePeriod>) {
  return apiFetch<RoomRatePeriod>(`/room-rate-periods/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteRoomRatePeriod(id: string) {
  return apiFetch<void>(`/room-rate-periods/${id}`, { method: "DELETE" });
}

// Category rates
export function listCategoryRates(categoryId: string) {
  return apiFetch<RoomCategoryRate[]>(`/room-categories/${categoryId}/rates`);
}

export function createCategoryRate(categoryId: string, data: Partial<RoomCategoryRate>) {
  return apiFetch<RoomCategoryRate>(`/room-categories/${categoryId}/rates`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateCategoryRate(id: string, data: Partial<RoomCategoryRate>) {
  return apiFetch<RoomCategoryRate>(`/room-category-rates/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteCategoryRate(id: string) {
  return apiFetch<void>(`/room-category-rates/${id}`, { method: "DELETE" });
}

export function listCategoryRatePeriods(categoryId: string) {
  return apiFetch<RoomCategoryRatePeriod[]>(`/room-categories/${categoryId}/rate-periods`);
}

export function createCategoryRatePeriod(categoryId: string, data: Partial<RoomCategoryRatePeriod>) {
  return apiFetch<RoomCategoryRatePeriod>(`/room-categories/${categoryId}/rate-periods`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateCategoryRatePeriod(id: string, data: Partial<RoomCategoryRatePeriod>) {
  return apiFetch<RoomCategoryRatePeriod>(`/room-category-rate-periods/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteCategoryRatePeriod(id: string) {
  return apiFetch<void>(`/room-category-rate-periods/${id}`, { method: "DELETE" });
}
