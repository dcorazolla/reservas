import React, { useState } from 'react'
import { FiEdit2, FiTrash2, FiChevronUp, FiChevronDown } from 'react-icons/fi'
import BlockStatusBadge from './BlockStatusBadge'
import type { RoomBlock } from '@models/blocks'
import { sortBlocksByDate, getBlockDuration } from '@models/blocks'
import './BlocksList.css'

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
      <div className="blocks-list-loading">
        <div className="spinner"></div>
        <span>Carregando bloqueios...</span>
      </div>
    )
  }

  if (blocks.length === 0) {
    return (
      <div className="blocks-list-empty">
        <h3>Nenhum bloqueio encontrado</h3>
        <p>Crie um novo bloqueio para começar</p>
      </div>
    )
  }

  return (
    <div className="blocks-list-container">
      <table className="blocks-table">
        <thead>
          <tr>
            <th 
              className={`sortable ${sortBy === 'date' ? 'active' : ''}`}
              onClick={() => handleSort('date')}
            >
              <span className="header-content">
                Data Inicial
                {sortBy === 'date' && (
                  <span className="sort-icon">
                    {sortDirection === 'asc' ? <FiChevronUp /> : <FiChevronDown />}
                  </span>
                )}
              </span>
            </th>
            <th>
              <span className="header-content">Data Final</span>
            </th>
            <th 
              className={`sortable ${sortBy === 'type' ? 'active' : ''}`}
              onClick={() => handleSort('type')}
            >
              <span className="header-content">
                Tipo
                {sortBy === 'type' && (
                  <span className="sort-icon">
                    {sortDirection === 'asc' ? <FiChevronUp /> : <FiChevronDown />}
                  </span>
                )}
              </span>
            </th>
            <th 
              className={`sortable ${sortBy === 'duration' ? 'active' : ''}`}
              onClick={() => handleSort('duration')}
            >
              <span className="header-content">
                Dias
                {sortBy === 'duration' && (
                  <span className="sort-icon">
                    {sortDirection === 'asc' ? <FiChevronUp /> : <FiChevronDown />}
                  </span>
                )}
              </span>
            </th>
            <th>Motivo</th>
            <th className="actions-header">Ações</th>
          </tr>
        </thead>
        <tbody>
          {sortedBlocks.map((block) => (
            <tr
              key={block.id}
              className={`blocks-row ${hoveredId === block.id ? 'hovered' : ''} ${onRowClick ? 'clickable' : ''}`}
              onMouseEnter={() => setHoveredId(block.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => onRowClick?.(block)}
            >
              <td className="date-cell">
                <span className="mono">{block.start_date}</span>
              </td>
              <td className="date-cell">
                <span className="mono">{block.end_date}</span>
              </td>
              <td>
                <BlockStatusBadge block={block} size="sm" variant="subtle" />
              </td>
              <td className="number-cell">
                <strong>{getBlockDuration(block)}</strong>
              </td>
              <td className="reason-cell">
                <span className="text-small">{block.reason || '—'}</span>
              </td>
              <td className="actions-cell">
                <div className="action-buttons">
                  {onEdit && (
                    <button
                      className="button-small button-edit"
                      onClick={(e) => {
                        e.stopPropagation()
                        onEdit(block)
                      }}
                      title="Editar bloqueio"
                    >
                      <FiEdit2 size={16} />
                      <span>Editar</span>
                    </button>
                  )}
                  {onDelete && (
                    <button
                      className="button-small button-delete"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDelete(block)
                      }}
                      title="Deletar bloqueio"
                    >
                      <FiTrash2 size={16} />
                      <span>Deletar</span>
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default BlocksList
