import React, { useState } from 'react';
import { listReservations, checkinReservation, checkoutReservation } from '../api/reservations';
import { formatDate } from '../utils/dates';
import ReservationModal from '../components/ReservationModal';

export default function ReservationsListPage() {
  const today = new Date().toISOString().slice(0,10);
  const [from, setFrom] = useState<string>(today);
  const [to, setTo] = useState<string>(today);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState<string>('');

  async function load(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data: any = await listReservations({ from, to });
      setItems(data || []);
    } catch (err: any) {
      setError(err?.message || 'Falha ao carregar reservas');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  const [modalOpen, setModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="page">
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <h2>Lista de Reservas</h2>
        <div style={{ marginLeft: 'auto' }}>
          <button className="primary" onClick={() => setModalOpen(true)}>Criar reserva</button>
        </div>
      </div>

      <section className="card">
        <form className="form" onSubmit={load}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <label>De <input type="date" value={from} onChange={(e)=>setFrom(e.target.value)} /></label>
            <label>Até <input type="date" value={to} onChange={(e)=>setTo(e.target.value)} /></label>
            <button className="primary" type="submit" disabled={loading}>Buscar</button>
            <div style={{ marginLeft: 'auto' }}>{loading ? 'Carregando…' : `${items.length} reservas`}</div>
          </div>
        </form>

        {error && <div role="alert" style={{ color: 'red', marginTop: 8 }}>{error}</div>}

        {!loading && items.length === 0 && <p style={{ marginTop: 12 }}>Nenhuma reserva encontrada para o período selecionado.</p>}

        {!loading && items.length > 0 && (
          <table className="table" style={{ marginTop: 12 }}>
            <thead>
              <tr>
                <th>Hóspede</th>
                <th>Quarto</th>
                <th>Entrada</th>
                <th>Saída</th>
                <th>Total</th>
                <th>Parceiro</th>
              </tr>
            </thead>
            <tbody>
              {items.map((r: any) => (
                <tr key={r.id}>
                  <td>{r.guest_name}</td>
                  <td>{r.room_name || r.room_id}</td>
                  <td>{formatDate(r.start_date)}</td>
                  <td>{formatDate(r.end_date)}</td>
                  <td>{r.total_value ?? '-'}</td>
                  <td>{r.partner?.name || '-'}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    {r.status !== 'checked_in' && r.status !== 'checked_out' && (
                      <button className="secondary" onClick={async () => {
                        try {
                          await checkinReservation(r.id);
                          await load();
                        } catch (e: any) {
                          setError(e?.message || 'Falha ao realizar check-in');
                        }
                      }}>Check-in</button>
                    )}

                    {r.status !== 'checked_out' && (
                      <button style={{ marginLeft: 8 }} className="primary" onClick={async () => {
                        try {
                          await checkoutReservation(r.id);
                          await load();
                        } catch (e: any) {
                          setError(e?.message || 'Falha ao realizar check-out');
                        }
                      }}>{r.status === 'checked_in' ? 'Check-out' : 'Marcar saída'}</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {modalOpen && (
          <ReservationModal
            roomId={null}
            date={null}
            reservation={null}
            onClose={() => setModalOpen(false)}
            onSaved={() => { setModalOpen(false); setRefreshKey(k => k + 1); load(); }}
          />
        )}
      </section>
    </div>
  );
}
