import React from 'react'
import { render } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { ReservationModal } from '../components/Reservation'



describe('ReservationModal accessibility', () => {
  test('has no detectable a11y violations', async () => {
    const { container } = render(
      <ReservationModal open={true} onClose={() => {}} />
    )
    const results = await axe(container)
    // vitest-axe exports axe but not the jest matcher in this version,
    // assert there are no violations directly.
    expect(Array.isArray(results.violations)).toBe(true)
    expect(results.violations).toHaveLength(0)
  })
})
