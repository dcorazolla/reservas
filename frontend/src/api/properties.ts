import { apiFetch } from "./client";
import type { Property } from "../types/property";

export function listProperties() {
  return apiFetch<Property[]>("/properties");
}

export function createProperty(data: Partial<Property>) {
  return apiFetch<Property>("/properties", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateProperty(id: number, data: Partial<Property>) {
  return apiFetch<Property>(`/properties/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteProperty(id: number) {
  return apiFetch<void>(`/properties/${id}`, {
    method: "DELETE",
  });
}
