import React from 'react'
import { render } from '@testing-library/react'
import { axe } from 'vitest-axe'

import ReservationsListPage from '../pages/ReservationsPage'

vi.mock('../api/reservations', () => ({
  listReservations: async (opts: any) => ([
    { id: 'res1', guest_name: 'Guest A', room_id: 'r1', start_date: opts.from, end_date: opts.to, total_value: 100 }
  ])
}))

describe('ReservationsListPage accessibility', () => {
  test('has no detectable a11y violations', async () => {
    const { container, findByText } = render(<ReservationsListPage />)
    // default state uses today's date; wait for the result count text to update
    await findByText(/reservas/) // heading or summary
    const results = await axe(container)
    expect(Array.isArray(results.violations)).toBe(true)
    expect(results.violations).toHaveLength(0)
  })
})
