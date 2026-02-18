/**
 * Room Blocks Service
 * CRUD operations and utilities for room blocks (availability blocking)
 */

import api from './api'
import type {
  RoomBlock,
  RoomBlockInput,
  RoomBlockFilters,
  RoomBlocksResponse,
  ExpandBlocksResponse,
} from '@models/blocks'

/**
 * Fetch paginated list of room blocks with filters
 */
export async function listBlocks(
  propertyId: string,
  filters: RoomBlockFilters = {}
) {
  const params: Record<string, unknown> = {
    property_id: propertyId,
  }

  if (filters.room_id) params.room_id = filters.room_id
  if (filters.type) params.type = filters.type
  if (filters.recurrence) params.recurrence = filters.recurrence
  if (filters.from) params.from = filters.from
  if (filters.to) params.to = filters.to
  if (filters.per_page) params.per_page = filters.per_page
  if (filters.page) params.page = filters.page

  const response = await api.get<RoomBlocksResponse>('/api/room-blocks', {
    params,
  })
  return response.data
}

/**
 * Get a single room block by ID
 */
export async function getBlock(propertyId: string, id: string) {
  const response = await api.get<RoomBlock>(`/api/room-blocks/${id}`, {
    params: { property_id: propertyId },
  })
  return response.data
}

/**
 * Create a new room block
 */
export async function createBlock(propertyId: string, data: RoomBlockInput) {
  const response = await api.post<RoomBlock>('/api/room-blocks', data, {
    params: { property_id: propertyId },
  })
  return response.data
}

/**
 * Update an existing room block
 */
export async function updateBlock(
  propertyId: string,
  id: string,
  data: Partial<RoomBlockInput>
) {
  const response = await api.put<RoomBlock>(`/api/room-blocks/${id}`, data, {
    params: { property_id: propertyId },
  })
  return response.data
}

/**
 * Delete a room block
 */
export async function deleteBlock(propertyId: string, id: string) {
  await api.delete(`/api/room-blocks/${id}`, {
    params: { property_id: propertyId },
  })
}

/**
 * Expand recurring blocks to get all blocked dates in a range
 * Returns array of YYYY-MM-DD strings for all blocked dates
 */
export async function expandBlocks(
  propertyId: string,
  roomId: string,
  from: string,
  to: string
) {
  const response = await api.get<ExpandBlocksResponse>('/api/room-blocks/expand', {
    params: {
      property_id: propertyId,
      room_id: roomId,
      from,
      to,
    },
  })
  return response.data.blocked_dates || []
}

/**
 * Factory function for creating a new block with defaults
 */
export function createBlockFactory(overrides: Partial<RoomBlockInput> = {}): RoomBlockInput {
  return {
    room_id: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    type: 'maintenance' as const,
    reason: '',
    recurrence: 'none' as const,
    ...overrides,
  }
}

/**
 * Helper to check if any blocks exist for a room in a date range
 */
export async function hasBlocksInRange(
  propertyId: string,
  roomId: string,
  from: string,
  to: string
): Promise<boolean> {
  const result = await listBlocks(propertyId, {
    room_id: roomId,
    from,
    to,
  })
  return (result.data && result.data.length > 0) || false
}

/**
 * Get all blocked dates for a room in a range
 * Handles both recurring and non-recurring blocks
 */
export async function getBlockedDatesForRoom(
  propertyId: string,
  roomId: string,
  from: string,
  to: string
): Promise<string[]> {
  try {
    return await expandBlocks(propertyId, roomId, from, to)
  } catch {
    // Fallback to empty array if expand endpoint fails
    console.warn('Failed to expand blocks, returning empty array')
    return []
  }
}

/**
 * Format block data for API submission
 * Ensures all required fields are present and properly formatted
 */
export function formatBlockForApi(block: Partial<RoomBlockInput>): RoomBlockInput {
  return {
    room_id: block.room_id || '',
    start_date: block.start_date || '',
    end_date: block.end_date || '',
    type: block.type || 'maintenance',
    reason: block.reason || null,
    recurrence: block.recurrence || 'none',
  }
}

/**
 * Batch create multiple blocks
 * Useful for bulk operations
 */
export async function createBlocksBatch(
  propertyId: string,
  blocks: RoomBlockInput[]
) {
  const results = await Promise.allSettled(
    blocks.map((block) => createBlock(propertyId, block))
  )

  return {
    successful: results
      .filter((r): r is PromiseFulfilledResult<RoomBlock> => r.status === 'fulfilled')
      .map((r) => r.value),
    failed: results
      .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
      .map((r) => r.reason),
  }
}

/**
 * Batch delete multiple blocks
 */
export async function deleteBlocksBatch(
  propertyId: string,
  blockIds: string[]
) {
  const results = await Promise.allSettled(
    blockIds.map((id) => deleteBlock(propertyId, id))
  )

  return {
    successful: blockIds.filter(
      (_, i) => results[i].status === 'fulfilled'
    ),
    failed: blockIds.filter(
      (_, i) => results[i].status === 'rejected'
    ),
  }
}
