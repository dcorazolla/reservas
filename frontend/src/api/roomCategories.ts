import { apiFetch } from "./client";
import type { RoomCategory } from "../types/roomCategory";

export function listRoomCategories() {
  return apiFetch<RoomCategory[]>("/room-categories");
}

export function createRoomCategory(data: Partial<RoomCategory>) {
  return apiFetch<RoomCategory>("/room-categories", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateRoomCategory(id: number, data: Partial<RoomCategory>) {
  return apiFetch<RoomCategory>(`/room-categories/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteRoomCategory(id: number) {
  return apiFetch<void>(`/room-categories/${id}`, {
    method: "DELETE",
  });
}
