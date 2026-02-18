import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Modal from '@components/Shared/Modal/Modal'
import {
  BLOCK_TYPE_LABELS,
  BLOCK_RECURRENCE_LABELS,
  validateBlockInput,
} from '@models/blocks'
import type { RoomBlock, RoomBlockInput } from '@models/blocks'
import './BlocksModal.css'

// Define validation schema
const blockSchema = z.object({
  room_id: z.string().min(1, 'Selecione um quarto'),
  start_date: z.string().min(1, 'Data inicial obrigatória'),
  end_date: z.string().min(1, 'Data final obrigatória'),
  type: z.enum(['maintenance', 'cleaning', 'private', 'custom'] as const),
  reason: z.string().optional().nullable(),
  recurrence: z
    .enum(['none', 'daily', 'weekly', 'monthly'] as const)
    .optional(),
})

type BlockFormInput = z.infer<typeof blockSchema>

interface BlocksModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: RoomBlockInput) => Promise<void> | void
  block?: RoomBlock | null
  rooms: Array<{ id: string; name: string }>
  isLoading?: boolean
}

/**
 * Modal for creating or editing room blocks.
 * Includes form validation, date pickers, and type selection.
 *
 * @component
 * @example
 * <BlocksModal
 *   isOpen={isOpen}
 *   onClose={onClose}
 *   onSubmit={handleSubmit}
 *   rooms={rooms}
 * />
 */
export const BlocksModal: React.FC<BlocksModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  block,
  rooms,
  isLoading = false,
}) => {
  const isEditing = !!block
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<BlockFormInput>({
    resolver: zodResolver(blockSchema),
    defaultValues: {
      room_id: block?.room_id || '',
      start_date: block?.start_date || '',
      end_date: block?.end_date || '',
      type: block?.type || 'maintenance',
      reason: block?.reason || '',
      recurrence: block?.recurrence || 'none',
    },
  })

  const startDate = watch('start_date')
  const endDate = watch('end_date')

  // Validate date range
  const isDateRangeValid =
    !startDate || !endDate || startDate < endDate

  useEffect(() => {
    if (isOpen && block) {
      reset({
        room_id: block.room_id,
        start_date: block.start_date,
        end_date: block.end_date,
        type: block.type as any,
        reason: block.reason,
        recurrence: block.recurrence as any,
      })
    } else if (isOpen && !block) {
      reset({
        room_id: '',
        start_date: '',
        end_date: '',
        type: 'maintenance',
        reason: '',
        recurrence: 'none',
      })
    }
  }, [isOpen, block, reset])

  const handleFormSubmit = async (formData: BlockFormInput) => {
    // Validate input
    const validation = validateBlockInput(formData)
    if (!validation.isValid) {
      console.error('Validation errors:', validation.errors)
      return
    }

    try {
      await onSubmit(formData)
      reset()
      onClose()
    } catch (error) {
      console.error('Failed to submit block:', error)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="blocks-modal-content">
        <div className="blocks-modal-header">
          <h2>{isEditing ? 'Editar Bloqueio' : 'Novo Bloqueio'}</h2>
          <button
            className="close-button"
            onClick={onClose}
            aria-label="Fechar"
            disabled={isSubmitting || isLoading}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="blocks-modal-form">
          {/* Room Selection */}
          <div className="form-group">
            <label htmlFor="room_id">Quarto</label>
            <select
              id="room_id"
              {...register('room_id')}
              disabled={isSubmitting || isLoading}
              className={errors.room_id ? 'error' : ''}
            >
              <option value="">Selecione um quarto</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name}
                </option>
              ))}
            </select>
            {errors.room_id && (
              <span className="error-message">{errors.room_id.message}</span>
            )}
          </div>

          {/* Block Type */}
          <div className="form-group">
            <label htmlFor="type">Tipo de Bloqueio</label>
            <select
              id="type"
              {...register('type')}
              disabled={isSubmitting || isLoading}
            >
              {Object.entries(BLOCK_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="start_date">Data Inicial</label>
              <input
                id="start_date"
                type="date"
                {...register('start_date')}
                disabled={isSubmitting || isLoading}
                className={errors.start_date ? 'error' : ''}
              />
              {errors.start_date && (
                <span className="error-message">{errors.start_date.message}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="end_date">Data Final</label>
              <input
                id="end_date"
                type="date"
                {...register('end_date')}
                disabled={isSubmitting || isLoading}
                className={errors.end_date ? 'error' : ''}
              />
              {errors.end_date && (
                <span className="error-message">{errors.end_date.message}</span>
              )}
            </div>
          </div>

          {/* Date Range Validation Message */}
          {startDate && endDate && !isDateRangeValid && (
            <div className="validation-error">
              <p>Data final deve ser posterior à data inicial</p>
            </div>
          )}

          {/* Recurrence */}
          <div className="form-group">
            <label htmlFor="recurrence">Recorrência</label>
            <select
              id="recurrence"
              {...register('recurrence')}
              disabled={isSubmitting || isLoading}
            >
              {Object.entries(BLOCK_RECURRENCE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <small className="help-text">
              Semanal: repete todo terça (se iniciar terça), etc.<br />
              Mensal: repete no mesmo dia de cada mês
            </small>
          </div>

          {/* Reason */}
          <div className="form-group">
            <label htmlFor="reason">Motivo (opcional)</label>
            <textarea
              id="reason"
              {...register('reason')}
              placeholder="Ex: Manutenção de tubulação, Limpeza profunda..."
              rows={3}
              disabled={isSubmitting || isLoading}
            />
          </div>

          {/* Buttons */}
          <div className="blocks-modal-footer">
            <button
              type="button"
              className="button button-ghost"
              onClick={onClose}
              disabled={isSubmitting || isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="button button-primary"
              disabled={!isDateRangeValid || isSubmitting || isLoading}
            >
              {isSubmitting || isLoading ? (
                <span>Processando...</span>
              ) : isEditing ? (
                'Atualizar'
              ) : (
                'Criar'
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  )
}

export default BlocksModal
