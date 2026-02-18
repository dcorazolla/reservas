import { createCrudService } from './crudService'
import type { RoomBlock, RoomBlockPayload } from '@models/blocks'

export type { RoomBlock, RoomBlockPayload }

const crud = createCrudService<RoomBlock, RoomBlockPayload>('/api/room-blocks')

export const listBlocks  = crud.list
export const getBlock    = crud.get
export const createBlock = crud.create
export const updateBlock = crud.update
export const deleteBlock = crud.remove

export default {
  listBlocks,
  getBlock,
  createBlock,
  updateBlock,
  deleteBlock,
}
