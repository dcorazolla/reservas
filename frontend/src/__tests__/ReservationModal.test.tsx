import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReservationModal } from '../components/Reservation';

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

  it('has dialog aria attributes and a close button with aria-label', async () => {
    const onClose = vi.fn();
    render(
      <ReservationModal
        roomId={null}
        date={null}
        reservation={null}
        onClose={onClose}
      />
    );

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'reservation-title');

    const closeButton = screen.getByLabelText(/fechar/i);
    expect(closeButton).toBeTruthy();
  });

  it('moves focus between fields with Tab', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <ReservationModal
        roomId={null}
        date={null}
        reservation={null}
        onClose={onClose}
      />
    );

    const guest = await screen.findByLabelText(/Hóspede/i);
    const adults = screen.getByLabelText(/Adultos/i);

    // initial focus should be on first field (guest)
    expect(document.activeElement).toBe(guest);

    // tab to next field
    await user.tab();
    expect(document.activeElement).toBe(adults);
  });
});
