import { describe, it, expect, beforeEach, vi } from 'vitest'
import * as blocksService from './blocks'
import type { RoomBlock, RoomBlockInput } from '@models/blocks'

// Mock the api module
vi.mock('./api', () => {
  const mockApi = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  }
  return {
    default: mockApi,
  }
})

import api from './api'

const mockApi = api as any

describe('Blocks Service - CRUD Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const mockBlock: RoomBlock = {
    id: 'block-1',
    property_id: 'prop-1',
    room_id: 'room-1',
    start_date: '2026-02-18',
    end_date: '2026-02-25',
    type: 'maintenance',
    reason: 'Maintenance work',
    recurrence: 'none',
    created_at: '2026-02-18T10:00:00Z',
    updated_at: '2026-02-18T10:00:00Z',
  }

  describe('listBlocks', () => {
    it('calls GET /api/room-blocks with propertyId', async () => {
      mockApi.get.mockResolvedValue({
        data: {
          data: [mockBlock],
          pagination: { current_page: 1, per_page: 15, total: 1, last_page: 1 },
        },
      })

      const result = await blocksService.listBlocks('prop-1')

      expect(mockApi.get).toHaveBeenCalledWith('/api/room-blocks', {
        params: { property_id: 'prop-1' },
      })
      expect(result.data).toHaveLength(1)
    })

    it('applies filters to request', async () => {
      mockApi.get.mockResolvedValue({
        data: { data: [], pagination: {} },
      })

      await blocksService.listBlocks('prop-1', {
        room_id: 'room-1',
        type: 'maintenance',
        recurrence: 'weekly',
        from: '2026-02-01',
        to: '2026-02-28',
        per_page: 20,
      })

      expect(mockApi.get).toHaveBeenCalledWith('/api/room-blocks', {
        params: {
          property_id: 'prop-1',
          room_id: 'room-1',
          type: 'maintenance',
          recurrence: 'weekly',
          from: '2026-02-01',
          to: '2026-02-28',
          per_page: 20,
        },
      })
    })

    it('supports pagination', async () => {
      mockApi.get.mockResolvedValue({
        data: { data: [], pagination: { current_page: 2, per_page: 10 } },
      })

      await blocksService.listBlocks('prop-1', { page: 2, per_page: 10 })

      expect(mockApi.get).toHaveBeenCalledWith('/api/room-blocks', {
        params: {
          property_id: 'prop-1',
          page: 2,
          per_page: 10,
        },
      })
    })
  })

  describe('getBlock', () => {
    it('calls GET /api/room-blocks/{id}', async () => {
      mockApi.get.mockResolvedValue({ data: mockBlock })

      const result = await blocksService.getBlock('prop-1', 'block-1')

      expect(mockApi.get).toHaveBeenCalledWith('/api/room-blocks/block-1', {
        params: { property_id: 'prop-1' },
      })
      expect(result.id).toBe('block-1')
    })
  })

  describe('createBlock', () => {
    it('calls POST /api/room-blocks with data', async () => {
      mockApi.post.mockResolvedValue({ data: mockBlock })

      const input: RoomBlockInput = {
        room_id: 'room-1',
        start_date: '2026-02-18',
        end_date: '2026-02-25',
        type: 'maintenance',
        reason: 'Maintenance work',
      }

      const result = await blocksService.createBlock('prop-1', input)

      expect(mockApi.post).toHaveBeenCalledWith('/api/room-blocks', input, {
        params: { property_id: 'prop-1' },
      })
      expect(result.id).toBe('block-1')
    })

    it('includes recurrence in request', async () => {
      mockApi.post.mockResolvedValue({ data: mockBlock })

      const input: RoomBlockInput = {
        room_id: 'room-1',
        start_date: '2026-02-18',
        end_date: '2026-02-25',
        type: 'maintenance',
        recurrence: 'weekly',
      }

      await blocksService.createBlock('prop-1', input)

      expect(mockApi.post).toHaveBeenCalledWith(
        '/api/room-blocks',
        expect.objectContaining({ recurrence: 'weekly' }),
        expect.any(Object)
      )
    })
  })

  describe('updateBlock', () => {
    it('calls PUT /api/room-blocks/{id} with partial data', async () => {
      mockApi.put.mockResolvedValue({ data: mockBlock })

      const updates = { reason: 'Updated reason' }

      const result = await blocksService.updateBlock('prop-1', 'block-1', updates)

      expect(mockApi.put).toHaveBeenCalledWith(
        '/api/room-blocks/block-1',
        updates,
        {
          params: { property_id: 'prop-1' },
        }
      )
      expect(result.id).toBe('block-1')
    })
  })

  describe('deleteBlock', () => {
    it('calls DELETE /api/room-blocks/{id}', async () => {
      mockApi.delete.mockResolvedValue({})

      await blocksService.deleteBlock('prop-1', 'block-1')

      expect(mockApi.delete).toHaveBeenCalledWith('/api/room-blocks/block-1', {
        params: { property_id: 'prop-1' },
      })
    })
  })
})

describe('Blocks Service - Expand and Helper Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('expandBlocks', () => {
    it('calls GET /api/room-blocks/expand with correct params', async () => {
      mockApi.get.mockResolvedValue({
        data: {
          blocked_dates: ['2026-02-18', '2026-02-19', '2026-02-25'],
        },
      })

      const result = await blocksService.expandBlocks(
        'prop-1',
        'room-1',
        '2026-02-01',
        '2026-02-28'
      )

      expect(mockApi.get).toHaveBeenCalledWith('/api/room-blocks/expand', {
        params: {
          property_id: 'prop-1',
          room_id: 'room-1',
          from: '2026-02-01',
          to: '2026-02-28',
        },
      })
      expect(result).toEqual(['2026-02-18', '2026-02-19', '2026-02-25'])
    })

    it('returns empty array if no blocked_dates in response', async () => {
      mockApi.get.mockResolvedValue({ data: {} })

      const result = await blocksService.expandBlocks(
        'prop-1',
        'room-1',
        '2026-02-01',
        '2026-02-28'
      )

      expect(result).toEqual([])
    })
  })

  describe('createBlockFactory', () => {
    it('creates block with defaults', () => {
      const block = blocksService.createBlockFactory()

      expect(block.room_id).toBe('')
      expect(block.type).toBe('maintenance')
      expect(block.recurrence).toBe('none')
      expect(block.reason).toBe('')
    })

    it('applies overrides', () => {
      const block = blocksService.createBlockFactory({
        room_id: 'room-1',
        type: 'cleaning',
      })

      expect(block.room_id).toBe('room-1')
      expect(block.type).toBe('cleaning')
      expect(block.recurrence).toBe('none')
    })

    it('sets start_date and end_date to today and tomorrow', () => {
      const today = new Date().toISOString().split('T')[0]
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0]

      const block = blocksService.createBlockFactory()

      expect(block.start_date).toBe(today)
      expect(block.end_date).toBe(tomorrow)
    })
  })

  describe('hasBlocksInRange', () => {
    it('returns true if blocks exist in range', async () => {
      mockApi.get.mockResolvedValue({
        data: {
          data: [{ id: 'block-1' }],
        },
      })

      const result = await blocksService.hasBlocksInRange(
        'prop-1',
        'room-1',
        '2026-02-01',
        '2026-02-28'
      )

      expect(result).toBe(true)
    })

    it('returns false if no blocks in range', async () => {
      mockApi.get.mockResolvedValue({
        data: {
          data: [],
        },
      })

      const result = await blocksService.hasBlocksInRange(
        'prop-1',
        'room-1',
        '2026-02-01',
        '2026-02-28'
      )

      expect(result).toBe(false)
    })
  })

  describe('getBlockedDatesForRoom', () => {
    it('returns blocked dates from expand endpoint', async () => {
      const blockedDates = ['2026-02-18', '2026-02-19']
      mockApi.get.mockResolvedValue({
        data: { blocked_dates: blockedDates },
      })

      const result = await blocksService.getBlockedDatesForRoom(
        'prop-1',
        'room-1',
        '2026-02-01',
        '2026-02-28'
      )

      expect(result).toEqual(blockedDates)
    })

    it('returns empty array on error', async () => {
      mockApi.get.mockRejectedValue(new Error('API error'))

      const result = await blocksService.getBlockedDatesForRoom(
        'prop-1',
        'room-1',
        '2026-02-01',
        '2026-02-28'
      )

      expect(result).toEqual([])
    })
  })
})

describe('Blocks Service - Data Formatting', () => {
  describe('formatBlockForApi', () => {
    it('fills in defaults for missing fields', () => {
      const partial = {
        room_id: 'room-1',
        start_date: '2026-02-18',
      }

      const result = blocksService.formatBlockForApi(partial)

      expect(result.room_id).toBe('room-1')
      expect(result.start_date).toBe('2026-02-18')
      expect(result.end_date).toBe('')
      expect(result.type).toBe('maintenance')
      expect(result.reason).toBeNull()
      expect(result.recurrence).toBe('none')
    })

    it('preserves provided values', () => {
      const partial = {
        room_id: 'room-1',
        start_date: '2026-02-18',
        end_date: '2026-02-25',
        type: 'cleaning' as const,
        reason: 'Weekly cleaning',
        recurrence: 'weekly' as const,
      }

      const result = blocksService.formatBlockForApi(partial)

      expect(result).toEqual(partial)
    })
  })
})

describe('Blocks Service - Batch Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createBlocksBatch', () => {
    it('creates multiple blocks', async () => {
      const block1: RoomBlock = {
        id: 'block-1',
        property_id: 'prop-1',
        room_id: 'room-1',
        start_date: '2026-02-01',
        end_date: '2026-02-08',
        type: 'maintenance',
        recurrence: 'none',
      }

      const block2: RoomBlock = {
        id: 'block-2',
        property_id: 'prop-1',
        room_id: 'room-2',
        start_date: '2026-02-10',
        end_date: '2026-02-15',
        type: 'cleaning',
        recurrence: 'none',
      }

      mockApi.post
        .mockResolvedValueOnce({ data: block1 })
        .mockResolvedValueOnce({ data: block2 })

      const inputs: RoomBlockInput[] = [
        {
          room_id: 'room-1',
          start_date: '2026-02-01',
          end_date: '2026-02-08',
          type: 'maintenance',
        },
        {
          room_id: 'room-2',
          start_date: '2026-02-10',
          end_date: '2026-02-15',
          type: 'cleaning',
        },
      ]

      const result = await blocksService.createBlocksBatch('prop-1', inputs)

      expect(result.successful).toHaveLength(2)
      expect(result.failed).toHaveLength(0)
    })

    it('handles partial failures', async () => {
      const block1: RoomBlock = {
        id: 'block-1',
        property_id: 'prop-1',
        room_id: 'room-1',
        start_date: '2026-02-01',
        end_date: '2026-02-08',
        type: 'maintenance',
        recurrence: 'none',
      }

      mockApi.post
        .mockResolvedValueOnce({ data: block1 })
        .mockRejectedValueOnce(new Error('Failed to create block 2'))

      const inputs: RoomBlockInput[] = [
        {
          room_id: 'room-1',
          start_date: '2026-02-01',
          end_date: '2026-02-08',
          type: 'maintenance',
        },
        {
          room_id: 'room-2',
          start_date: '2026-02-10',
          end_date: '2026-02-15',
          type: 'cleaning',
        },
      ]

      const result = await blocksService.createBlocksBatch('prop-1', inputs)

      expect(result.successful).toHaveLength(1)
      expect(result.failed).toHaveLength(1)
    })
  })

  describe('deleteBlocksBatch', () => {
    it('deletes multiple blocks', async () => {
      mockApi.delete
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({})

      const result = await blocksService.deleteBlocksBatch('prop-1', [
        'block-1',
        'block-2',
        'block-3',
      ])

      expect(result.successful).toHaveLength(3)
      expect(result.failed).toHaveLength(0)
    })

    it('handles partial failures in deletion', async () => {
      mockApi.delete
        .mockResolvedValueOnce({})
        .mockRejectedValueOnce(new Error('Failed to delete'))
        .mockResolvedValueOnce({})

      const result = await blocksService.deleteBlocksBatch('prop-1', [
        'block-1',
        'block-2',
        'block-3',
      ])

      expect(result.successful).toHaveLength(2)
      expect(result.failed).toHaveLength(1)
    })
  })
})
