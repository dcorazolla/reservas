import React from 'react'
import { render } from '@testing-library/react'
import { axe } from 'vitest-axe'

import RateModal from '../components/rates/RateModal'

describe('RateModal accessibility', () => {
  test('has no detectable a11y violations when open', async () => {
    const onClose = vi.fn()
    const onSave = vi.fn(() => Promise.resolve())
    const { container } = render(
      <RateModal open={true} initial={{ people_count: 2, price_per_day: 100 }} onClose={onClose} onSave={onSave} />
    )
    const results = await axe(container)
    expect(Array.isArray(results.violations)).toBe(true)
    expect(results.violations).toHaveLength(0)
  })
})
