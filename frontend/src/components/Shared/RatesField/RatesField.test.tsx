import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import RatesField from './RatesField'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { propertySchema } from '@models/schemas'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        'common.pricing.tariff_base': 'Tarifa Base',
        'common.pricing.show_rates': 'Mostrar tarifas',
        'common.pricing.hide_rates': 'Ocultar tarifas',
        'common.pricing.child_factor': 'Fator criança',
        'common.pricing.child_price': 'Preço criança',
        'common.pricing.one_adult': 'Base 1 adulto',
        'common.pricing.two_adults': 'Base 2 adultos',
        'common.pricing.additional_adult': 'Adicional adulto',
      }
      return map[key] || key
    },
  }),
}))

vi.mock('@components/Shared/CurrencyInput/CurrencyInput', () => ({
  default: ({ name, control }: any) => (
    <input
      data-testid={`currency-${name}`}
      type="text"
      inputMode="numeric"
      {...control.register ? control.register(name) : { name }}
    />
  ),
}))

vi.mock('@components/Shared/FormField/FormField', () => ({
  default: ({ label, name, children, errors }: any) => (
    <div data-testid={`field-${name}`}>
      <label>{label}</label>
      {children}
      {errors[name] && <span className="error">{errors[name]?.message}</span>}
    </div>
  ),
}))

function TestWrapper() {
  const { control, formState: { errors } } = useForm({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      name: 'Test',
      timezone: 'UTC',
      infant_max_age: 2,
      child_max_age: 12,
      child_factor: 0.5,
      child_price: 50,
      base_one_adult: 100,
      base_two_adults: 150,
      additional_adult: 50,
    },
  })

  const [showRates, setShowRates] = React.useState(false)

  return (
    <RatesField
      control={control}
      errors={errors}
      showRates={showRates}
      onToggleRates={setShowRates}
    />
  )
}

describe('RatesField', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve renderizar com toggle inicialmente fechado', () => {
    render(<TestWrapper />)
    
    expect(screen.getByText('Tarifa Base')).toBeInTheDocument()
    expect(screen.getByText('Mostrar tarifas')).toBeInTheDocument()
    expect(screen.queryByText('Ocultar tarifas')).not.toBeInTheDocument()
  })

  it('deve mostrar campos quando toggle é acionado', () => {
    const { rerender } = render(<TestWrapper />)
    
    const toggleButton = screen.getByRole('button', { expanded: false })
    fireEvent.click(toggleButton)
    
    // Rerender para refletir mudança no state
    expect(screen.getByTestId('field-child_factor')).toBeInTheDocument()
    expect(screen.getByTestId('field-child_price')).toBeInTheDocument()
    expect(screen.getByTestId('field-base_one_adult')).toBeInTheDocument()
    expect(screen.getByTestId('field-base_two_adults')).toBeInTheDocument()
    expect(screen.getByTestId('field-additional_adult')).toBeInTheDocument()
  })

  it('deve ter labels corretos em português', () => {
    render(<TestWrapper />)
    
    const toggleButton = screen.getByRole('button')
    fireEvent.click(toggleButton)
    
    expect(screen.getByText('Fator criança')).toBeInTheDocument()
    expect(screen.getByText('Preço criança')).toBeInTheDocument()
    expect(screen.getByText('Base 1 adulto')).toBeInTheDocument()
    expect(screen.getByText('Base 2 adultos')).toBeInTheDocument()
    expect(screen.getByText('Adicional adulto')).toBeInTheDocument()
  })

  it('deve alternar entre mostrar e ocultar tarifas', () => {
    render(<TestWrapper />)
    
    const toggleButton = screen.getByRole('button')
    
    expect(toggleButton).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(toggleButton)
    
    expect(toggleButton).toHaveAttribute('aria-expanded', 'true')
  })

  it('deve aceitar título e labels customizados', () => {
    const CustomTestWrapper = () => {
      const { control, formState: { errors } } = useForm({
        resolver: zodResolver(propertySchema),
      })
      const [showRates, setShowRates] = React.useState(false)

      return (
        <RatesField
          control={control}
          errors={errors}
          showRates={showRates}
          onToggleRates={setShowRates}
          title="custom.title"
          toggleLabel="custom.show"
          hideLabel="custom.hide"
        />
      )
    }

    render(<CustomTestWrapper />)
    expect(screen.getByText('custom.title')).toBeInTheDocument()
  })
})
