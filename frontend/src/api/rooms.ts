import { apiFetch } from "./client";
import { Room } from "../types/room";

export function listRooms() {
  return apiFetch<Room[]>("/rooms");
}

export function createRoom(data: Partial<Room>) {
  return apiFetch<Room>("/rooms", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateRoom(id: number, data: Partial<Room>) {
  return apiFetch<Room>(`/rooms/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteRoom(id: number) {
  return apiFetch<void>(`/rooms/${id}`, {
    method: "DELETE",
  });
}
