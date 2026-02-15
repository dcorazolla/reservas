import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react'

// vitest helpers
import { vi } from 'vitest'

// CalendarPage imports fetchCalendar and ReservationModal internally
vi.mock('../api/calendar', () => ({
  fetchCalendar: vi.fn(async (start: string, end: string) => ({
    rooms: [
      {
        id: 'r1',
        name: 'Room 1',
        capacity: 2,
        reservations: [],
      },
    ],
  })),
}))

vi.mock('../components/Reservation/ReservationModal', () => ({
  default: ({ roomId, date, reservation }: any) => (
    <div data-testid="reservation-modal" data-roomid={roomId} data-date={date}>
      {reservation ? 'reservation' : 'new'}
    </div>
  ),
}))

import CalendarPage from '../pages/Calendar/CalendarPage'
import { fetchCalendar } from '../api/calendar'

describe('CalendarPage interactions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('calls fetchCalendar with updated month when clicking navigation buttons', async () => {
    const { findByText, getByText } = render(<CalendarPage />)

    // wait for initial data load
    await findByText('Room 1')

    // initial call
    expect(fetchCalendar).toHaveBeenCalled()

    // click Próximo to advance month
    const next = getByText('Próximo')
    fireEvent.click(next)

    // wait for subsequent fetch
    await waitFor(() => expect(fetchCalendar).toHaveBeenCalledTimes(2))

    // click Anterior to go back
    const prev = getByText('Anterior')
    fireEvent.click(prev)

    await waitFor(() => expect(fetchCalendar).toHaveBeenCalledTimes(3))
  })

  test('opens ReservationModal when clicking an empty calendar cell', async () => {
    const { findByText, container } = render(<CalendarPage />)

    await findByText('Room 1')

    // find a half-cell element and click it
    const halfCell = container.querySelector('.half-cell') as HTMLElement | null
    expect(halfCell).not.toBeNull()
    fireEvent.click(halfCell!)

    // modal should appear
    await waitFor(() => expect(container.querySelector('[data-testid="reservation-modal"]')).toBeTruthy())
    const modal = container.querySelector('[data-testid="reservation-modal"]') as HTMLElement
    expect(modal.getAttribute('data-roomid')).toBe('r1')
  })
})
