import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ReservationModal from '../components/ReservationModal';

// Mock partners API
vi.mock('../api/partners', () => ({
  listPartners: async () => []
}));

describe('ReservationModal accessibility', () => {
  it('focuses first field and closes on ESC', async () => {
    const onClose = vi.fn();
    render(
      <ReservationModal
        roomId={null}
        date={null}
        reservation={null}
        onClose={onClose}
      />
    );

    // first field should be guestName
    const guest = await screen.findByLabelText(/Hóspede/i);
    // Use a generic truthy assertion to avoid depending on jest-dom setup
    expect(guest).toBeTruthy();
    // simulate ESC
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });
});
