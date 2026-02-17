import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Modal from '@components/Shared/Modal/Modal'
import FormField from '@components/Shared/FormField/FormField'
import CurrencyInput from '@components/Shared/CurrencyInput/CurrencyInput'
import type { Partner } from '@models/partner'
import { partnerSchema, type PartnerFormData } from '@models/schemas'
import { useTranslation } from 'react-i18next'

export default function EditPartnerModal({
  isOpen,
  onClose,
  partner,
  onSave,
}: {
  isOpen: boolean
  onClose: () => void
  partner?: Partner | null
  onSave: (p: Partner) => void
}) {
  const { t } = useTranslation()

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<PartnerFormData>({
    resolver: zodResolver(partnerSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      tax_id: '',
      address: '',
      notes: '',
      billing_rule: 'none',
      partner_discount_percent: 0,
    },
  })

  useEffect(() => {
    if (isOpen) {
      if (partner) {
        reset({
          name: partner.name ?? '',
          email: partner.email ?? '',
          phone: partner.phone ?? '',
          tax_id: partner.tax_id ?? '',
          address: partner.address ?? '',
          notes: partner.notes ?? '',
          billing_rule: partner.billing_rule ?? 'none',
          partner_discount_percent: partner.partner_discount_percent ?? 0,
        })
      } else {
        reset({
          name: '',
          email: '',
          phone: '',
          tax_id: '',
          address: '',
          notes: '',
          billing_rule: 'none',
          partner_discount_percent: 0,
        })
      }
    }
  }, [partner, isOpen, reset])

  function onFormSubmit(data: PartnerFormData) {
    const payload: Partner = {
      id: partner?.id ?? '',
      name: data.name.trim(),
      email: data.email?.trim() || null,
      phone: data.phone?.trim() || null,
      tax_id: data.tax_id?.trim() || null,
      address: data.address?.trim() || null,
      notes: data.notes?.trim() || null,
      billing_rule: data.billing_rule ?? null,
      partner_discount_percent: data.partner_discount_percent ?? null,
    }

    onSave(payload)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={partner?.id ? t('partners.form.edit') : t('partners.form.new')} size="lg">
      <form onSubmit={handleSubmit(onFormSubmit)}>
        <div className="form-grid">
          <FormField label={t('partners.form.name')} name="name" errors={errors} className="full-width" required>
            <input {...register('name')} required />
          </FormField>

          <FormField label={t('partners.form.email')} name="email" errors={errors}>
            <input {...register('email')} type="email" />
          </FormField>

          <FormField label={t('partners.form.phone')} name="phone" errors={errors}>
            <input {...register('phone')} type="tel" />
          </FormField>

          <FormField label={t('partners.form.tax_id')} name="tax_id" errors={errors}>
            <input {...register('tax_id')} placeholder="CPF/CNPJ" />
          </FormField>

          <FormField label={t('partners.form.address')} name="address" errors={errors} className="full-width">
            <input {...register('address')} />
          </FormField>

          <FormField label={t('partners.form.notes')} name="notes" errors={errors} className="full-width">
            <textarea {...register('notes')} />
          </FormField>

          <FormField label={t('partners.form.billing_rule')} name="billing_rule" errors={errors}>
            <select {...register('billing_rule')}>
              <option value="none">{t('partners.billing_rule.none')}</option>
              <option value="charge_partner">{t('partners.billing_rule.charge_partner')}</option>
              <option value="charge_guest">{t('partners.billing_rule.charge_guest')}</option>
            </select>
          </FormField>

          <FormField label={t('partners.form.discount_percent')} name="partner_discount_percent" errors={errors}>
            <input
              {...register('partner_discount_percent')}
              type="number"
              min="0"
              max="100"
              step="0.01"
              placeholder="0"
            />
          </FormField>
        </div>

        <div className="modal-actions">
          <button type="button" onClick={onClose} className="btn-secondary">
            {t('common.actions.cancel')}
          </button>
          <button type="submit" className="btn-primary">
            {t('common.actions.save')}
          </button>
        </div>
      </form>
    </Modal>
  )
}
