import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Modal from '@components/Shared/Modal/Modal'
import FormField from '@components/Shared/FormField/FormField'
import SkeletonFields from '@components/Shared/Skeleton/SkeletonFields'
import * as ratesService from '@services/roomCategoryRates'
import { useTranslation } from 'react-i18next'
import { roomCategorySchema, type RoomCategoryFormData } from '@models/schemas'

type Props = {
  isOpen: boolean
  category: { id?: string; name: string; description?: string | null } | null
  onClose: () => void
  onSave: (c: any) => void
}

export default function EditRoomCategoryModal({ isOpen, category, onClose, onSave }: Props) {
  const { t } = useTranslation()
  const [showRates, setShowRates] = React.useState<boolean>(false)
  const [rate, setRate] = React.useState<any | null>(null)
  const [rateLoading, setRateLoading] = React.useState<boolean>(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RoomCategoryFormData>({
    resolver: zodResolver(roomCategorySchema),
    defaultValues: { name: '', description: '' },
  })

  // Separate form for rates (not validated by zod — optional fields)
  const [rateForm, setRateForm] = React.useState({
    base_one_adult: '' as string | number,
    base_two_adults: '' as string | number,
    additional_adult: '' as string | number,
    child_price: '' as string | number,
  })

  React.useEffect(() => {
    if (isOpen) {
      setShowRates(false)
      reset({ name: category?.name ?? '', description: category?.description ?? '' })
      // load existing rates for category when editing
      if (category?.id) {
        setRateLoading(true)
        ratesService
          .listRates(category.id)
          .then((list) => {
            const r = list[0] ?? null
            setRate(r)
            if (r) {
              setRateForm({
                base_one_adult: r.base_one_adult ?? '',
                base_two_adults: r.base_two_adults ?? '',
                additional_adult: r.additional_adult ?? '',
                child_price: r.child_price ?? '',
              })
            }
          })
          .catch((err) => console.error('Failed to load rates', err))
          .finally(() => setRateLoading(false))
      } else {
        setRate(null)
        setRateForm({ base_one_adult: '', base_two_adults: '', additional_adult: '', child_price: '' })
      }
    }
  }, [isOpen, category, reset])

  function onFormSubmit(data: RoomCategoryFormData) {
    const payload: any = { ...data }
    if (category?.id) payload['id'] = category.id
    if (showRates) {
      payload['_rates'] = {
        id: rate?.id,
        base_one_adult: rateForm.base_one_adult !== '' ? Number(rateForm.base_one_adult) : null,
        base_two_adults: rateForm.base_two_adults !== '' ? Number(rateForm.base_two_adults) : null,
        additional_adult: rateForm.additional_adult !== '' ? Number(rateForm.additional_adult) : null,
        child_price: rateForm.child_price !== '' ? Number(rateForm.child_price) : null,
      }
    }

    onSave(payload)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={category?.id ? t('roomCategories.form.edit') : t('roomCategories.form.new')} size="lg">
      <form onSubmit={handleSubmit(onFormSubmit)}>
        <div className="form-grid">
          <FormField label={t('roomCategories.form.name')} name="name" errors={errors} className="full-width">
            <input {...register('name')} required />
          </FormField>

          <FormField label={t('roomCategories.form.description')} name="description" errors={errors} className="full-width">
            <textarea {...register('description')} />
          </FormField>

          <div className="rate-group">
            <div className="rate-group-header">
              <strong>{t('roomCategories.form.rate_group_title')}</strong>
              <button type="button" className="group-toggle" onClick={() => setShowRates((s) => !s)} aria-expanded={showRates}>
                {showRates ? t('common.pricing.hide_rates') : t('common.pricing.show_rates')}
              </button>
            </div>

            <div className={`rate-group-content ${showRates ? 'expanded' : 'collapsed'}`}>
              {rateLoading ? (
                <SkeletonFields rows={4} />
              ) : (
                <>
                  <div className="form-field">
                    <span>{t('common.pricing.one_adult')}</span>
                    <input type="number" value={rateForm.base_one_adult} onChange={(e) => setRateForm({ ...rateForm, base_one_adult: e.target.value })} />
                  </div>

                  <div className="form-field">
                    <span>{t('common.pricing.two_adults')}</span>
                    <input type="number" value={rateForm.base_two_adults} onChange={(e) => setRateForm({ ...rateForm, base_two_adults: e.target.value })} />
                  </div>

                  <div className="form-field">
                    <span>{t('common.pricing.additional_adult')}</span>
                    <input type="number" value={rateForm.additional_adult} onChange={(e) => setRateForm({ ...rateForm, additional_adult: e.target.value })} />
                  </div>

                  <div className="form-field">
                    <span>{t('common.pricing.child_price')}</span>
                    <input type="number" step="0.01" value={rateForm.child_price} onChange={(e) => setRateForm({ ...rateForm, child_price: e.target.value })} />
                  </div>
                </>
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
