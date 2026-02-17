import React from 'react'
import Modal from '@components/Shared/Modal/Modal'
import { Box, Button } from '@chakra-ui/react'
import './room-category-modal.css'
import * as ratesService from '@services/roomCategoryRates'
import { useTranslation } from 'react-i18next'

type Props = {
  isOpen: boolean
  category: { id?: string; name: string; description?: string | null } | null
  onClose: () => void
  onSave: (c: any) => void
}

export default function EditRoomCategoryModal({ isOpen, category, onClose, onSave }: Props) {
  const { t } = useTranslation()
  const [form, setForm] = React.useState({ name: '', description: '' })
  const [showRates, setShowRates] = React.useState<boolean>(false)
  const [rate, setRate] = React.useState<any | null>(null)
  const [rateLoading, setRateLoading] = React.useState<boolean>(false)
  const [rateErrors, setRateErrors] = React.useState<Record<string, string>>({})

  React.useEffect(() => {
    if (isOpen) {
      setForm({ name: category?.name ?? '', description: category?.description ?? '' })
      // load existing rates for category when editing
      if (category?.id) {
        setRateLoading(true)
        ratesService
          .listRates(category.id)
          .then((list) => {
            setRate(list[0] ?? null)
          })
          .catch((err) => console.error('Failed to load rates', err))
          .finally(() => setRateLoading(false))
      } else {
        setRate(null)
      }
    }
  }, [isOpen, category])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const payload: any = { ...form }
    if (category?.id) payload['id'] = category.id
    if (showRates) {
      payload['_rates'] = {
        id: rate?.id,
        base_one_adult: rate?.base_one_adult !== undefined && rate?.base_one_adult !== '' ? Number(rate.base_one_adult) : null,
        base_two_adults: rate?.base_two_adults !== undefined && rate?.base_two_adults !== '' ? Number(rate.base_two_adults) : null,
        additional_adult: rate?.additional_adult !== undefined && rate?.additional_adult !== '' ? Number(rate.additional_adult) : null,
        child_price: rate?.child_price !== undefined && rate?.child_price !== '' ? Number(rate.child_price) : null,
      }
    }

    onSave(payload)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={category?.id ? t('roomCategories.form.edit') : t('roomCategories.form.new')}>
      <div className="room-category-form-grid">
        <div className="room-category-field full-width">
          <span>{t('roomCategories.form.name')}</span>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </div>

        <div className="room-category-field full-width">
          <span>{t('roomCategories.form.description')}</span>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>

        <div className="rate-group">
          <div className="rate-group-header">
            <strong>{t('roomCategories.form.rate_group_title')}</strong>
            <button type="button" className="group-toggle" onClick={() => setShowRates((s) => !s)} aria-expanded={showRates}>
              {showRates ? t('common.pricing.hide_rates') : t('common.pricing.show_rates')}
            </button>
          </div>

          <div className={`rate-group-content ${showRates ? 'expanded' : 'collapsed'}`}>
            {rateLoading ? (
              <div>Loading...</div>
            ) : (
              <>
                <div className="room-category-field">
                  <span>{t('common.pricing.one_adult')}</span>
                  <input type="number" value={rate?.base_one_adult ?? ''} onChange={(e) => setRate({ ...(rate ?? {}), base_one_adult: e.target.value })} />
                </div>

                <div className="room-category-field">
                  <span>{t('common.pricing.two_adults')}</span>
                  <input type="number" value={rate?.base_two_adults ?? ''} onChange={(e) => setRate({ ...(rate ?? {}), base_two_adults: e.target.value })} />
                </div>

                <div className="room-category-field">
                  <span>{t('common.pricing.additional_adult')}</span>
                  <input type="number" value={rate?.additional_adult ?? ''} onChange={(e) => setRate({ ...(rate ?? {}), additional_adult: e.target.value })} />
                </div>

                <div className="room-category-field">
                  <span>{t('common.pricing.child_price')}</span>
                  <input type="number" step="0.01" value={rate?.child_price ?? ''} onChange={(e) => setRate({ ...(rate ?? {}), child_price: e.target.value })} />
                </div>
              </>
            )}
          </div>
        </div>

        <div className="modal-actions full-width">
          <Button variant="ghost" onClick={onClose}>{t('common.actions.cancel')}</Button>
          <Button colorScheme="blue" type="submit" onClick={(e) => { e.preventDefault(); handleSubmit(e); }}>{t('common.actions.save')}</Button>
        </div>
      </div>
    </Modal>
  )
}
