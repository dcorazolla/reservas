import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import { axe } from 'vitest-axe'

import ReservationConfirmModal from '../components/ReservationConfirmModal'

const sampleItem = {
  room_name: 'Suite A',
  room_number: 101,
  capacity: 2,
  pricing_source: 'property',
  total: 20000
}

describe('ReservationConfirmModal accessibility', () => {
  test('has no detectable a11y violations when open', async () => {
    const onClose = vi.fn()
    const onConfirm = vi.fn(() => Promise.resolve())
    const { container, getByLabelText, getByText } = render(
      <ReservationConfirmModal
        open={true}
        item={sampleItem as any}
        checkin="2026-02-10"
        checkout="2026-02-12"
        guestName=""
        email=""
        phone=""
        onClose={onClose}
        onConfirm={onConfirm}
      />
    )

    const results = await axe(container)
    if (results.violations && results.violations.length > 0) {
      // Print violations to help debug and fix accessibility issues
      // eslint-disable-next-line no-console
      console.log('a11y violations:', JSON.stringify(results.violations, null, 2))
    }
    expect(Array.isArray(results.violations)).toBe(true)
    expect(results.violations).toHaveLength(0)
  })
})
