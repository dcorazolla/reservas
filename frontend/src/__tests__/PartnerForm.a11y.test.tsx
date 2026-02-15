import React from 'react'
import { render } from '@testing-library/react'
import { axe } from 'vitest-axe'

import { PartnerForm } from '../components/forms'

describe('PartnerForm accessibility', () => {
  test('has no detectable a11y violations', async () => {
    const onSaved = vi.fn()
    const onClose = vi.fn()
    const { container } = render(
      <PartnerForm partner={null} onSaved={onSaved} onClose={onClose} />
    )
    const results = await axe(container)
    expect(Array.isArray(results.violations)).toBe(true)
    expect(results.violations).toHaveLength(0)
  })
})
