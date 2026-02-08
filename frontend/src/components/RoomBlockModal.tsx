import React, { useState, useEffect } from 'react';
import Modal from './Modal/Modal';
import { fetchCalendar } from '../api/calendar';
import { createRoomBlock } from '../api/roomBlocks';

type Props = {
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
};

export default function RoomBlockModal({ open, onClose, onSaved }: Props) {
  const [rooms, setRooms] = useState<Array<{ id: string; name: string }>>([]);
  const [roomId, setRoomId] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [reason, setReason] = useState<string>('Bloqueio');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadRooms() {
      try {
        // fetch a short calendar to get rooms list
        const start = new Date().toISOString().slice(0,10);
        const end = start;
        const data = await fetchCalendar(start, end);
        setRooms((data.rooms || []).map((r: any) => ({ id: r.id, name: r.name })));
        if ((data.rooms || []).length > 0) setRoomId((data.rooms || [])[0].id);
      } catch (e) {
        // ignore
      }
    }
    if (open) loadRooms();
  }, [open]);

  async function submit(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);
    if (!roomId || !startDate || !endDate) {
      setError('Todos os campos são obrigatórios');
      return;
    }

    setSaving(true);
    try {
      await createRoomBlock({ room_id: roomId, start_date: startDate, end_date: endDate, reason });
      onSaved?.();
    } catch (err: any) {
      setError(err?.message || 'Erro ao criar bloqueio');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} title="Criar bloqueio de quarto" onClose={onClose}>
      <form onSubmit={submit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label>
            Quarto
            <select value={roomId} onChange={(e) => setRoomId(e.target.value)}>
              {rooms.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </label>

          <label>
            Início
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </label>

          <label>
            Fim
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </label>

          <label>
            Motivo
            <input type="text" value={reason} onChange={(e) => setReason(e.target.value)} />
          </label>

          {error ? <div style={{ color: 'red' }}>{error}</div> : null}

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} disabled={saving}>Cancelar</button>
            <button type="submit" disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
