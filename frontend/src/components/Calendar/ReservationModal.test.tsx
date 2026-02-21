import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { vi, describe, it, expect, beforeEach } from 'vitest'

vi.mock('@contexts/AuthContext', () => ({
  useAuth: () => ({
    token: 'test-token-with-property-id',
  }),
}))

vi.mock('@services/auth', () => ({
  decodeTokenPayload: (token: string) => ({
    property_id: 'prop-123',
  }),
}))

vi.mock('@services/reservations', () => ({
  createReservation: vi.fn().mockResolvedValue({
    id: 'res-1',
    guest_name: 'João',
    status: 'pre-reserva',
  }),
  updateReservation: vi.fn().mockResolvedValue({
    id: 'res-1',
    guest_name: 'João',
    status: 'reservado',
  }),
  calculateReservationPrice: vi.fn().mockResolvedValue({
    total: 300,
    days: [
      { date: '2026-02-20', price: 100 },
      { date: '2026-02-21', price: 100 },
      { date: '2026-02-22', price: 100 },
    ],
  }),
  checkInReservation: vi.fn().mockResolvedValue({}),
  checkOutReservation: vi.fn().mockResolvedValue({}),
  confirmReservation: vi.fn().mockResolvedValue({}),
  cancelReservation: vi.fn().mockResolvedValue({}),
}))

vi.mock('@services/partners', () => ({
  listPartners: vi.fn().mockResolvedValue([
    { id: 'p-1', name: 'Booking.com' },
    { id: 'p-2', name: 'Airbnb' },
  ]),
}))

vi.mock('@services/rooms', () => ({
  listRooms: vi.fn().mockResolvedValue([
    { id: 'r-1', name: 'Quarto 101', capacity: 2, base_rate: 100 },
    { id: 'r-2', name: 'Quarto 102', capacity: 4, base_rate: 150 },
  ]),
}))

import ReservationModal from './ReservationModal'

describe('ReservationModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders create form when opened with date', async () => {
    const onClose = vi.fn()
    const onSaved = vi.fn()

    render(
      <ReservationModal
        isOpen={true}
        onClose={onClose}
        onSaved={onSaved}
        reservation={null}
        date="2026-02-20"
        roomId="r-1"
        rooms={[]}
      />
    )

    await waitFor(() => {
      expect(screen.getByDisplayValue('2026-02-20')).toBeInTheDocument()
      expect(screen.getByDisplayValue('2026-02-21')).toBeInTheDocument()
    })
  })

  it('shows status transitions buttons in edit mode', async () => {
    const reservation = {
      id: 'res-1',
      room_id: 'r-1',
      property_id: 'prop-1',
      guest_name: 'João Silva',
      adults_count: 2,
      children_count: 0,
      infants_count: 0,
      start_date: '2026-02-20',
      end_date: '2026-02-22',
      status: 'pre-reserva',
      notes: '',
      partner_id: null,
    }

    const onClose = vi.fn()
    const onSaved = vi.fn()

    render(
      <ReservationModal
        isOpen={true}
        onClose={onClose}
        onSaved={onSaved}
        reservation={reservation}
        rooms={[]}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Confirmar')).toBeInTheDocument()
    })
  })

  it('calculates price when dates change', async () => {
    const onClose = vi.fn()
    const onSaved = vi.fn()

    const { calculateReservationPrice } = await import('@services/reservations')

    render(
      <ReservationModal
        isOpen={true}
        onClose={onClose}
        onSaved={onSaved}
        reservation={null}
        date="2026-02-20"
        roomId="r-1"
        rooms={[]}
      />
    )

    await waitFor(() => {
      expect(calculateReservationPrice).toHaveBeenCalled()
    })
  })

  it('closes on ESC key', async () => {
    const onClose = vi.fn()
    const onSaved = vi.fn()

    render(
      <ReservationModal
        isOpen={true}
        onClose={onClose}
        onSaved={onSaved}
        reservation={null}
        date="2026-02-20"
        roomId="r-1"
        rooms={[]}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Cancelar')).toBeInTheDocument()
    })

    const modal = screen.getByText('Nova Reserva').closest('div')
    if (modal) {
      fireEvent.keyDown(document, { key: 'Escape' })
      expect(onClose).toHaveBeenCalled()
    }
  })

  it('disables save button when there are validation errors', async () => {
    const onClose = vi.fn()
    const onSaved = vi.fn()

    render(
      <ReservationModal
        isOpen={true}
        onClose={onClose}
        onSaved={onSaved}
        reservation={null}
        date="2026-02-20"
        roomId="r-1"
        rooms={[]}
      />
    )

    const saveButton = await screen.findByText('Salvar')
    // Without a guest name, button should be disabled
    expect(saveButton).toBeDisabled()
  })
})
