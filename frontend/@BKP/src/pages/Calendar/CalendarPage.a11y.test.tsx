import React from 'react'
import { render } from '@testing-library/react'
import { axe } from 'vitest-axe'

import CalendarPage from './CalendarPage'

// Mock fetchCalendar used by CalendarPage
vi.mock('../../api/calendar', () => ({
  fetchCalendar: async (start: string, end: string) => ({
    rooms: [
      {
        id: 'r1',
        name: 'Room 1',
        capacity: 2,
        reservations: [
          { id: 'res1', guest_name: 'Guest A', start_date: start, end_date: end, status: 'confirmed' }
        ]
      }
    ]
  })
}))

describe('CalendarPage accessibility', () => {
  test('has no detectable a11y violations', async () => {
    const { container, findByText } = render(<CalendarPage />)
    // wait for loading to finish by asserting room name appears
    await findByText('Room 1')
    const results = await axe(container)
    expect(Array.isArray(results.violations)).toBe(true)
    expect(results.violations).toHaveLength(0)
  })
})
import React from 'react'
import { render } from '@testing-library/react'
import { axe } from 'vitest-axe'

import CalendarPage from './CalendarPage'

// Mock fetchCalendar used by CalendarPage
vi.mock('../../api/calendar', () => ({
  fetchCalendar: async (start: string, end: string) => ({
    rooms: [
      {
        id: 'r1',
        name: 'Room 1',
        capacity: 2,
        reservations: [
          { id: 'res1', guest_name: 'Guest A', start_date: start, end_date: end, status: 'confirmed' }
        ]
      }
    ]
  })
}))

describe('CalendarPage accessibility', () => {
  test('has no detectable a11y violations', async () => {
    const { container, findByText } = render(<CalendarPage />)
    // wait for loading to finish by asserting room name appears
    await findByText('Room 1')
    const results = await axe(container)
    expect(Array.isArray(results.violations)).toBe(true)
    expect(results.violations).toHaveLength(0)
  })
})
