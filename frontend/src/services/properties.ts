import api from './api'

export type PropertyPayload = {
  name: string
  timezone: string
  infant_max_age?: number | null
  child_max_age?: number | null
  child_factor?: number | null
  base_one_adult?: number | null
  base_two_adults?: number | null
  additional_adult?: number | null
  child_price?: number | null
}

export type Property = {
  id: string
  name: string
  timezone: string
  infant_max_age?: number | null
  child_max_age?: number | null
  child_factor?: number | null
  base_one_adult?: number | null
  base_two_adults?: number | null
  additional_adult?: number | null
  child_price?: number | null
}

const BASE = '/api/properties'

export async function listProperties(): Promise<Property[]> {
  const resp = await api.get<Property[]>(BASE)
  return resp.data
}

export async function getProperty(id: string): Promise<Property> {
  const resp = await api.get<Property>(`${BASE}/${id}`)
  return resp.data
}

export async function createProperty(payload: PropertyPayload): Promise<Property> {
  const resp = await api.post<Property>(BASE, payload)
  return resp.data
}

export async function updateProperty(id: string, payload: PropertyPayload): Promise<Property> {
  const resp = await api.put<Property>(`${BASE}/${id}`, payload)
  return resp.data
}

export async function deleteProperty(id: string): Promise<void> {
  await api.delete(`${BASE}/${id}`)
}

export default {
  listProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
}
