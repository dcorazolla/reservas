import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Modal from '@components/Shared/Modal/Modal'
import FormField from '@components/Shared/FormField/FormField'
import CurrencyInput from '@components/Shared/CurrencyInput/CurrencyInput'
import type { Property } from '@models/property'
import { propertySchema, type PropertyFormData } from '@models/schemas'
import { useTranslation } from 'react-i18next'

const COMMON_TIMEZONES = [
  'UTC',
  'Europe/Lisbon',
  'Europe/London',
  'Europe/Paris',
  'America/Sao_Paulo',
  'America/New_York',
  'America/Los_Angeles',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney',
]

export default function EditPropertyModal({
  isOpen,
  onClose,
  property,
  onSave,
}: {
  isOpen: boolean
  onClose: () => void
  property?: Property | null
  onSave: (p: Property) => void
}) {
  const { t } = useTranslation()
  const [showRates, setShowRates] = useState<boolean>(false)

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      name: '',
      timezone: 'UTC',
      infant_max_age: undefined,
      child_max_age: undefined,
      child_factor: undefined,
      base_one_adult: undefined,
      base_two_adults: undefined,
      additional_adult: undefined,
      child_price: undefined,
    },
  })

  useEffect(() => {
    if (isOpen) {
      setShowRates(false)
      if (property) {
        reset({
          name: property.name ?? '',
          timezone: property.timezone ?? 'UTC',
          infant_max_age: property.infant_max_age ?? undefined,
          child_max_age: property.child_max_age ?? undefined,
          child_factor: property.child_factor ?? undefined,
          base_one_adult: property.base_one_adult ?? undefined,
          base_two_adults: property.base_two_adults ?? undefined,
          additional_adult: property.additional_adult ?? undefined,
          child_price: property.child_price ?? undefined,
        })
      } else {
        reset({
          name: '',
          timezone: 'UTC',
          infant_max_age: undefined,
          child_max_age: undefined,
          child_factor: undefined,
          base_one_adult: undefined,
          base_two_adults: undefined,
          additional_adult: undefined,
          child_price: undefined,
        })
      }
    }
  }, [property, isOpen, reset])

  function onFormSubmit(data: PropertyFormData) {
    const payload: Property = {
      id: property?.id ?? '',
      name: data.name.trim(),
      timezone: data.timezone,
      infant_max_age: data.infant_max_age,
      child_max_age: data.child_max_age,
      child_factor: data.child_factor,
      base_one_adult: data.base_one_adult,
      base_two_adults: data.base_two_adults,
      additional_adult: data.additional_adult,
      child_price: data.child_price,
    }

    onSave(payload)
    onClose()
  }

  function onFormError() {
    // expand tariff section if any tariff field has error
    const tariffKeys = ['child_factor', 'child_price', 'base_one_adult', 'base_two_adults', 'additional_adult'] as const
    if (tariffKeys.some((k) => errors[k])) {
      setShowRates(true)
    }
  }

  return (
    <Modal isOpen={!!isOpen} onClose={onClose} title={property ? t('properties.form.edit') : t('properties.form.new')} size="lg">
      <form onSubmit={handleSubmit(onFormSubmit, onFormError)}>
        <div className="form-grid">
          <FormField label={t('properties.form.name')} name="name" errors={errors} className="full-width">
            <input {...register('name')} />
          </FormField>

          <FormField label={t('properties.form.timezone')} name="timezone" errors={errors} className="full-width">
            <select {...register('timezone')}>
              {COMMON_TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </FormField>

          <FormField label={t('common.pricing.infant_max_age')} name="infant_max_age" errors={errors} className="number">
            <input type="number" {...register('infant_max_age')} />
          </FormField>

          <FormField label={t('common.pricing.child_max_age')} name="child_max_age" errors={errors} className="number">
            <input type="number" {...register('child_max_age')} />
          </FormField>

          <div className="rate-group">
            <div className="rate-group-header">
              <strong>{t('properties.form.base_rates_title')}</strong>
              <button className="group-toggle" type="button" aria-expanded={showRates} onClick={() => setShowRates((s) => !s)}>
                {showRates ? t('common.pricing.hide_rates') : t('common.pricing.show_rates')}
              </button>
            </div>

            <div className={`rate-group-content ${showRates ? 'expanded' : 'collapsed'}`}>
              <FormField label={t('common.pricing.child_factor')} name="child_factor" errors={errors} className="number">
                <CurrencyInput name="child_factor" control={control} decimalScale={2} />
              </FormField>

              <FormField label={t('common.pricing.child_price')} name="child_price" errors={errors} className="number">
                <CurrencyInput name="child_price" control={control} decimalScale={2} />
              </FormField>

              <FormField label={t('common.pricing.one_adult')} name="base_one_adult" errors={errors} className="number">
                <CurrencyInput name="base_one_adult" control={control} decimalScale={2} />
              </FormField>

              <FormField label={t('common.pricing.two_adults')} name="base_two_adults" errors={errors} className="number">
                <CurrencyInput name="base_two_adults" control={control} decimalScale={2} />
              </FormField>

              <FormField label={t('common.pricing.additional_adult')} name="additional_adult" errors={errors} className="number">
                <CurrencyInput name="additional_adult" control={control} decimalScale={2} />
              </FormField>
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
