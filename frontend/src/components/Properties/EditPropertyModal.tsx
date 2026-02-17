import React, { useEffect, useState } from 'react'
import Modal from '@components/Shared/Modal/Modal'
import type { Property as ServiceProperty } from '@services/properties'
import { Skeleton, VStack } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { requiredString, requiredNumeric, runValidation, toNumberOrNull } from '@utils/validation'

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
  loading,
}: {
  isOpen: boolean
  onClose: () => void
  property?: ServiceProperty | null
  onSave: (p: ServiceProperty) => void
  loading?: boolean
}) {
  const { t } = useTranslation()
  const [name, setName] = useState<string>('')
  const [timezone, setTimezone] = useState<string>('UTC')
  const [infantMaxAge, setInfantMaxAge] = useState<string>('')
  const [childMaxAge, setChildMaxAge] = useState<string>('')
  const [childFactor, setChildFactor] = useState<string>('')
  const [baseOneAdult, setBaseOneAdult] = useState<string>('')
  const [baseTwoAdults, setBaseTwoAdults] = useState<string>('')
  const [additionalAdult, setAdditionalAdult] = useState<string>('')
  const [childPrice, setChildPrice] = useState<string>('')
  const [showRates, setShowRates] = useState<boolean>(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (property) {
      setName(property.name ?? '')
      setTimezone(property.timezone ?? 'UTC')
      setInfantMaxAge(property.infant_max_age?.toString() ?? '')
      setChildMaxAge(property.child_max_age?.toString() ?? '')
      setChildFactor(property.child_factor?.toString() ?? '')
      setBaseOneAdult(property.base_one_adult?.toString() ?? '')
      setBaseTwoAdults(property.base_two_adults?.toString() ?? '')
      setAdditionalAdult(property.additional_adult?.toString() ?? '')
      setChildPrice(property.child_price?.toString() ?? '')
      setErrors({})
    } else {
      setName('')
      setTimezone('UTC')
      setInfantMaxAge('')
      setChildMaxAge('')
      setChildFactor('')
      setBaseOneAdult('')
      setBaseTwoAdults('')
      setAdditionalAdult('')
      setChildPrice('')
      setErrors({})
    }
  }, [property, isOpen])

  function handleSave() {
    const newErrors = runValidation({
      name: [requiredString(name, t)],
      timezone: [requiredString(timezone, t)],
      infantMaxAge: [requiredNumeric(infantMaxAge, t)],
      childMaxAge: [requiredNumeric(childMaxAge, t)],
      childFactor: [requiredNumeric(childFactor, t)],
      baseOneAdult: [requiredNumeric(baseOneAdult, t)],
      baseTwoAdults: [requiredNumeric(baseTwoAdults, t)],
      additionalAdult: [requiredNumeric(additionalAdult, t)],
      childPrice: [requiredNumeric(childPrice, t)],
    })

    if (Object.keys(newErrors).length > 0) {
      // ensure tariffs visible if any tariff field has error
      const tariffKeys = ['childFactor', 'childPrice', 'baseOneAdult', 'baseTwoAdults', 'additionalAdult']
      if (tariffKeys.some((k) => newErrors[k])) setShowRates(true)
      setErrors(newErrors)
      return
    }

    const payload: ServiceProperty = {
      id: property?.id ?? '',
      name: name.trim(),
      timezone: timezone,
      infant_max_age: toNumberOrNull(infantMaxAge),
      child_max_age: toNumberOrNull(childMaxAge),
      child_factor: toNumberOrNull(childFactor),
      base_one_adult: toNumberOrNull(baseOneAdult),
      base_two_adults: toNumberOrNull(baseTwoAdults),
      additional_adult: toNumberOrNull(additionalAdult),
      child_price: toNumberOrNull(childPrice),
    }

    setErrors({})
    onSave(payload)
    onClose()
  }

  if (loading) {
    return (
      <Modal isOpen={!!isOpen} onClose={onClose} title={t('common.status.loading')} size="md">
        <VStack spacing={3} align="stretch">
          <Skeleton height="36px" />
          <Skeleton height="36px" />
          <Skeleton height="36px" />
          <Skeleton height="36px" />
        </VStack>
      </Modal>
    )
  }

  return (
    <Modal isOpen={!!isOpen} onClose={onClose} title={property ? t('properties.form.edit') : t('properties.form.new')} size="lg">
      <div className="form-grid">
        <div className="form-field full-width">
          <span>{t('properties.form.name')}</span>
          <input value={name} onChange={(e) => setName(e.target.value)} required />
          {errors['name'] ? <div className="field-error">{errors['name']}</div> : null}
        </div>

        <div className="form-field full-width">
          <span>{t('properties.form.timezone')}</span>
          <select value={timezone} onChange={(e) => setTimezone(e.target.value)} required>
            {COMMON_TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>{tz}</option>
            ))}
          </select>
          {errors['timezone'] ? <div className="field-error">{errors['timezone']}</div> : null}
        </div>

        <div className="form-field number">
          <span>{t('common.pricing.infant_max_age')}</span>
          <input type="number" value={infantMaxAge} onChange={(e) => setInfantMaxAge(e.target.value)} required />
          {errors['infantMaxAge'] ? <div className="field-error">{errors['infantMaxAge']}</div> : null}
        </div>

        <div className="form-field number">
          <span>{t('common.pricing.child_max_age')}</span>
          <input type="number" value={childMaxAge} onChange={(e) => setChildMaxAge(e.target.value)} required />
          {errors['childMaxAge'] ? <div className="field-error">{errors['childMaxAge']}</div> : null}
        </div>

        <div className="rate-group">
          <div className="rate-group-header">
            <strong>{t('properties.form.base_rates_title')}</strong>
            <button className="group-toggle" aria-expanded={showRates} onClick={() => setShowRates((s) => !s)}>
              {showRates ? t('common.pricing.hide_rates') : t('common.pricing.show_rates')}
            </button>
          </div>

          <div className={`rate-group-content ${showRates ? 'expanded' : 'collapsed'}`}>
            <div className="form-field number">
              <span>{t('common.pricing.child_factor')}</span>
              <input type="number" step="0.01" value={childFactor} onChange={(e) => setChildFactor(e.target.value)} required />
              {errors['childFactor'] ? <div className="field-error">{errors['childFactor']}</div> : null}
            </div>

            <div className="form-field number">
              <span>{t('common.pricing.child_price')}</span>
              <input type="number" step="0.01" value={childPrice} onChange={(e) => setChildPrice(e.target.value)} required />
              {errors['childPrice'] ? <div className="field-error">{errors['childPrice']}</div> : null}
            </div>

            <div className="form-field number">
              <span>{t('common.pricing.one_adult')}</span>
              <input type="number" step="0.01" value={baseOneAdult} onChange={(e) => setBaseOneAdult(e.target.value)} required />
              {errors['baseOneAdult'] ? <div className="field-error">{errors['baseOneAdult']}</div> : null}
            </div>

            <div className="form-field number">
              <span>{t('common.pricing.two_adults')}</span>
              <input type="number" step="0.01" value={baseTwoAdults} onChange={(e) => setBaseTwoAdults(e.target.value)} required />
              {errors['baseTwoAdults'] ? <div className="field-error">{errors['baseTwoAdults']}</div> : null}
            </div>

            <div className="form-field number">
              <span>{t('common.pricing.additional_adult')}</span>
              <input type="number" step="0.01" value={additionalAdult} onChange={(e) => setAdditionalAdult(e.target.value)} required />
              {errors['additionalAdult'] ? <div className="field-error">{errors['additionalAdult']}</div> : null}
            </div>
          </div>
        </div>

        <div className="modal-actions full-width">
          <button className="btn btn-ghost" onClick={onClose}>{t('common.actions.cancel')}</button>
          <button className="btn btn-primary" onClick={handleSave}>{t('common.actions.save')}</button>
        </div>
      </div>
    </Modal>
  )
}
