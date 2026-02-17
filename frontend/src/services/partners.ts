import { createCrudService } from './crudService'
import type { Partner, PartnerPayload } from '@models/partner'

export type { Partner, PartnerPayload }

const crud = createCrudService<Partner, PartnerPayload>('/api/partners')

export const listPartners = crud.list
export const getPartner = crud.get
export const createPartner = crud.create
export const updatePartner = crud.update
export const deletePartner = crud.remove

export default {
  listPartners,
  getPartner,
  createPartner,
  updatePartner,
  deletePartner,
}
