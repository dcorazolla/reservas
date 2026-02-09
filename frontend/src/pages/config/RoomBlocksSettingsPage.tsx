import React, { useEffect, useState } from 'react';
import { fetchRoomBlocks, deleteRoomBlock } from '../../api/roomBlocks';
import { listRooms } from '../../api/rooms';
import RoomBlockModal from '../../components/RoomBlockModal';
import ConfirmDialog from '../../components/ConfirmDialog';
import ErrorDialog from '../../components/Common/ErrorDialog';
import { formatDate } from '../../utils/dates';

export default function RoomBlocksSettingsPage() {
  const [blocks, setBlocks] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<any | null>(null);
  const [toDelete, setToDelete] = useState<any | null>(null);
  const [error, setError] = useState<string>('');

  async function load() {
    setLoading(true);
    try {
      const start = new Date().toISOString().slice(0,10);
      const end = new Date(new Date().getFullYear() + 1, 11, 31).toISOString().slice(0,10);
      const b = await fetchRoomBlocks(start, end);
      setBlocks(b || []);
      const r = await listRooms();
      setRooms(r || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="page">
      <div className="page-header">
        <h2>Bloqueios de Quarto</h2>
        <button
          className="primary"
          onClick={() => {
            setSelectedBlock(null);
            setOpenModal(true);
          }}
        >
          Novo Bloqueio
        </button>
      </div>

      {loading ? (
        <p>Carregando...</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Quarto</th>
              <th>Início</th>
              <th>Fim</th>
              <th>Motivo</th>
              <th style={{ width: 160 }}></th>
            </tr>
          </thead>
          <tbody>
            {blocks.map((b) => (
              <tr key={b.id}>
                <td>{(rooms.find((r) => r.id === b.room_id)?.name) || b.room_id}</td>
                <td>{formatDate(b.start_date)}</td>
                <td>{formatDate(b.end_date)}</td>
                <td>{b.reason}</td>
                <td className="table-actions">
                  <button
                    className="link"
                    onClick={() => {
                      setSelectedBlock(b);
                      setOpenModal(true);
                    }}
                  >
                    Editar
                  </button>
                  <button className="link" onClick={() => setToDelete(b)}>Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <RoomBlockModal
        open={openModal}
        block={selectedBlock}
        onClose={() => {
          setSelectedBlock(null);
          setOpenModal(false);
        }}
        onSaved={() => {
          setSelectedBlock(null);
          setOpenModal(false);
          load();
        }}
      />

      <ConfirmDialog
        open={!!toDelete}
        message={toDelete ? `Remover bloqueio do quarto ${toDelete.room_id} (${toDelete.start_date} → ${toDelete.end_date})?` : ''}
        onCancel={() => setToDelete(null)}
        onConfirm={async () => {
          if (!toDelete) return;
          try {
            await deleteRoomBlock(toDelete.id);
            setToDelete(null);
            load();
          } catch (err: any) {
            setError(err?.message || 'Não foi possível excluir o bloqueio.');
          }
        }}
      />

      <ErrorDialog open={!!error} message={error} onClose={() => setError('')} />
    </div>
  );

    }
