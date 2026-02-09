import React, { useState, useEffect, useId } from 'react';
import Modal from './Modal/Modal';
import { fetchCalendar } from '../api/calendar';
import { listRooms } from '../api/rooms';
import { fetchRoomBlocks } from '../api/roomBlocks';
import { formatDate } from '../utils/dates';
import { createRoomBlock, updateRoomBlock, deleteRoomBlock } from '../api/roomBlocks';
import ConfirmDialog from './ConfirmDialog';
import ErrorDialog from './Common/ErrorDialog';

type RoomBlock = {
  id?: string;
  room_id: string;
  start_date: string;
  end_date: string;
  reason?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
  block?: RoomBlock | null;
};

export default function RoomBlockModal({ open, onClose, onSaved, block }: Props) {
  const [rooms, setRooms] = useState<Array<{ id: string; name: string }>>([]);
  const [allRooms, setAllRooms] = useState<Array<{ id: string; name: string; number?: string }>>([]);
  const id = useId();
  const [roomId, setRoomId] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [reason, setReason] = useState<string>('Bloqueio');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [conflicts, setConflicts] = useState<Array<RoomBlock>>([]);
  const [currentEditingId, setCurrentEditingId] = useState<string | null>(block?.id ?? null);

  function normalizeToIso(dateStr?: string | null): string {
    if (!dateStr) return '';
    // already ISO-like
    if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) return dateStr.slice(0, 10);
    // dd/mm/yyyy -> yyyy-mm-dd
    const m = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (m) return `${m[3]}-${m[2]}-${m[1]}`;
    // fallback: try Date parse
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
    return '';
  }

  useEffect(() => {
    async function loadRooms() {
      try {
        // fetch a short calendar to get rooms list
        const start = new Date().toISOString().slice(0,10);
        const end = start;
        const data = await fetchCalendar(start, end);
        setRooms((data.rooms || []).map((r: any) => ({ id: r.id, name: r.name })));
        // if editing a block, prefer its room_id; otherwise default to first room
        if (block && block.room_id) {
          setRoomId(block.room_id);
        } else if ((data.rooms || []).length > 0) {
          setRoomId((data.rooms || [])[0].id);
        }
        try {
          const lr = await listRooms();
          setAllRooms((lr || []).map((r: any) => ({ id: r.id, name: r.name, number: r.number })));
        } catch (e) {
          // ignore
        }
      } catch (e) {
        // ignore
      }
    }
    if (open) loadRooms();
  }, [open]);

  useEffect(() => {
    // when modal opens for creation, reset fields
    if (open && !block) {
      setRoomId('');
      setStartDate('');
      setEndDate('');
      setReason('Bloqueio');
      setCurrentEditingId(null);
      setConflicts([]);
      setError(null);
      return;
    }

    // when editing, populate fields from block
    if (block) {
      setRoomId(block.room_id);
      setStartDate(normalizeToIso(block.start_date));
      setEndDate(normalizeToIso(block.end_date));
      setReason(block.reason || 'Bloqueio');
      setCurrentEditingId(block.id ?? null);
      setConflicts([]);
      setError(null);
    }
  }, [block]);

  async function submit(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);
    if (!roomId || !startDate || !endDate) {
      setError('Todos os campos são obrigatórios');
      return;
    }

    // check for overlapping blocks for the same room
    try {
      const found = await fetchRoomBlocks(startDate, endDate);
      const overlaps = (found || []).filter((b: RoomBlock) => b.room_id === roomId && !(b.end_date < startDate || b.start_date > endDate));
      // if updating, exclude the block itself
      const filtered = overlaps.filter((b: RoomBlock) => !(currentEditingId && b.id === currentEditingId));
      if (filtered.length > 0) {
        setConflicts(filtered);
        setError('Existe(n) bloqueio(s) ativo(s) no período selecionado. Você pode editar o bloqueio existente.');
        return;
      }
    } catch (err) {
      // ignore fetch errors, continue
    }

    setSaving(true);
    try {
      if (currentEditingId) {
        await updateRoomBlock(currentEditingId, { room_id: roomId, start_date: startDate, end_date: endDate, reason });
      } else {
        await createRoomBlock({ room_id: roomId, start_date: startDate, end_date: endDate, reason });
      }
      onSaved?.();
    } catch (err: any) {
      setError(err?.message || 'Erro ao criar bloqueio');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!block || !block.id) return;
    setConfirmDeleteOpen(true);
  }

  return (
    <Modal open={open} title={block && block.id ? 'Editar bloqueio de quarto' : 'Criar bloqueio de quarto'} onClose={onClose} closeOnBackdrop={false}>
      <form onSubmit={submit} className="form">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
          <div className="form-group">
            <label htmlFor={`${id}-room`}>Quarto</label>
            <select id={`${id}-room`} value={roomId} onChange={(e) => setRoomId(e.target.value)}>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>

            <div className="form-group">
              <label htmlFor={`${id}-start`}>Início</label>
              <input id={`${id}-start`} type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>

            <div className="form-group">
              <label htmlFor={`${id}-end`}>Fim</label>
              <input id={`${id}-end`} type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor={`${id}-reason`}>Motivo</label>
            <input id={`${id}-reason`} type="text" value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>

          {error ? <div style={{ color: 'red' }}>{error}</div> : null}

          {conflicts.length > 0 ? (
            <div className="form-group" style={{ background: '#fff7ed', border: '1px solid #fbd38d', padding: 12 }}>
              <strong>Bloqueio(s) ativo(s) no período:</strong>
              <ul>
                {conflicts.map((c) => {
                  const room = allRooms.find((r) => r.id === c.room_id) || { number: undefined, name: c.room_id };
                  const roomLabel = room.number ? `${room.number} — ${room.name}` : room.name || c.room_id;
                  return (
                    <li key={c.id}>
                      {roomLabel} — {formatDate(c.start_date)} → {formatDate(c.end_date)}{' '}
                      <button
                        className="link"
                        onClick={() => {
                          // load conflict into form for editing
                          setRoomId(c.room_id);
                          setStartDate(c.start_date);
                          setEndDate(c.end_date);
                          setReason(c.reason || 'Bloqueio');
                          setCurrentEditingId(c.id ?? null);
                          setConflicts([]);
                          setError(null);
                        }}
                      >
                        Editar bloqueio existente
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}

          <div className="form-actions">
            <button type="button" className="secondary" onClick={onClose} disabled={saving}>Cancelar</button>
            {block && block.id ? (
              <button type="button" onClick={handleDelete} disabled={saving} className="danger">Excluir</button>
            ) : null}
            <button className="primary" type="submit" disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</button>
          </div>
        </div>
      </form>
      <ConfirmDialog
        open={confirmDeleteOpen}
        message={block ? 'Deseja realmente excluir este bloqueio?' : ''}
        onCancel={() => setConfirmDeleteOpen(false)}
        onConfirm={async () => {
          if (!block || !block.id) return;
          setConfirmDeleteOpen(false);
          setSaving(true);
          try {
            await deleteRoomBlock(block.id);
            onSaved?.();
          } catch (err: any) {
            setError(err?.message || 'Erro ao excluir bloqueio');
          } finally {
            setSaving(false);
          }
        }}
      />

      <ErrorDialog open={!!error} message={error || ''} onClose={() => setError(null)} />
    </Modal>
  );
}
