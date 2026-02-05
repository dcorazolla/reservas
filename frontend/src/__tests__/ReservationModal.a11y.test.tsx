import React from 'react'
import { render } from '@testing-library/react'
import { axe } from 'vitest-axe'
import ReservationModal from '../components/ReservationModal'

describe('ReservationModal accessibility', () => {
  test('has no detectable a11y violations', async () => {
    const { container } = render(
      <ReservationModal open={true} onClose={() => {}} />
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
