import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import PageShell from '@components/Layout/PageShell/PageShell'
import RatesField from '@components/Shared/RatesField/RatesField'
import FormField from '@components/Shared/FormField/FormField'
import SkeletonFields from '@components/Shared/Skeleton/SkeletonFields'
import { propertySchema, type PropertyFormData } from '@models/schemas'
import { propertiesService } from '@services/properties'
import type { Property } from '@models/property'

export default function BaseRatesPage() {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [property, setProperty] = useState<Property | null>(null)
  const [showRates, setShowRates] = useState(false)

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
  })

  // Carregar propriedade ativa (da property_id no JWT/context)
  // Por enquanto, carrega a primeira propriedade
  useEffect(() => {
    const loadProperty = async () => {
      try {
        setLoading(true)
        const properties = await propertiesService.list()
        if (properties.length > 0) {
          const activeProperty = properties[0]
          setProperty(activeProperty)
          reset({
            name: activeProperty.name,
            timezone: activeProperty.timezone,
            infant_max_age: activeProperty.infant_max_age ?? undefined,
            child_max_age: activeProperty.child_max_age ?? undefined,
            child_factor: activeProperty.child_factor ?? undefined,
            base_one_adult: activeProperty.base_one_adult ?? undefined,
            base_two_adults: activeProperty.base_two_adults ?? undefined,
            additional_adult: activeProperty.additional_adult ?? undefined,
            child_price: activeProperty.child_price ?? undefined,
          })
        }
      } catch (error) {
        console.error('Error loading property:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProperty()
  }, [reset])

  async function handleSave(data: PropertyFormData) {
    if (!property?.id) return

    try {
      setSaving(true)
      const updated = await propertiesService.update(property.id, {
        name: data.name.trim(),
        timezone: data.timezone,
        infant_max_age: data.infant_max_age ?? null,
        child_max_age: data.child_max_age ?? null,
        child_factor: data.child_factor ?? null,
        base_one_adult: data.base_one_adult ?? null,
        base_two_adults: data.base_two_adults ?? null,
        additional_adult: data.additional_adult ?? null,
        child_price: data.child_price ?? null,
      })
      setProperty(updated)
      setShowRates(false)
    } catch (error) {
      console.error('Error saving rates:', error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <PageShell title={t('menu.rates.base')}>
        <SkeletonFields rows={8} />
      </PageShell>
    )
  }

  if (!property) {
    return (
      <PageShell title={t('menu.rates.base')}>
        <p>{t('common.status.no_data')}</p>
      </PageShell>
    )
  }

  return (
    <PageShell title={t('menu.rates.base')}>
      <form onSubmit={handleSubmit(handleSave)} className="base-rates-form">
        <div className="form-section">
          <h3>{t('properties.form.base_rates_title')}</h3>
          <p className="form-description">
            {t('baseRates.form.description')}
          </p>

          <FormField
            label={t('properties.form.name')}
            name="name"
            errors={errors}
            className="full-width"
          >
            <input type="text" {...register('name')} disabled />
          </FormField>

          <FormField
            label={t('properties.form.timezone')}
            name="timezone"
            errors={errors}
            className="full-width"
          >
            <input type="text" {...register('timezone')} disabled />
          </FormField>

          <FormField
            label={t('common.pricing.infant_max_age')}
            name="infant_max_age"
            errors={errors}
            className="number"
          >
            <input type="number" {...register('infant_max_age')} disabled />
          </FormField>

          <FormField
            label={t('common.pricing.child_max_age')}
            name="child_max_age"
            errors={errors}
            className="number"
          >
            <input type="number" {...register('child_max_age')} disabled />
          </FormField>
        </div>

        <div className="form-section rates-section">
          <RatesField
            control={control}
            errors={errors}
            showRates={showRates}
            onToggleRates={setShowRates}
            title="properties.form.base_rates_title"
            toggleLabel="common.pricing.show_rates"
            hideLabel="common.pricing.hide_rates"
          />
        </div>

        <div className="form-actions full-width">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving}
          >
            {saving ? t('common.status.loading') : t('common.actions.save')}
          </button>
        </div>
      </form>
    </PageShell>
  )
}
