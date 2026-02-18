import React from 'react'
import { Badge, Box, Tooltip } from '@chakra-ui/react'
import { getBlockTypeLabel, getBlockTypeColor, isBlockActive } from '@models/blocks'
import type { RoomBlock } from '@models/blocks'

interface BlockStatusBadgeProps {
  block: RoomBlock
  variant?: 'solid' | 'subtle' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  showDescription?: boolean
}

/**
 * Displays a visual badge for a room block with type-specific color coding.
 * Used in lists, tables, and inline displays to quickly identify block types.
 *
 * @component
 * @example
 * <BlockStatusBadge block={block} variant="solid" size="md" />
 */
export const BlockStatusBadge: React.FC<BlockStatusBadgeProps> = ({
  block,
  variant = 'solid',
  size = 'md',
  showDescription = false,
}) => {
  const isActive = isBlockActive(block)
  const typeLabel = getBlockTypeLabel(block.type)
  const bgColor = getBlockTypeColor(block.type)

  const badge = (
    <Badge
      colorScheme={bgColor}
      variant={variant}
      fontSize={size === 'sm' ? 'xs' : size === 'lg' ? 'sm' : '0.75rem'}
      px={size === 'sm' ? 2 : size === 'lg' ? 4 : 3}
      py={size === 'sm' ? 1 : size === 'lg' ? 2 : 1}
      borderRadius="md"
      opacity={isActive ? 1 : 0.6}
      cursor="default"
      transition="all 0.2s"
      _hover={isActive ? { transform: 'scale(1.05)' } : {}}
    >
      <Box as="span" display="flex" alignItems="center" gap={1}>
        {getTypeIcon(block.type)}
        {typeLabel}
      </Box>
    </Badge>
  )

  if (!showDescription && !block.reason) {
    return badge
  }

  const description = block.reason || `${typeLabel} block`
  const dateRange = `${block.start_date} to ${block.end_date}`
  const tooltipLabel = `${description}\n${dateRange}${!isActive ? '\n(Inactive)' : ''}`

  return <Tooltip label={tooltipLabel}>{badge}</Tooltip>
}

/**
 * Returns an emoji icon for a block type
 */
function getTypeIcon(type: string): string {
  switch (type) {
    case 'maintenance':
      return '🔧'
    case 'cleaning':
      return '🧹'
    case 'private':
      return '🔒'
    case 'custom':
      return '📌'
    default:
      return '⚠️'
  }
}

export default BlockStatusBadge
