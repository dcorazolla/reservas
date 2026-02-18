import React from 'react'
import { Control, Controller } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import FormField from '../FormField/FormField'
import CurrencyInput from '../CurrencyInput/CurrencyInput'
import type { PropertyFormData } from '@models/schemas'
import type { FieldValues } from 'react-hook-form'

interface RatesFieldProps {
  control: Control<FieldValues>
  errors: Record<string, any>
  showRates: boolean
  onToggleRates: (show: boolean) => void
  title?: string
  toggleLabel?: string
  hideLabel?: string
}

/**
 * RatesField - Componente compartilhado para edição de tarifas
 * Utilizado em: Propriedades, Categorias de Quarto, Página Base Rates
 *
 * Campos inclusos:
 * - child_factor: Fator multiplicador para crianças
 * - child_price: Preço fixo por criança
 * - base_one_adult: Tarifa base para 1 adulto
 * - base_two_adults: Tarifa base para 2 adultos
 * - additional_adult: Tarifa adicional por adulto extra
 */
export default function RatesField({
  control,
  errors,
  showRates,
  onToggleRates,
  title = 'common.pricing.tariff_base',
  toggleLabel = 'common.pricing.show_rates',
  hideLabel = 'common.pricing.hide_rates',
}: RatesFieldProps) {
  const { t } = useTranslation()

  return (
    <div className="rate-group">
      <div className="rate-group-header">
        <strong>{t(title)}</strong>
        <button
          className="group-toggle"
          type="button"
          aria-expanded={showRates}
          onClick={() => onToggleRates(!showRates)}
        >
          {showRates ? t(hideLabel) : t(toggleLabel)}
        </button>
      </div>

      <div className={`rate-group-content ${showRates ? 'expanded' : 'collapsed'}`}>
        <FormField
          label={t('common.pricing.child_factor')}
          name="child_factor"
          errors={errors}
          className="number"
        >
          <CurrencyInput name="child_factor" control={control} decimalScale={2} />
        </FormField>

        <FormField
          label={t('common.pricing.child_price')}
          name="child_price"
          errors={errors}
          className="number"
        >
          <CurrencyInput name="child_price" control={control} decimalScale={2} />
        </FormField>

        <FormField
          label={t('common.pricing.one_adult')}
          name="base_one_adult"
          errors={errors}
          className="number"
        >
          <CurrencyInput name="base_one_adult" control={control} decimalScale={2} />
        </FormField>

        <FormField
          label={t('common.pricing.two_adults')}
          name="base_two_adults"
          errors={errors}
          className="number"
        >
          <CurrencyInput name="base_two_adults" control={control} decimalScale={2} />
        </FormField>

        <FormField
          label={t('common.pricing.additional_adult')}
          name="additional_adult"
          errors={errors}
          className="number"
        >
          <CurrencyInput name="additional_adult" control={control} decimalScale={2} />
        </FormField>
      </div>
    </div>
  )
}
