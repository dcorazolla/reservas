import { describe, it, expect } from 'vitest'
import {
  BlockType,
  BlockRecurrence,
  BLOCK_TYPE_LABELS,
  BLOCK_RECURRENCE_LABELS,
  BLOCK_TYPE_COLORS,
  isDateBlocked,
  isDateRangeBlocked,
  getBlockTypeLabel,
  getBlockRecurrenceLabel,
  getBlockTypeColor,
  isBlockActive,
  getBlockDescription,
  getBlockDuration,
  expandBlockDates,
  sortBlocksByDate,
  groupBlocksByType,
  validateBlockInput,
  type RoomBlock,
} from './blocks'

describe('RoomBlock Models - Enums and Constants', () => {
  it('BlockType enum has all values', () => {
    expect(BlockType.MAINTENANCE).toBe('maintenance')
    expect(BlockType.CLEANING).toBe('cleaning')
    expect(BlockType.PRIVATE).toBe('private')
    expect(BlockType.CUSTOM).toBe('custom')
  })

  it('BlockRecurrence enum has all values', () => {
    expect(BlockRecurrence.NONE).toBe('none')
    expect(BlockRecurrence.DAILY).toBe('daily')
    expect(BlockRecurrence.WEEKLY).toBe('weekly')
    expect(BlockRecurrence.MONTHLY).toBe('monthly')
  })

  it('BLOCK_TYPE_LABELS has all types', () => {
    expect(BLOCK_TYPE_LABELS[BlockType.MAINTENANCE]).toBe('Manutenção')
    expect(BLOCK_TYPE_LABELS[BlockType.CLEANING]).toBe('Limpeza')
    expect(BLOCK_TYPE_LABELS[BlockType.PRIVATE]).toBe('Privado')
    expect(BLOCK_TYPE_LABELS[BlockType.CUSTOM]).toBe('Customizado')
  })

  it('BLOCK_RECURRENCE_LABELS has all recurrences', () => {
    expect(BLOCK_RECURRENCE_LABELS[BlockRecurrence.NONE]).toBe('Nenhuma')
    expect(BLOCK_RECURRENCE_LABELS[BlockRecurrence.DAILY]).toBe('Diária')
    expect(BLOCK_RECURRENCE_LABELS[BlockRecurrence.WEEKLY]).toBe('Semanal')
    expect(BLOCK_RECURRENCE_LABELS[BlockRecurrence.MONTHLY]).toBe('Mensal')
  })

  it('BLOCK_TYPE_COLORS has all types with valid hex colors', () => {
    Object.values(BlockType).forEach((type) => {
      const color = BLOCK_TYPE_COLORS[type]
      expect(color).toMatch(/^#[0-9A-F]{6}$/i)
    })
  })
})

describe('RoomBlock Models - isDateBlocked', () => {
  const createBlock = (overrides: Partial<RoomBlock> = {}): RoomBlock => ({
    id: 'block-1',
    property_id: 'prop-1',
    room_id: 'room-1',
    start_date: '2026-02-18',
    end_date: '2026-02-25',
    type: BlockType.MAINTENANCE,
    recurrence: BlockRecurrence.NONE,
    ...overrides,
  })

  it('returns true for date within non-recurring block', () => {
    const block = createBlock()
    expect(isDateBlocked('2026-02-20', block)).toBe(true)
  })

  it('returns false for date before block', () => {
    const block = createBlock()
    expect(isDateBlocked('2026-02-17', block)).toBe(false)
  })

  it('returns false for date at end_date (exclusive)', () => {
    const block = createBlock()
    expect(isDateBlocked('2026-02-25', block)).toBe(false)
  })

  it('returns true for date at start_date', () => {
    const block = createBlock()
    expect(isDateBlocked('2026-02-18', block)).toBe(true)
  })

  it('handles Date objects as input', () => {
    const block = createBlock()
    const date = new Date('2026-02-20')
    expect(isDateBlocked(date, block)).toBe(true)
  })

  it('returns true for daily recurrence (all dates in range)', () => {
    const block = createBlock({ recurrence: BlockRecurrence.DAILY })
    expect(isDateBlocked('2026-02-18', block)).toBe(true)
    expect(isDateBlocked('2026-02-19', block)).toBe(true)
    expect(isDateBlocked('2026-02-24', block)).toBe(true)
  })

  it('returns true for weekly recurrence (same day of week)', () => {
    const block = createBlock({
      start_date: '2026-02-18', // Wednesday
      end_date: '2026-03-04', // extended to include Feb 25
      recurrence: BlockRecurrence.WEEKLY,
    })
    expect(isDateBlocked('2026-02-18', block)).toBe(true) // day 0
    expect(isDateBlocked('2026-02-25', block)).toBe(true) // day 7 (same day of week)
    expect(isDateBlocked('2026-02-19', block)).toBe(false) // Thursday (not matching)
  })

  it('returns true for monthly recurrence (same day of month)', () => {
    const block = createBlock({
      start_date: '2026-02-15',
      end_date: '2026-04-15',
      recurrence: BlockRecurrence.MONTHLY,
    })
    expect(isDateBlocked('2026-02-15', block)).toBe(true) // day 15
    expect(isDateBlocked('2026-03-15', block)).toBe(true) // day 15 of next month
    expect(isDateBlocked('2026-02-16', block)).toBe(false) // day 16
  })
})

describe('RoomBlock Models - isDateRangeBlocked', () => {
  const createBlock = (overrides: Partial<RoomBlock> = {}): RoomBlock => ({
    id: 'block-1',
    property_id: 'prop-1',
    room_id: 'room-1',
    start_date: '2026-02-18',
    end_date: '2026-02-25',
    type: BlockType.MAINTENANCE,
    recurrence: BlockRecurrence.NONE,
    ...overrides,
  })

  it('returns false for empty blocks array', () => {
    expect(isDateRangeBlocked('2026-02-20', '2026-02-22', [])).toBe(false)
  })

  it('returns true if range overlaps with block', () => {
    const block = createBlock()
    expect(isDateRangeBlocked('2026-02-20', '2026-02-23', [block])).toBe(true)
  })

  it('returns false if range does not overlap with block', () => {
    const block = createBlock()
    expect(isDateRangeBlocked('2026-02-26', '2026-03-02', [block])).toBe(false)
  })

  it('returns true if range completely contains block', () => {
    const block = createBlock()
    expect(isDateRangeBlocked('2026-02-01', '2026-03-01', [block])).toBe(true)
  })

  it('returns true if range partially overlaps with block', () => {
    const block = createBlock()
    expect(isDateRangeBlocked('2026-02-23', '2026-02-28', [block])).toBe(true)
  })

  it('handles multiple blocks', () => {
    const block1 = createBlock({ start_date: '2026-02-10', end_date: '2026-02-15' })
    const block2 = createBlock({ start_date: '2026-02-20', end_date: '2026-02-25' })

    expect(isDateRangeBlocked('2026-02-12', '2026-02-14', [block1, block2])).toBe(true)
    expect(isDateRangeBlocked('2026-02-22', '2026-02-24', [block1, block2])).toBe(true)
    expect(isDateRangeBlocked('2026-02-16', '2026-02-19', [block1, block2])).toBe(false)
  })
})

describe('RoomBlock Models - Label and Color Functions', () => {
  it('getBlockTypeLabel returns correct label', () => {
    expect(getBlockTypeLabel(BlockType.MAINTENANCE)).toBe('Manutenção')
    expect(getBlockTypeLabel(BlockType.CLEANING)).toBe('Limpeza')
  })

  it('getBlockTypeLabel returns fallback for unknown type', () => {
    expect(getBlockTypeLabel('unknown' as BlockType)).toBe('unknown')
  })

  it('getBlockRecurrenceLabel returns correct label', () => {
    expect(getBlockRecurrenceLabel(BlockRecurrence.WEEKLY)).toBe('Semanal')
    expect(getBlockRecurrenceLabel(BlockRecurrence.MONTHLY)).toBe('Mensal')
  })

  it('getBlockTypeColor returns valid hex color', () => {
    const color = getBlockTypeColor(BlockType.MAINTENANCE)
    expect(color).toMatch(/^#[0-9A-F]{6}$/i)
  })

  it('getBlockTypeColor returns fallback for unknown type', () => {
    expect(getBlockTypeColor('unknown' as BlockType)).toBe('#999999')
  })
})

describe('RoomBlock Models - isBlockActive', () => {
  const createBlock = (overrides: Partial<RoomBlock> = {}): RoomBlock => ({
    id: 'block-1',
    property_id: 'prop-1',
    room_id: 'room-1',
    start_date: '2026-02-18',
    end_date: '2026-02-25',
    type: BlockType.MAINTENANCE,
    recurrence: BlockRecurrence.NONE,
    ...overrides,
  })

  it('returns true for future block', () => {
    const block = createBlock({
      start_date: '2026-03-01',
      end_date: '2026-03-10',
    })
    const today = new Date('2026-02-20')
    expect(isBlockActive(block, today)).toBe(true)
  })

  it('returns true for ongoing block', () => {
    const block = createBlock({
      start_date: '2026-02-18',
      end_date: '2026-02-25',
    })
    const today = new Date('2026-02-20')
    expect(isBlockActive(block, today)).toBe(true)
  })

  it('returns false for expired block', () => {
    const block = createBlock({
      start_date: '2026-02-10',
      end_date: '2026-02-15',
    })
    const today = new Date('2026-02-20')
    expect(isBlockActive(block, today)).toBe(false)
  })
})

describe('RoomBlock Models - getBlockDescription', () => {
  const createBlock = (overrides: Partial<RoomBlock> = {}): RoomBlock => ({
    id: 'block-1',
    property_id: 'prop-1',
    room_id: 'room-1',
    start_date: '2026-02-18',
    end_date: '2026-02-25',
    type: BlockType.MAINTENANCE,
    recurrence: BlockRecurrence.NONE,
    ...overrides,
  })

  it('returns description for non-recurring block', () => {
    const block = createBlock()
    const desc = getBlockDescription(block)
    expect(desc).toContain('Manutenção')
    expect(desc).toContain('fev')
  })

  it('includes recurrence label for recurring blocks', () => {
    const block = createBlock({ recurrence: BlockRecurrence.WEEKLY })
    const desc = getBlockDescription(block)
    expect(desc).toContain('semanal')
  })

  it('includes cleaning type for cleaning blocks', () => {
    const block = createBlock({ type: BlockType.CLEANING })
    const desc = getBlockDescription(block)
    expect(desc).toContain('Limpeza')
  })
})

describe('RoomBlock Models - getBlockDuration', () => {
  const createBlock = (overrides: Partial<RoomBlock> = {}): RoomBlock => ({
    id: 'block-1',
    property_id: 'prop-1',
    room_id: 'room-1',
    start_date: '2026-02-18',
    end_date: '2026-02-25',
    type: BlockType.MAINTENANCE,
    recurrence: BlockRecurrence.NONE,
    ...overrides,
  })

  it('returns correct duration in days', () => {
    const block = createBlock()
    expect(getBlockDuration(block)).toBe(7) // Feb 18 to Feb 25
  })

  it('returns 1 for single day block', () => {
    const block = createBlock({
      start_date: '2026-02-18',
      end_date: '2026-02-19',
    })
    expect(getBlockDuration(block)).toBe(1)
  })

  it('handles multi-week blocks', () => {
    const block = createBlock({
      start_date: '2026-02-01',
      end_date: '2026-02-29',
    })
    expect(getBlockDuration(block)).toBe(28)
  })
})

describe('RoomBlock Models - expandBlockDates', () => {
  const createBlock = (overrides: Partial<RoomBlock> = {}): RoomBlock => ({
    id: 'block-1',
    property_id: 'prop-1',
    room_id: 'room-1',
    start_date: '2026-02-18',
    end_date: '2026-02-25',
    type: BlockType.MAINTENANCE,
    recurrence: BlockRecurrence.NONE,
    ...overrides,
  })

  it('expands non-recurring block to all dates in range', () => {
    const block = createBlock()
    const dates = expandBlockDates(block, '2026-02-18', '2026-02-25')
    expect(dates).toHaveLength(7)
    expect(dates).toContain('2026-02-18')
    expect(dates).toContain('2026-02-24')
    expect(dates).not.toContain('2026-02-25')
  })

  it('expands daily recurring block', () => {
    const block = createBlock({ recurrence: BlockRecurrence.DAILY })
    const dates = expandBlockDates(block, '2026-02-18', '2026-02-21')
    expect(dates).toHaveLength(3)
  })

  it('expands weekly recurring block', () => {
    const block = createBlock({
      start_date: '2026-02-18', // Wednesday
      end_date: '2026-04-18',
      recurrence: BlockRecurrence.WEEKLY,
    })
    const dates = expandBlockDates(block, '2026-02-18', '2026-03-04')
    // Should include Feb 18 and Feb 25 (7 days later)
    expect(dates).toContain('2026-02-18')
    expect(dates).toContain('2026-02-25')
    expect(dates.length).toBeGreaterThan(0)
  })

  it('respects range boundaries', () => {
    const block = createBlock()
    const dates = expandBlockDates(block, '2026-02-20', '2026-02-23')
    // Should only include dates within the requested range
    expect(dates).not.toContain('2026-02-18')
    expect(dates).not.toContain('2026-02-24')
    expect(dates.every((d) => d >= '2026-02-20' && d < '2026-02-23')).toBe(true)
  })
})

describe('RoomBlock Models - sortBlocksByDate', () => {
  const createBlock = (startDate: string): RoomBlock => ({
    id: `block-${startDate}`,
    property_id: 'prop-1',
    room_id: 'room-1',
    start_date: startDate,
    end_date: new Date(new Date(startDate).getTime() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    type: BlockType.MAINTENANCE,
    recurrence: BlockRecurrence.NONE,
  })

  it('sorts blocks by start date ascending', () => {
    const blocks = [
      createBlock('2026-02-25'),
      createBlock('2026-02-18'),
      createBlock('2026-03-01'),
    ]

    const sorted = sortBlocksByDate(blocks)

    expect(sorted[0].start_date).toBe('2026-02-18')
    expect(sorted[1].start_date).toBe('2026-02-25')
    expect(sorted[2].start_date).toBe('2026-03-01')
  })

  it('does not mutate original array', () => {
    const blocks = [
      createBlock('2026-02-25'),
      createBlock('2026-02-18'),
    ]
    const original = [...blocks]

    sortBlocksByDate(blocks)

    expect(blocks).toEqual(original)
  })
})

describe('RoomBlock Models - groupBlocksByType', () => {
  const createBlock = (type: BlockType): RoomBlock => ({
    id: `block-${type}`,
    property_id: 'prop-1',
    room_id: 'room-1',
    start_date: '2026-02-18',
    end_date: '2026-02-25',
    type,
    recurrence: BlockRecurrence.NONE,
  })

  it('groups blocks by type', () => {
    const blocks = [
      createBlock(BlockType.MAINTENANCE),
      createBlock(BlockType.CLEANING),
      createBlock(BlockType.MAINTENANCE),
      createBlock(BlockType.CUSTOM),
    ]

    const grouped = groupBlocksByType(blocks)

    expect(grouped[BlockType.MAINTENANCE]).toHaveLength(2)
    expect(grouped[BlockType.CLEANING]).toHaveLength(1)
    expect(grouped[BlockType.CUSTOM]).toHaveLength(1)
    expect(grouped[BlockType.PRIVATE]).toHaveLength(0)
  })

  it('returns all types even if empty', () => {
    const grouped = groupBlocksByType([])

    expect(Object.keys(grouped)).toHaveLength(4)
    expect(grouped[BlockType.MAINTENANCE]).toHaveLength(0)
    expect(grouped[BlockType.CLEANING]).toHaveLength(0)
    expect(grouped[BlockType.PRIVATE]).toHaveLength(0)
    expect(grouped[BlockType.CUSTOM]).toHaveLength(0)
  })
})

describe('RoomBlock Models - validateBlockInput', () => {
  it('returns no errors for valid input', () => {
    const input = {
      room_id: 'room-1',
      start_date: '2026-02-18',
      end_date: '2026-02-25',
      type: BlockType.MAINTENANCE,
    }
    expect(validateBlockInput(input)).toHaveLength(0)
  })

  it('validates required fields', () => {
    expect(validateBlockInput({})).toContain('Quarto é obrigatório')
    expect(validateBlockInput({})).toContain('Data inicial é obrigatória')
    expect(validateBlockInput({})).toContain('Data final é obrigatória')
    expect(validateBlockInput({})).toContain('Tipo de bloqueio inválido')
  })

  it('validates end_date > start_date', () => {
    const input = {
      start_date: '2026-02-25',
      end_date: '2026-02-18',
      type: BlockType.MAINTENANCE,
    }
    expect(validateBlockInput(input)).toContain(
      'Data final deve ser posterior à data inicial'
    )
  })

  it('validates equal start and end dates', () => {
    const input = {
      start_date: '2026-02-18',
      end_date: '2026-02-18',
      type: BlockType.MAINTENANCE,
    }
    expect(validateBlockInput(input)).toContain(
      'Data final deve ser posterior à data inicial'
    )
  })

  it('validates block type', () => {
    const input = {
      room_id: 'room-1',
      start_date: '2026-02-18',
      end_date: '2026-02-25',
      type: 'invalid' as BlockType,
    }
    expect(validateBlockInput(input)).toContain('Tipo de bloqueio inválido')
  })

  it('allows optional recurrence field', () => {
    const input = {
      room_id: 'room-1',
      start_date: '2026-02-18',
      end_date: '2026-02-25',
      type: BlockType.MAINTENANCE,
    }
    expect(validateBlockInput(input)).toHaveLength(0)
  })
})
