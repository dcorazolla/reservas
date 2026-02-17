import { createCrudService } from './crudService'

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

const crud = createCrudService<Property, PropertyPayload>('/api/properties')

export const listProperties  = crud.list
export const getProperty     = crud.get
export const createProperty  = crud.create
export const updateProperty  = crud.update
export const deleteProperty  = crud.remove

export default {
  listProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
}
