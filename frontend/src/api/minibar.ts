import { get, post } from "./client";

export type Product = {
  id: string;
  name: string;
  sku?: string | null;
  price?: number | null;
  stock?: number | null;
  active?: boolean;
  description?: string | null;
};

export type CreateConsumptionPayload = {
  reservation_id?: string | null;
  room_id?: string | null;
  product_id?: string | null;
  description?: string | null;
  quantity?: number;
  unit_price?: number | null;
};

export function listProducts(): Promise<Product[]> {
  return get<Product[]>("/products");
}

export function createConsumption(payload: CreateConsumptionPayload) {
  return post<any>('/minibar-consumptions', payload);
}
