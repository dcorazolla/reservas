import React, { useEffect, useState } from 'react';
import { listReservations } from '../../api/reservations';
import { listPartners } from '../../api/partners';
import { post } from '../../api/client';
import { formatDate } from '../../utils/dates';
import './create-invoice-from-reservations.css';

export default function CreateInvoiceFromReservations() {
  const [partnerId, setPartnerId] = useState<string>('');
  const [partners, setPartners] = useState<any[]>([]);
  const [from, setFrom] = useState<string>('');
  const [to, setTo] = useState<string>('');
  const [reservations, setReservations] = useState<any[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function loadPartners() {
      try {
        const p: any = await listPartners();
        setPartners(p || []);
      } catch (e) {
        console.warn(e);
      }
    }
    loadPartners();
  }, []);

  const [onlyBillable, setOnlyBillable] = useState(true);

  async function search(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      // We request reservations for the partner and date range. The backend
      // should expose only billable/checked-out reservations; for now we filter by partner.
      const params: any = { from, to, partner_id: partnerId };
      if (onlyBillable) params.billable = 1;
      const data: any = await listReservations(params);
      setReservations(data || []);
      setSelected({});
    } catch (err: any) {
      setMessage(err?.message || 'Falha ao carregar reservas');
      setReservations([]);
    } finally {
      setLoading(false);
    }
  }

  function toggle(id: string) {
    setSelected(s => ({ ...s, [id]: !s[id] }));
  }

  async function createInvoice() {
    const ids = Object.keys(selected).filter(k => selected[k]);
    if (!partnerId) { setMessage('Selecione um parceiro.'); return; }
    if (ids.length === 0) { setMessage('Selecione ao menos uma reserva.'); return; }
    setLoading(true);
    setMessage('');
    try {
      const payload = { partner_id: partnerId, reservation_ids: ids };
      const resp: any = await post('/api/invoices/from-reservations', payload);
      setMessage('Fatura criada: ' + (resp?.id ?? 'OK'));
      // Optionally refresh list
      await search();
    } catch (e: any) {
      setMessage(e?.message || 'Erro ao criar fatura');
    } finally { setLoading(false); }
  }

  return (
    <div className="page">
      <div className="page-header"><h2>Gerar fatura por parceiro</h2></div>

      <section className="card">
        <form className="form" onSubmit={search}>
          <div className="create-invoice-row">
            <label>Parceiro
              <select value={partnerId} onChange={e=>setPartnerId(e.target.value)}>
                <option value="">(Selecione)</option>
                {partners.map(p=> <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </label>
            <label className="checkbox-label">
              <input type="checkbox" checked={onlyBillable} onChange={e=>setOnlyBillable(e.target.checked)} /> Apenas faturáveis
            </label>
            <label>De <input type="date" value={from} onChange={e=>setFrom(e.target.value)} /></label>
            <label>Até <input type="date" value={to} onChange={e=>setTo(e.target.value)} /></label>
            <button className="primary" type="submit" disabled={loading}>Buscar</button>
          </div>
        </form>

        {message && <div role="status" className="create-invoice-message">{message}</div>}

        {!loading && reservations.length === 0 && <p className="create-invoice-empty">Nenhuma reserva encontrada.</p>}

        {!loading && reservations.length > 0 && (
          <table className="table create-invoice-table">
            <thead>
              <tr>
                <th></th>
                <th>Hóspede</th>
                <th>Quarto</th>
                <th>Entrada</th>
                <th>Saída</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((r:any) => (
                <tr key={r.id}>
                  <td><input type="checkbox" checked={!!selected[r.id]} onChange={()=>toggle(r.id)} /></td>
                  <td>{r.guest_name}</td>
                  <td>{r.room_name || r.room_id}</td>
                  <td>{formatDate(r.start_date)}</td>
                  <td>{formatDate(r.end_date)}</td>
                  <td>{r.total_value ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="create-invoice-actions">
          <button className="secondary" onClick={()=>{ setSelected({}); }}>Limpar seleção</button>
          <button className="primary" onClick={createInvoice} disabled={loading}>Criar fatura</button>
        </div>
      </section>
    </div>
  );
}
