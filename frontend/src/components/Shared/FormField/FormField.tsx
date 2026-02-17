import React from 'react'
import type { FieldErrors } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

type Props = {
  label: string
  name: string
  errors?: FieldErrors
  className?: string
  children: React.ReactNode
}

/**
 * Consistent form-field wrapper: label (span) + children + error message.
 * Pairs with the shared `.form-field` CSS class.
 */
export default function FormField({ label, name, errors, className = '', children }: Props) {
  const { t } = useTranslation()
  const error = errors?.[name]
  const rawMessage = error ? String((error as any).message ?? '') : null
  const message = rawMessage ? t(rawMessage) : null

  return (
    <div className={`form-field ${className}`.trim()}>
      <span>{label}</span>
      {children}
      {message ? <div className="field-error">{message}</div> : null}
    </div>
  )
}
