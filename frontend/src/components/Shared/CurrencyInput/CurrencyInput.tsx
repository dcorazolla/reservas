import React from 'react'
import { NumericFormat } from 'react-number-format'
import { useController, type Control, type FieldValues, type Path } from 'react-hook-form'

type Props<T extends FieldValues> = {
  name: Path<T>
  control: Control<T>
  prefix?: string
  decimalScale?: number
  allowNegative?: boolean
  className?: string
  required?: boolean
  'aria-label'?: string
}

export default function CurrencyInput<T extends FieldValues>({
  name,
  control,
  prefix = '',
  decimalScale = 2,
  allowNegative = false,
  className,
  required,
  'aria-label': ariaLabel,
}: Props<T>) {
  const {
    field: { value, onChange, onBlur, ref },
  } = useController({ name, control })

  return (
    <NumericFormat
      getInputRef={ref}
      value={value ?? ''}
      onValueChange={(values) => {
        onChange(values.floatValue ?? null)
      }}
      onBlur={onBlur}
      thousandSeparator="."
      decimalSeparator=","
      decimalScale={decimalScale}
      fixedDecimalScale
      allowNegative={allowNegative}
      prefix={prefix}
      className={className}
      required={required}
      aria-label={ariaLabel}
    />
  )
}
