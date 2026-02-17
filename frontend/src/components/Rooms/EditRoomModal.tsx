import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Modal from '@components/Shared/Modal/Modal'
import FormField from '@components/Shared/FormField/FormField'
import SkeletonFields from '@components/Shared/Skeleton/SkeletonFields'
import * as roomCategoriesService from '@services/roomCategories'
import * as roomRatesService from '@services/roomRates'
import { useTranslation } from 'react-i18next'
import type { Room } from '@models/room'
import { roomSchema, type RoomFormData } from '@models/schemas'

/** Map people_count → existing i18n key (1–7); fallback to interpolated key */
const RATE_LABEL_KEYS: Record<number, string> = {
  1: 'common.pricing.one_adult',
  2: 'common.pricing.two_adults',
  3: 'common.pricing.trhee_adults',
  4: 'common.pricing.four_adults',
  5: 'common.pricing.five_adults',
  6: 'common.pricing.six_adults',
  7: 'common.pricing.seven_adults',
}

function rateLabelKey(n: number): string {
  return RATE_LABEL_KEYS[n] ?? 'common.pricing.price_n_people'
}

export default function EditRoomModal({ isOpen, room, onClose, onSave }: {
  isOpen: boolean
  room?: Room | null
  onClose: () => void
  onSave: (r: Room) => void
}) {
  const { t } = useTranslation()
  const [categories, setCategories] = React.useState<any[]>([])
  const [loadingCategories, setLoadingCategories] = React.useState(false)
  const [showRates, setShowRates] = React.useState(false)
  const [rateLoading, setRateLoading] = React.useState(false)
  // rates indexed by people_count: { [people_count]: { id?, price_per_day } }
  const [rateValues, setRateValues] = React.useState<Record<number, { id?: string; price_per_day: string | number }>>({})

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<RoomFormData>({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      name: '',
      number: '',
      room_category_id: '',
      beds: 1,
      capacity: 1,
      notes: '',
    },
  })

  const capacityValue = watch('capacity')
  const capacityNum = Number(capacityValue) || 1

  React.useEffect(() => {
    if (isOpen) {
      setShowRates(false)
      reset({
        name: room?.name ?? '',
        number: room?.number ?? '',
        room_category_id: room?.room_category_id ?? '',
        beds: room?.beds ?? 1,
        capacity: room?.capacity ?? 1,
        notes: room?.notes ?? '',
      })
      setLoadingCategories(true)
      roomCategoriesService
        .listRoomCategories()
        .then((list) => setCategories(list))
        .catch((err) => console.error('Failed to load categories', err))
        .finally(() => setLoadingCategories(false))

      // load existing rates when editing
      if (room?.id) {
        setRateLoading(true)
        roomRatesService
          .listRates(room.id)
          .then((list) => {
            const map: Record<number, { id?: string; price_per_day: string | number }> = {}
            for (const r of list) {
              map[r.people_count] = { id: r.id, price_per_day: r.price_per_day }
            }
            setRateValues(map)
          })
          .catch((err) => console.error('Failed to load room rates', err))
          .finally(() => setRateLoading(false))
      } else {
        setRateValues({})
      }
    }
  }, [isOpen, room, reset])

  function onFormSubmit(data: RoomFormData) {
    const payload: any = {
      id: room?.id ?? '',
      name: data.name.trim(),
      number: data.number === '' ? null : (data.number ?? null),
      room_category_id: data.room_category_id === '' ? null : (data.room_category_id ?? null),
      beds: data.beds,
      capacity: data.capacity,
      active: room?.active ?? true,
      notes: data.notes === '' ? null : (data.notes ?? null),
    }

    if (showRates) {
      const cap = Number(data.capacity) || 1
      const rates: Array<{ id?: string; people_count: number; price_per_day: number | null }> = []
      // include fields visible in the form (1..capacity)
      for (let i = 1; i <= cap; i++) {
        const entry = rateValues[i]
        rates.push({
          id: entry?.id,
          people_count: i,
          price_per_day: entry && entry.price_per_day !== '' ? Number(entry.price_per_day) : null,
        })
      }
      // include orphan rates (people_count > new capacity) so they can be deleted
      for (const [key, entry] of Object.entries(rateValues)) {
        const pc = Number(key)
        if (pc > cap && entry.id) {
          rates.push({
            id: entry.id,
            people_count: pc,
            price_per_day: null, // signals deletion
          })
        }
      }
      payload._rates = rates
    }

    onSave(payload)
    onClose()
  }

  function handleRateChange(peopleCount: number, value: string) {
    setRateValues((prev) => ({
      ...prev,
      [peopleCount]: { ...prev[peopleCount], price_per_day: value },
    }))
  }

  return (
    <Modal isOpen={!!isOpen} onClose={onClose} title={room?.id ? t('rooms.form.edit') : t('rooms.form.create')} size="lg">
      <form onSubmit={handleSubmit(onFormSubmit)}>
        <div className="form-grid">
          <FormField label={t('rooms.form.name')} name="name" errors={errors} className="full-width">
            <input {...register('name')} />
          </FormField>

          <FormField label={t('rooms.form.number')} name="number" errors={errors}>
            <input {...register('number')} />
          </FormField>

          <FormField label={t('rooms.form.category')} name="room_category_id" errors={errors}>
            <select {...register('room_category_id')} disabled={loadingCategories}>
              <option value="">{loadingCategories ? t('common.status.loading') : t('rooms.form.category_placeholder')}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </FormField>

          <FormField label={t('rooms.form.beds')} name="beds" errors={errors}>
            <input type="number" role="spinbutton" min={1} {...register('beds')} />
          </FormField>

          <FormField label={t('rooms.form.capacity')} name="capacity" errors={errors}>
            <input type="number" role="spinbutton" min={1} {...register('capacity')} />
          </FormField>

          <FormField label={t('rooms.form.notes')} name="notes" errors={errors} className="full-width">
            <textarea {...register('notes')} />
          </FormField>

          <div className="rate-group">
            <div className="rate-group-header">
              <strong>{t('rooms.form.rate_group_title')}</strong>
              <button type="button" className="group-toggle" onClick={() => setShowRates((s) => !s)} aria-expanded={showRates}>
                {showRates ? t('common.pricing.hide_rates') : t('common.pricing.show_rates')}
              </button>
            </div>

            <div className={`rate-group-content ${showRates ? 'expanded' : 'collapsed'}`}>
              {rateLoading ? (
                <SkeletonFields rows={capacityNum} />
              ) : (
                Array.from({ length: capacityNum }, (_, i) => i + 1).map((n) => (
                  <div className="form-field" key={n}>
                    <span>{t(rateLabelKey(n), { count: n })}</span>
                    <input
                      type="number"
                      step="0.01"
                      min={0}
                      data-testid={`rate-${n}`}
                      value={rateValues[n]?.price_per_day ?? ''}
                      onChange={(e) => handleRateChange(n, e.target.value)}
                    />
                  </div>
                ))
              )}
            </div>
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
