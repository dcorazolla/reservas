import React from 'react'
import Modal from '@components/Shared/Modal/Modal'
import { Skeleton, VStack } from '@chakra-ui/react'
import * as roomCategoriesService from '@services/roomCategories'
import { useTranslation } from 'react-i18next'
import type { Room as ServiceRoom } from '@services/rooms'
import { requiredString, requiredPositiveNumber, runValidation } from '@utils/validation'

export default function EditRoomModal({ isOpen, room, onClose, onSave, loading }: {
  isOpen: boolean
  room?: ServiceRoom | null
  onClose: () => void
  onSave: (r: ServiceRoom) => void
  loading?: boolean
}) {
  const { t } = useTranslation()
  const [form, setForm] = React.useState({ name: '', number: '', room_category_id: '', beds: '1', capacity: '1', notes: '' })
  const [categories, setCategories] = React.useState<any[]>([])
  const [loadingCategories, setLoadingCategories] = React.useState(false)
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  React.useEffect(() => {
    if (isOpen) {
      setForm({ name: room?.name ?? '', number: room?.number ?? '', room_category_id: room?.room_category_id ?? '' })
      setLoadingCategories(true)
      roomCategoriesService
        .listRoomCategories()
        .then((list) => setCategories(list))
        .catch((err) => console.error('Failed to load categories', err))
        .finally(() => setLoadingCategories(false))
      setErrors({})
    }
  }, [isOpen, room])

  function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault()

    const newErrors = runValidation({
      name: [requiredString(form.name, t)],
      beds: [requiredPositiveNumber(form.beds, t)],
      capacity: [requiredPositiveNumber(form.capacity, t)],
    })

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const payload: ServiceRoom = {
      id: room?.id ?? '',
      name: form.name.trim(),
      number: form.number === '' ? null : form.number,
      room_category_id: form.room_category_id === '' ? null : form.room_category_id,
      beds: Number(form.beds),
      capacity: Number(form.capacity),
      active: room?.active ?? true,
      notes: form.notes === '' ? null : form.notes,
    }

    setErrors({})
    onSave(payload)
    onClose()
  }

    if (loading || loadingCategories) {
    return (
      <Modal isOpen={!!isOpen} onClose={onClose} title={t('common.status.loading')} size="md">
        <VStack spacing={3} align="stretch">
          <Skeleton height="36px" />
          <Skeleton height="36px" />
          <Skeleton height="36px" />
        </VStack>
      </Modal>
    )
  }

  return (
    <Modal isOpen={!!isOpen} onClose={onClose} title={room?.id ? t('rooms.form.edit') : t('rooms.form.create')} size="lg">
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
            <div className="form-field full-width">
              <span>{t('rooms.form.name')}</span>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              {errors['name'] ? <div className="field-error">{errors['name']}</div> : null}
            </div>

            <div className="form-field">
              <span>{t('rooms.form.number')}</span>
              <input value={form.number ?? ''} onChange={(e) => setForm({ ...form, number: e.target.value })} />
            </div>

            <div className="form-field">
              <span>{t('rooms.form.category')}</span>
              <select value={form.room_category_id ?? ''} onChange={(e) => setForm({ ...form, room_category_id: e.target.value })}>
                <option value="">{t('rooms.form.category_placeholder')}</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <span>{t('rooms.form.beds')}</span>
              <input type="number" role="spinbutton" min={1} value={form.beds} onChange={(e) => setForm({ ...form, beds: e.target.value })} required />
              {errors['beds'] ? <div className="field-error">{errors['beds']}</div> : null}
            </div>

            <div className="form-field">
              <span>{t('rooms.form.capacity')}</span>
              <input type="number" role="spinbutton" min={1} value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} required />
              {errors['capacity'] ? <div className="field-error">{errors['capacity']}</div> : null}
            </div>

            <div className="form-field full-width">
              <span>{t('rooms.form.notes')}</span>
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>

          <div className="modal-actions full-width">
            <button className="btn btn-ghost" type="button" onClick={onClose}>{t('common.actions.cancel')}</button>
            <button className="btn btn-primary" type="submit">{t('common.actions.save')}</button>
          </div>
        </div>
      </form>
    </Modal>
  )
}
