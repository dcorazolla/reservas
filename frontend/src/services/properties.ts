import { createCrudService } from './crudService'
import type { Property, PropertyPayload } from '@models/property'

export type { Property, PropertyPayload }

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
