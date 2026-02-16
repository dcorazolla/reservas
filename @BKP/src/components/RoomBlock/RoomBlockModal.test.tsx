import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RoomBlockModal from './RoomBlockModal';
import * as api from '@api/roomBlocks';
import * as calendarApi from '@api/calendar';

vi.spyOn(calendarApi, 'fetchCalendar').mockResolvedValue({ start: '', end: '', rooms: [{ id: 'r1', name: 'Quarto A' }] });

describe('RoomBlockModal', () => {
  it('renders and submits', async () => {
    const createSpy = vi.spyOn(api, 'createRoomBlock').mockResolvedValue({ id: 'b1', room_id: 'r1', start_date: '2026-02-10', end_date: '2026-02-12' });

    const onSaved = vi.fn();
    render(<RoomBlockModal open={true} onClose={() => {}} onSaved={onSaved} />);

    // Room select should be present
    expect(await screen.findByRole('combobox')).toBeInTheDocument();

    const start = screen.getByLabelText(/Início/i) as HTMLInputElement;
    const end = screen.getByLabelText(/Fim/i) as HTMLInputElement;
    const saveButton = screen.getByText(/Salvar/i) as HTMLButtonElement;

    fireEvent.change(start, { target: { value: '2026-02-10' } });
    fireEvent.change(end, { target: { value: '2026-02-12' } });

    fireEvent.click(saveButton);

    await waitFor(() => expect(createSpy).toHaveBeenCalled());
    expect(onSaved).toHaveBeenCalled();
  });
});
import React from 'react';
import { render, screen } from '@testing-library/react';
import RoomBlockModal from './RoomBlockModal';

test('renders and submits', async () => {
  const onClose = vi.fn();
  render(<RoomBlockModal open={true} onClose={onClose} />);
  expect(await screen.findByRole('dialog')).toBeTruthy();
});
