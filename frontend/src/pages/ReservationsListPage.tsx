import React, { useState } from 'react';
import { listReservations } from '../api/reservations';
import { formatDate } from '../utils/dates';

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

  return (
    <div className="page">
      <div className="page-header"><h2>Reservas (lista)</h2></div>

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
                <th>ID</th>
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
                  <td>{r.id}</td>
                  <td>{r.guest_name}</td>
                  <td>{r.room_name || r.room_id}</td>
                  <td>{formatDate(r.start_date)}</td>
                  <td>{formatDate(r.end_date)}</td>
                  <td>{r.total_value ?? '-'}</td>
                  <td>{r.partner?.name || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
