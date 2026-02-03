import { apiFetch } from './client';
import type { Partner } from '../types/partner';

export function listPartners() {
  return apiFetch<Partner[]>('/partners');
}

export function createPartner(data: Partial<Partner>) {
  return apiFetch<Partner>('/partners', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updatePartner(id: string, data: Partial<Partner>) {
  return apiFetch<Partner>(`/partners/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function deletePartner(id: string) {
  return apiFetch<void>(`/partners/${id}`, {
    method: 'DELETE',
  });
}

export function getPartner(id: string) {
  return apiFetch<Partner>(`/partners/${id}`);
}
