/**
 * Room Blocks (Bloqueios) Domain Models
 * Types and interfaces for room availability blocking/maintenance periods
 */

/**
 * Block Type - classification of blocking reason
 */
export enum BlockType {
  MAINTENANCE = 'maintenance',
  CLEANING = 'cleaning',
  PRIVATE = 'private',
  CUSTOM = 'custom',
}

/**
 * Recurrence pattern for blocks
 */
export enum BlockRecurrence {
  NONE = 'none',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
}

/**
 * Core RoomBlock entity
 */
export interface RoomBlock {
  id: string // UUID
  property_id: string // UUID
  room_id: string // UUID
  start_date: string // YYYY-MM-DD
  end_date: string // YYYY-MM-DD
  type: BlockType
  reason?: string | null
  recurrence: BlockRecurrence
  created_by?: string | null // UUID of user who created it
  created_at?: string
  updated_at?: string
}

/**
 * Request payload for creating/updating a block
 */
export interface RoomBlockInput {
  room_id: string // UUID
  start_date: string // YYYY-MM-DD
  end_date: string // YYYY-MM-DD
  type: BlockType
  reason?: string | null
  recurrence?: BlockRecurrence // defaults to NONE
}

/**
 * Response from GET /room-blocks/expand endpoint
 * Contains all blocked dates in a range (including expanded recurrences)
 */
export interface ExpandBlocksResponse {
  blocked_dates: string[] // array of YYYY-MM-DD dates
}

/**
 * Filter parameters for listing blocks
 */
export interface RoomBlockFilters {
  room_id?: string
  type?: BlockType
  recurrence?: BlockRecurrence
  from?: string // YYYY-MM-DD
  to?: string // YYYY-MM-DD
  per_page?: number
  page?: number
}

/**
 * Paginated response from GET /room-blocks
 */
export interface RoomBlocksResponse {
  data: RoomBlock[]
  pagination?: {
    current_page: number
    per_page: number
    total: number
    last_page: number
  }
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Block type labels for UI display
 */
export const BLOCK_TYPE_LABELS: Record<BlockType, string> = {
  [BlockType.MAINTENANCE]: 'Manutenção',
  [BlockType.CLEANING]: 'Limpeza',
  [BlockType.PRIVATE]: 'Privado',
  [BlockType.CUSTOM]: 'Customizado',
}

/**
 * Block recurrence labels for UI display
 */
export const BLOCK_RECURRENCE_LABELS: Record<BlockRecurrence, string> = {
  [BlockRecurrence.NONE]: 'Nenhuma',
  [BlockRecurrence.DAILY]: 'Diária',
  [BlockRecurrence.WEEKLY]: 'Semanal',
  [BlockRecurrence.MONTHLY]: 'Mensal',
}

/**
 * Block type colors - for visual differentiation in calendar
 */
export const BLOCK_TYPE_COLORS: Record<BlockType, string> = {
  [BlockType.MAINTENANCE]: '#8B7355', // brown
  [BlockType.CLEANING]: '#4A90E2', // blue
  [BlockType.PRIVATE]: '#F5A623', // orange
  [BlockType.CUSTOM]: '#BD10E0', // purple
}

/**
 * Default block durations (in days) - quick preset
 */
export const BLOCK_PRESETS = {
  ONE_DAY: 1,
  ONE_WEEK: 7,
  TWO_WEEKS: 14,
  ONE_MONTH: 30,
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check if a specific date is blocked by a room block
 * Considers recurrence patterns
 */
export function isDateBlocked(
  date: Date | string,
  block: RoomBlock
): boolean {
  const checkDate = typeof date === 'string' ? new Date(date) : date
  const startDate = new Date(block.start_date)
  const endDate = new Date(block.end_date)

  // Date must be within block range
  if (checkDate < startDate || checkDate >= endDate) {
    return false
  }

  // Non-recurring blocks: date is in range = blocked
  if (block.recurrence === BlockRecurrence.NONE) {
    return true
  }

  // Recurring blocks: check if date matches recurrence pattern
  const dayDiff = Math.floor(
    (checkDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  )

  switch (block.recurrence) {
    case BlockRecurrence.DAILY:
      return true

    case BlockRecurrence.WEEKLY:
      return dayDiff % 7 === 0

    case BlockRecurrence.MONTHLY:
      return checkDate.getDate() === startDate.getDate()

    default:
      return false
  }
}

/**
 * Check if a date range overlaps with any blocks
 */
export function isDateRangeBlocked(
  startDate: string | Date,
  endDate: string | Date,
  blocks: RoomBlock[]
): boolean {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate

  for (const block of blocks) {
    const blockStart = new Date(block.start_date)
    const blockEnd = new Date(block.end_date)

    // Check each day of the range against the block
    let current = new Date(start)
    while (current < end) {
      if (isDateBlocked(current, block)) {
        return true
      }
      current.setDate(current.getDate() + 1)
    }
  }

  return false
}

/**
 * Get display label for a block type
 */
export function getBlockTypeLabel(type: BlockType): string {
  return BLOCK_TYPE_LABELS[type] ?? type
}

/**
 * Get display label for a recurrence
 */
export function getBlockRecurrenceLabel(recurrence: BlockRecurrence): string {
  return BLOCK_RECURRENCE_LABELS[recurrence] ?? recurrence
}

/**
 * Get color for a block type
 */
export function getBlockTypeColor(type: BlockType): string {
  return BLOCK_TYPE_COLORS[type] ?? '#999999' // fallback gray
}

/**
 * Check if a block is currently active (today or in the future)
 */
export function isBlockActive(block: RoomBlock, referenceDate?: Date): boolean {
  const today = referenceDate ?? new Date()
  const endDate = new Date(block.end_date)
  return today < endDate
}

/**
 * Get readable description of a block (e.g., "Manutenção - 18 fev a 25 fev")
 */
export function getBlockDescription(block: RoomBlock, locale: string = 'pt-BR'): string {
  const typeLabel = getBlockTypeLabel(block.type)
  const start = new Date(block.start_date)
  const end = new Date(block.end_date)

  const formatter = new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
  })

  const startStr = formatter.format(start)
  const endStr = formatter.format(end)

  let desc = `${typeLabel} - ${startStr} a ${endStr}`

  if (block.recurrence !== BlockRecurrence.NONE) {
    const recLabel = getBlockRecurrenceLabel(block.recurrence).toLowerCase()
    desc += ` (${recLabel})`
  }

  return desc
}

/**
 * Calculate the number of days a block spans
 */
export function getBlockDuration(block: RoomBlock): number {
  const start = new Date(block.start_date)
  const end = new Date(block.end_date)
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
}

/**
 * Expand a recurring block into individual dates within a range
 * Returns array of YYYY-MM-DD strings
 */
export function expandBlockDates(
  block: RoomBlock,
  rangeStart: string | Date,
  rangeEnd: string | Date
): string[] {
  const blockStart = new Date(block.start_date)
  const blockEnd = new Date(block.end_date)
  const start = typeof rangeStart === 'string' ? new Date(rangeStart) : rangeStart
  const end = typeof rangeEnd === 'string' ? new Date(rangeEnd) : rangeEnd

  const dates: string[] = []

  if (block.recurrence === BlockRecurrence.NONE) {
    // Non-recurring: add all dates in range
    let current = new Date(Math.max(blockStart.getTime(), start.getTime()))
    while (current < Math.min(blockEnd.getTime(), end.getTime())) {
      dates.push(current.toISOString().split('T')[0])
      current.setDate(current.getDate() + 1)
    }
  } else {
    // Recurring: expand based on pattern
    let current = new Date(Math.max(blockStart.getTime(), start.getTime()))
    while (current < Math.min(blockEnd.getTime(), end.getTime())) {
      if (isDateBlocked(current, block)) {
        dates.push(current.toISOString().split('T')[0])
      }
      current.setDate(current.getDate() + 1)
    }
  }

  return dates
}

/**
 * Sort blocks by start date ascending
 */
export function sortBlocksByDate(blocks: RoomBlock[]): RoomBlock[] {
  return [...blocks].sort((a, b) => {
    const dateA = new Date(a.start_date).getTime()
    const dateB = new Date(b.start_date).getTime()
    return dateA - dateB
  })
}

/**
 * Group blocks by type
 */
export function groupBlocksByType(blocks: RoomBlock[]): Record<BlockType, RoomBlock[]> {
  const grouped: Record<BlockType, RoomBlock[]> = {
    [BlockType.MAINTENANCE]: [],
    [BlockType.CLEANING]: [],
    [BlockType.PRIVATE]: [],
    [BlockType.CUSTOM]: [],
  }

  for (const block of blocks) {
    grouped[block.type].push(block)
  }

  return grouped
}

/**
 * Validate block data before sending to API
 */
export function validateBlockInput(data: Partial<RoomBlockInput>): string[] {
  const errors: string[] = []

  if (!data.room_id) {
    errors.push('Quarto é obrigatório')
  }

  if (!data.start_date) {
    errors.push('Data inicial é obrigatória')
  }

  if (!data.end_date) {
    errors.push('Data final é obrigatória')
  }

  if (data.start_date && data.end_date) {
    const start = new Date(data.start_date)
    const end = new Date(data.end_date)

    if (end <= start) {
      errors.push('Data final deve ser posterior à data inicial')
    }
  }

  if (!data.type || !Object.values(BlockType).includes(data.type)) {
    errors.push('Tipo de bloqueio inválido')
  }

  return errors
}
