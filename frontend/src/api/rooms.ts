import { apiFetch } from "./client";
import type { Room } from "../types/room";

export function listRooms() {
  return apiFetch<Room[]>("/rooms");
}

export function createRoom(data: Partial<Room>) {
  return apiFetch<Room>("/rooms", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateRoom(id: string, data: Partial<Room>) {
  return apiFetch<Room>(`/rooms/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteRoom(id: string) {
  return apiFetch<void>(`/rooms/${id}`, {
    method: "DELETE",
  });
}
