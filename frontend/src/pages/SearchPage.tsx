import React, { useMemo, useState } from 'react';
import { searchAvailability } from '../api/availability';
import type { AvailabilityItem } from '../api/availability';
// import ConfirmDialog from '../components/ConfirmDialog';
import { ReservationConfirmModal} from '../components/Reservation';
import { ErrorDialog } from '../components/Common';
import { formatMoney } from '../utils/money';
import { createReservation } from '../api/reservations';

type FormState = {
  checkin: string;
  checkout: string;
  adults: number;
  children: number;
  infants: number;
  guestName: string;
  email?: string;
  phone?: string;
};

function toISODate(d: Date): string {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString().slice(0, 10);
}

export default function SearchPage() {
  const today = toISODate(new Date());
  const tomorrow = toISODate(new Date(Date.now() + 24*60*60*1000));

  const [form, setForm] = useState<FormState>({
    checkin: today,
    checkout: tomorrow,
    adults: 2,
    children: 0,
    infants: 0,
    guestName: '',
    email: '',
    phone: '',
  });

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AvailabilityItem[]>([]);
  const nights = useMemo(() => {
    const inDate = new Date(form.checkin);
    const outDate = new Date(form.checkout);
    const diff = Math.round((outDate.getTime() - inDate.getTime()) / (1000*60*60*24));
    return Math.max(0, diff);
  }, [form.checkin, form.checkout]);

  async function onSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        checkin: form.checkin,
        checkout: form.checkout,
        adults: form.adults,
        children: form.children,
        infants: form.infants,
      };
      const data = await searchAvailability(payload);
      setResults(data);
    } catch (err) {
      setError('Falha na busca de disponibilidade.');
    } finally {
      setLoading(false);
    }
  }

  async function onReserve(item: AvailabilityItem) {
    setConfirm({
      open: true,
      item,
    });
  }

  const [confirm, setConfirm] = useState<{ open: boolean; item: AvailabilityItem | null }>({ open: false, item: null });
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  async function confirmReserve(guestName: string, email?: string, phone?: string) {
    if (!confirm.item) return;
    try {
      await createReservation({
        room_id: confirm.item.room_id,
        guest_name: guestName,
        start_date: form.checkin,
        end_date: form.checkout,
        adults_count: form.adults,
        children_count: form.children,
        infants_count: form.infants,
        email,
        phone,
      });
      setConfirm({ open: false, item: null });
      setError('');
      setSuccess('Reserva criada com sucesso.');
    } catch (err: any) {
      setError(err?.message || 'Falha ao criar reserva.');
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h2>Motor de busca</h2>
      </div>

      <section className="card" style={{ marginBottom: 16 }}>
        <div className="section-header">
          <h3>Buscar Disponibilidade</h3>
        </div>
        <form onSubmit={onSearch} className="form">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label>Check-in</label>
              <input type="date" value={form.checkin} onChange={(e)=>setForm({ ...form, checkin: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Check-out</label>
              <input type="date" value={form.checkout} onChange={(e)=>setForm({ ...form, checkout: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Adultos</label>
              <input type="number" min={1} value={form.adults} onChange={(e)=>setForm({ ...form, adults: Number(e.target.value) })} />
            </div>
            <div className="form-group">
              <label>Crianças</label>
              <input type="number" min={0} value={form.children} onChange={(e)=>setForm({ ...form, children: Number(e.target.value) })} />
            </div>
            <div className="form-group">
              <label>Bebés</label>
              <input type="number" min={0} value={form.infants} onChange={(e)=>setForm({ ...form, infants: Number(e.target.value) })} />
            </div>
          </div>
          <div className="form-actions">
            <button className="primary" type="submit" disabled={loading}>Buscar</button>
          </div>
        </form>
      </section>

      <section className="card">
        <div className="section-header">
          <h4>Resultados</h4>
          <small>{nights} noite(s)</small>
        </div>
        {loading && <p>A procurar disponibilidade…</p>}
        {!loading && results.length === 0 && <p>Nenhum resultado.</p>}
        {!loading && results.length > 0 && (
          <table className="table">
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>Quarto</th>
                <th style={{ textAlign: 'left' }}>Capacidade</th>
                <th style={{ textAlign: 'left' }}>Origem Tarifário</th>
                <th style={{ textAlign: 'left' }}>Total</th>
                <th style={{ textAlign: 'left' }}>Diário</th>
                <th style={{ textAlign: 'left' }}>Resumo</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r.room_id}>
                  <td>{r.room_name} {r.room_number ? `#${r.room_number}` : ''}</td>
                  <td>{r.capacity}</td>
                  <td>{r.pricing_source}</td>
                  <td>{formatMoney(r.total)}</td>
                  <td>
                    {r.days.map(d => (
                      <div key={d.date}>{d.date}: {formatMoney(d.price)}</div>
                    ))}
                  </td>
                  <td>
                    {nights > 0 ? (
                      <span>{nights} noite(s) • {formatMoney(r.total / nights)}/dia</span>
                    ) : (
                      <span>-</span>
                    )}
                  </td>
                  <td>
                    <button className="primary" onClick={()=>onReserve(r)}>Reservar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="card" style={{ marginTop: 16 }}>
        <div className="section-header">
          <h3>Dados do Hóspede</h3>
        </div>
        <div className="form">
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label>Nome</label>
              <input type="text" value={form.guestName} onChange={(e)=>setForm({ ...form, guestName: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Email (opcional)</label>
              <input type="email" value={form.email} onChange={(e)=>setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Telefone (opcional)</label>
              <input type="tel" value={form.phone} onChange={(e)=>setForm({ ...form, phone: e.target.value })} />
            </div>
          </div>
        </div>
      </section>

      <ReservationConfirmModal
        open={confirm.open}
        item={confirm.item}
        checkin={form.checkin}
        checkout={form.checkout}
        guestName={form.guestName}
        email={form.email}
        phone={form.phone}
        onClose={() => setConfirm({ open: false, item: null })}
        onConfirm={confirmReserve}
      />

      <ErrorDialog open={!!error} message={error} onClose={() => setError('')} />
      <ErrorDialog open={!!success} type="success" title="Sucesso" message={success} onClose={() => setSuccess('')} />
    </div>
  );
}
 