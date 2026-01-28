import { apiFetch } from "./client";
import type { PropertyPricing } from "../types/rate";

export function getPropertyPricing() {
  return apiFetch<PropertyPricing>(`/properties/pricing`);
}

export function updatePropertyPricing(data: PropertyPricing) {
  return apiFetch<PropertyPricing>(`/properties/pricing`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}
