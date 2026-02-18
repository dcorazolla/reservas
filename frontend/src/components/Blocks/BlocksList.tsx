import React, { useState } from 'react'
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  HStack,
  VStack,
  Text,
  Icon,
  Spinner,
} from '@chakra-ui/react'
import { FiEdit2, FiTrash2, FiChevronUp, FiChevronDown } from 'react-icons/fi'
import BlockStatusBadge from './BlockStatusBadge'
import type { RoomBlock } from '@models/blocks'
import { sortBlocksByDate, getBlockDuration } from '@models/blocks'

interface BlocksListProps {
  blocks: RoomBlock[]
  isLoading?: boolean
  onEdit?: (block: RoomBlock) => void
  onDelete?: (block: RoomBlock) => void
  onRowClick?: (block: RoomBlock) => void
  sortBy?: 'date' | 'type' | 'duration'
  sortDirection?: 'asc' | 'desc'
  onSortChange?: (sortBy: string, direction: 'asc' | 'desc') => void
}

/**
 * Displays a sortable table of room blocks with actions.
 * Supports inline editing/deletion and custom click handlers.
 *
 * @component
 * @example
 * <BlocksList
 *   blocks={blocks}
 *   onEdit={handleEdit}
 *   onDelete={handleDelete}
 * />
 */
export const BlocksList: React.FC<BlocksListProps> = ({
  blocks,
  isLoading = false,
  onEdit,
  onDelete,
  onRowClick,
  sortBy = 'date',
  sortDirection = 'asc',
  onSortChange,
}) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  // Sort blocks
  let sortedBlocks = [...blocks]
  if (sortBy === 'date') {
    sortedBlocks = sortBlocksByDate(sortedBlocks)
    if (sortDirection === 'desc') {
      sortedBlocks.reverse()
    }
  } else if (sortBy === 'type') {
    sortedBlocks.sort((a, b) => {
      const comparison = (a.type || '').localeCompare(b.type || '')
      return sortDirection === 'asc' ? comparison : -comparison
    })
  } else if (sortBy === 'duration') {
    sortedBlocks.sort((a, b) => {
      const durA = getBlockDuration(a)
      const durB = getBlockDuration(b)
      return sortDirection === 'asc' ? durA - durB : durB - durA
    })
  }

  const handleSort = (newSortBy: string) => {
    if (onSortChange) {
      const newDirection =
        sortBy === newSortBy && sortDirection === 'asc' ? 'desc' : 'asc'
      onSortChange(newSortBy, newDirection)
    }
  }

  if (isLoading) {
    return (
      <VStack justify="center" align="center" py={10}>
        <Spinner size="lg" color="blue.500" />
        <Text color="gray.500">Carregando bloqueios...</Text>
      </VStack>
    )
  }

  if (blocks.length === 0) {
    return (
      <VStack justify="center" align="center" py={10}>
        <Text fontSize="lg" color="gray.600" fontWeight="500">
          Nenhum bloqueio encontrado
        </Text>
        <Text fontSize="sm" color="gray.500">
          Crie um novo bloqueio para começar
        </Text>
      </VStack>
    )
  }

  return (
    <Box overflowX="auto">
      <Table variant="striped" colorScheme="gray" size="sm">
        <Thead bg="gray.50">
          <Tr>
            <Th cursor="pointer" onClick={() => handleSort('date')}>
              <HStack spacing={1}>
                <Text>Data Inicial</Text>
                {sortBy === 'date' && (
                  <Icon as={sortDirection === 'asc' ? FiChevronUp : FiChevronDown} />
                )}
              </HStack>
            </Th>
            <Th cursor="pointer" onClick={() => handleSort('date')}>
              <HStack spacing={1}>
                <Text>Data Final</Text>
              </HStack>
            </Th>
            <Th cursor="pointer" onClick={() => handleSort('type')}>
              <HStack spacing={1}>
                <Text>Tipo</Text>
                {sortBy === 'type' && (
                  <Icon as={sortDirection === 'asc' ? FiChevronUp : FiChevronDown} />
                )}
              </HStack>
            </Th>
            <Th cursor="pointer" onClick={() => handleSort('duration')}>
              <HStack spacing={1}>
                <Text>Dias</Text>
                {sortBy === 'duration' && (
                  <Icon as={sortDirection === 'asc' ? FiChevronUp : FiChevronDown} />
                )}
              </HStack>
            </Th>
            <Th>Motivo</Th>
            <Th isNumeric>Ações</Th>
          </Tr>
        </Thead>
        <Tbody>
          {sortedBlocks.map((block) => (
            <Tr
              key={block.id}
              onMouseEnter={() => setHoveredId(block.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => onRowClick?.(block)}
              cursor={onRowClick ? 'pointer' : 'default'}
              bg={hoveredId === block.id ? 'gray.50' : 'transparent'}
              transition="background-color 0.2s"
              _hover={onRowClick ? { bg: 'gray.100' } : {}}
            >
              <Td fontFamily="mono" fontSize="sm">
                {block.start_date}
              </Td>
              <Td fontFamily="mono" fontSize="sm">
                {block.end_date}
              </Td>
              <Td>
                <BlockStatusBadge block={block} size="sm" variant="subtle" />
              </Td>
              <Td isNumeric>
                <Text fontWeight="500">{getBlockDuration(block)}</Text>
              </Td>
              <Td maxW="250px" isTruncated>
                <Text fontSize="sm" color="gray.600">
                  {block.reason || '—'}
                </Text>
              </Td>
              <Td isNumeric>
                <HStack spacing={2} justify="flex-end">
                  {onEdit && (
                    <Button
                      size="sm"
                      variant="ghost"
                      colorScheme="blue"
                      leftIcon={<FiEdit2 />}
                      onClick={(e) => {
                        e.stopPropagation()
                        onEdit(block)
                      }}
                    >
                      Editar
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      size="sm"
                      variant="ghost"
                      colorScheme="red"
                      leftIcon={<FiTrash2 />}
                      onClick={(e) => {
                        e.stopPropagation()
                        onDelete(block)
                      }}
                    >
                      Deletar
                    </Button>
                  )}
                </HStack>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  )
}

export default BlocksList
