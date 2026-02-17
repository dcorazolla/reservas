import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { vi, describe, it, expect, beforeEach } from 'vitest'

vi.mock('@chakra-ui/react', async () => {
  return {}
})

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string) => k,
  }),
}))

import EditPropertyModal from './EditPropertyModal'

/** Helper: fill all required fields (name, age spinbuttons, and CurrencyInput fields in the rates section) */
async function fillAllRequiredFields(container: HTMLElement) {
  // Fill name (first textbox)
  const nameInput = screen.getAllByRole('textbox')[0]
  await userEvent.type(nameInput, 'New Hotel')

  // Fill age spinbuttons (infant_max_age, child_max_age)
  const spinbuttons = screen.getAllByRole('spinbutton')
  for (const ni of spinbuttons) {
    await userEvent.clear(ni)
    await userEvent.type(ni, '10')
  }

  // Open rates section to access CurrencyInput fields
  await userEvent.click(screen.getByText('common.pricing.show_rates'))

  // CurrencyInput fields render as <input type="text" inputmode="numeric">
  // They are inside the rate-group-content section
  const rateSection = container.querySelector('.rate-group-content.expanded')
  if (rateSection) {
    const currencyInputs = rateSection.querySelectorAll('input[inputmode="numeric"]')
    for (const ci of currencyInputs) {
      fireEvent.change(ci, { target: { value: '10,00' } })
      // Trigger blur to ensure react-hook-form picks up the value
      fireEvent.blur(ci)
    }
  }
}

describe('EditPropertyModal', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders create form when property is null', () => {
    render(<EditPropertyModal isOpen={true} onClose={vi.fn()} onSave={vi.fn()} property={null} />)
    expect(screen.getByText('properties.form.new')).toBeInTheDocument()
  })

  it('renders edit form when property is provided', () => {
    const property = { id: 'p-1', name: 'Test', timezone: 'UTC' }
    render(<EditPropertyModal isOpen={true} onClose={vi.fn()} onSave={vi.fn()} property={property} />)
    expect(screen.getByText('properties.form.edit')).toBeInTheDocument()
  })

  it('shows rates toggle and opens rates section', async () => {
    render(<EditPropertyModal isOpen={true} onClose={vi.fn()} onSave={vi.fn()} property={null} />)

    const toggle = screen.getByText('common.pricing.show_rates')
    await userEvent.click(toggle)
    expect(screen.getByText('common.pricing.hide_rates')).toBeInTheDocument()
  })

  it('shows validation errors when saving with empty fields', async () => {
    const onSave = vi.fn()
    render(<EditPropertyModal isOpen={true} onClose={vi.fn()} onSave={onSave} property={null} />)

    await userEvent.click(screen.getByText('common.actions.save'))
    // errors should be shown, onSave should not be called
    expect(onSave).not.toHaveBeenCalled()
  })

  it('prefills form with property data for editing', () => {
    const property = {
      id: 'p-1',
      name: 'Hotel ABC',
      timezone: 'Europe/Lisbon',
      infant_max_age: 2,
      child_max_age: 12,
      child_factor: 0.5,
      base_one_adult: 100,
      base_two_adults: 150,
      additional_adult: 30,
      child_price: 20,
    }
    render(<EditPropertyModal isOpen={true} onClose={vi.fn()} onSave={vi.fn()} property={property} />)
    const inputs = screen.getAllByRole('textbox')
    expect((inputs[0] as HTMLInputElement).value).toBe('Hotel ABC')
  })

  it('saves valid data and calls onSave + onClose', async () => {
    const onSave = vi.fn()
    const onClose = vi.fn()

    const { container } = render(<EditPropertyModal isOpen={true} onClose={onClose} onSave={onSave} property={null} />)

    await fillAllRequiredFields(container)

    await userEvent.click(screen.getByText('common.actions.save'))

    await waitFor(() => {
      expect(onSave).toHaveBeenCalled()
      expect(onClose).toHaveBeenCalled()
    })
  })

  it('calls onClose on cancel', async () => {
    const onClose = vi.fn()
    render(<EditPropertyModal isOpen={true} onClose={onClose} onSave={vi.fn()} property={null} />)

    await userEvent.click(screen.getByText('common.actions.cancel'))
    expect(onClose).toHaveBeenCalled()
  })
})
