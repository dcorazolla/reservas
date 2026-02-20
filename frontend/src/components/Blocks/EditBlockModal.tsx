import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format, parseISO } from 'date-fns'
import Modal from '@components/Shared/Modal/Modal'
import FormField from '@components/Shared/FormField/FormField'
import * as roomsService from '@services/rooms'
import { useTranslation } from 'react-i18next'
import type { RoomBlock } from '@models/blocks'
import { blockSchema, type BlockFormData } from '@models/schemas'

export default function EditBlockModal({ isOpen, block, onClose, onSave, rooms: propsRooms = [] }: {
  isOpen: boolean
  block?: RoomBlock | null
  onClose: () => void
  onSave: (b: any) => Promise<void>
  rooms?: any[]
}) {
  const { t } = useTranslation()
  const [rooms, setRooms] = React.useState<any[]>(propsRooms)
  const [loadingRooms, setLoadingRooms] = React.useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BlockFormData>({
    resolver: zodResolver(blockSchema),
    defaultValues: {
      room_id: '',
      start_date: '',
      end_date: '',
      type: 'maintenance',
      reason: '',
      recurrence: 'none',
    },
  })

  // Load rooms if not provided
  React.useEffect(() => {
    if (propsRooms.length > 0) {
      setRooms(propsRooms)
      return
    }
    if (!isOpen) return
    setLoadingRooms(true)
    roomsService
      .listRooms()
      .then((data) => setRooms(data))
      .catch((err) => console.error('Failed to load rooms', err))
      .finally(() => setLoadingRooms(false))
  }, [isOpen, propsRooms])

  // Reset form when modal opens or block changes
  React.useEffect(() => {
    if (!isOpen) return
    // Extrai apenas YYYY-MM-DD para o input date
    const extractDateOnly = (dateStr: string) => {
      if (!dateStr) return ''
      try {
        // Se vier em ISO format, parse e formata para YYYY-MM-DD
        if (dateStr.includes('T')) {
          return format(parseISO(dateStr), 'yyyy-MM-dd')
        }
        // Senão, assume que já está em YYYY-MM-DD
        return dateStr
      } catch {
        return dateStr.split('T')[0] ?? ''
      }
    }
    
    reset({
      room_id: block?.room_id ?? '',
      start_date: extractDateOnly(block?.start_date ?? ''),
      end_date: extractDateOnly(block?.end_date ?? ''),
      type: block?.type ?? 'maintenance',
      reason: block?.reason ?? '',
      recurrence: block?.recurrence ?? 'none',
    })
  }, [isOpen, block, reset])

  const typeOptions = [
    { value: 'maintenance', label: t('blocks.type.maintenance') },
    { value: 'cleaning', label: t('blocks.type.cleaning') },
    { value: 'private', label: t('blocks.type.private') },
    { value: 'custom', label: t('blocks.type.custom') },
  ]

  const recurrenceOptions = [
    { value: 'none', label: t('common.actions.cancel') === 'Cancelar' ? 'Nenhuma' : 'None' },
    { value: 'daily', label: 'Diária' },
    { value: 'weekly', label: 'Semanal' },
    { value: 'monthly', label: 'Mensal' },
  ]

  const onSubmit = async (data: BlockFormData) => {
    try {
      await onSave(data)
      reset()
    } catch (err) {
      console.error('Failed to save block', err)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={block?.id ? t('blocks.form.edit') : t('blocks.form.new')}>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Room - Primary selection */}
        <FormField label={t('blocks.form.room')} name="room_id" errors={errors}>
          <select {...register('room_id')} disabled={isSubmitting || loadingRooms}>
            <option value="">Selecione um quarto</option>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </FormField>

        {/* Date range - Group on same row */}
        <div className="form-grid form-grid--2col">
          <FormField label={t('blocks.form.start_date')} name="start_date" errors={errors}>
            <input type="date" {...register('start_date')} disabled={isSubmitting} />
          </FormField>

          <FormField label={t('blocks.form.end_date')} name="end_date" errors={errors}>
            <input type="date" {...register('end_date')} disabled={isSubmitting} />
          </FormField>
        </div>

        {/* Type selection */}
        <FormField label={t('blocks.form.type')} name="type" errors={errors}>
          <select {...register('type')} disabled={isSubmitting}>
            <option value="">Selecione um tipo</option>
            {typeOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </FormField>

        {/* Recurrence pattern */}
        <FormField label={t('blocks.form.recurrence')} name="recurrence" errors={errors}>
          <select {...register('recurrence')} disabled={isSubmitting}>
            {recurrenceOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </FormField>

        {/* Optional reason */}
        <FormField label={t('blocks.form.reason')} name="reason" errors={errors}>
          <textarea {...register('reason')} placeholder={t('blocks.form.reason') + ' (opcional)'} rows={3} disabled={isSubmitting} />
        </FormField>

        <div className="modal-actions full-width">
          <button className="btn btn-ghost" type="button" onClick={onClose} disabled={isSubmitting}>
            {t('common.actions.cancel')}
          </button>
          <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? t('common.status.loading') : (block?.id ? t('common.actions.update') : t('common.actions.create'))}
          </button>
        </div>
      </form>
    </Modal>
  )
}
