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

export function getProduct(id: string): Promise<Product> {
  return get<Product>(`/products/${id}`);
}

export function createProduct(payload: Partial<Product>): Promise<Product> {
  return post<Product>(`/products`, payload);
}

export function updateProduct(id: string, payload: Partial<Product>): Promise<Product> {
  return put<Product>(`/products/${id}`, payload);
}

export function deleteProduct(id: string): Promise<void> {
  return del<void>(`/products/${id}`);
}

export function createConsumption(payload: CreateConsumptionPayload) {
  return post<any>('/minibar-consumptions', payload);
}
