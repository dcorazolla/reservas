import React from 'react';
import { render, screen } from '@testing-library/react';
import ReservationModal from '../components/ReservationModal';

// Mock APIs used by the modal to keep the test focused
vi.mock('../api/partners', () => ({ listPartners: async () => [] }));
vi.mock('../api/rooms', () => ({ listRooms: async () => [{ id: 'r1', name: 'Room 1' }] }));
vi.mock('../api/reservations', () => ({ calculateReservationPriceDetailed: async () => ({ total: 0, days: [] }) }));

describe('ReservationModal default endDate', () => {
  it('sets endDate to startDate + 1 day when opened from calendar', async () => {
    const start = '2026-02-10';
    render(
      <ReservationModal roomId={null} date={start} reservation={null} onClose={() => {}} />
    );

    const endInput = await screen.findByLabelText(/Saída/i) as HTMLInputElement;
    // expected end date is start + 1
    const expected = new Date(start + 'T00:00:00');
    expected.setDate(expected.getDate() + 1);
    const expectedIso = expected.toISOString().slice(0,10);

    expect(endInput.value).toBe(expectedIso);
  });
});
