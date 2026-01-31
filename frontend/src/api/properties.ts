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

export function updateProperty(id: string, data: Partial<Property>) {
  return apiFetch<Property>(`/properties/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteProperty(id: string) {
  return apiFetch<void>(`/properties/${id}`, {
    method: "DELETE",
  });
}
