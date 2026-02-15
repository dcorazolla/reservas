import React from 'react'
import { render } from '@testing-library/react'
import { axe } from 'vitest-axe'

import { PropertyPricingModal } from '../components/rates'

const sampleInitial = {
  base_one_adult: 100,
  base_two_adults: 180,
  additional_adult: 20,
  child_price: 50,
  infant_max_age: 2,
  child_max_age: 12,
  child_factor: 0.5,
}

describe('PropertyPricingModal accessibility', () => {
  test('has no detectable a11y violations when open', async () => {
    const onClose = vi.fn()
    const onSave = vi.fn(() => Promise.resolve())
    const { container } = render(
      <PropertyPricingModal open={true} initial={sampleInitial as any} onClose={onClose} onSave={onSave} />
    )
    const results = await axe(container)
    expect(Array.isArray(results.violations)).toBe(true)
    expect(results.violations).toHaveLength(0)
  })
})
