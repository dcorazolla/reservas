import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getInvoice } from '../../api/invoices';
import { createPayment, listPayments } from '../../api/payments';
import type { Invoice } from '../../types/invoice';
import Modal from '../../components/Modal';
import { ErrorDialog } from '../../components/Common';
import './invoice-detail-page.css';

function formatMoney(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function InvoiceDetailPage() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [payOpen, setPayOpen] = useState(false);
  const [payAmount, setPayAmount] = useState<number | ''>('');
  const [payMethod, setPayMethod] = useState<string>('');
  const [payExternalId, setPayExternalId] = useState<string>('');
  const [payPaidAt, setPayPaidAt] = useState<string>('');
  const [payNotes, setPayNotes] = useState<string>('');
  const [payments, setPayments] = useState<any[]>([]);

  async function load() {
    if (!id) return;
    setLoading(true);
    try {
      const data = await getInvoice(id);
      setInvoice(data);
      // also load payments for this invoice
      try {
        const ps = await listPayments(id);
        setPayments(ps || []);
      } catch (e) {
        // ignore payments load errors for now
      }
    } catch (err: any) {
      setError(err?.message || 'Falha ao carregar fatura');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [id]);

  async function doPay(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;
    try {
      const amount = Number(payAmount);
      if (!amount || amount <= 0) throw new Error('Valor inválido');
      const payload: any = { amount };
      if (payMethod) payload.method = payMethod;
      if (payExternalId) payload.external_id = payExternalId;
      if (payPaidAt) payload.paid_at = payPaidAt;
      if (payNotes) payload.notes = payNotes;

      await createPayment(id, payload);
      setPayOpen(false);
      setPayAmount('');
      setPayMethod('');
      setPayExternalId('');
      setPayPaidAt('');
      setPayNotes('');
      await load();
    } catch (err: any) {
      setError(err?.message || 'Falha ao registar pagamento');
    }
  }

  if (loading) return <p>Carregando fatura…</p>;
  if (!invoice) return <p>Fatura não encontrada</p>;

  return (
    <div className="page">
      <div className="page-header">
        <h2>Fatura {invoice.number || ''}</h2>
        <div>
          <button className="primary" onClick={() => setPayOpen(true)}>Registrar Pagamento</button>
        </div>
      </div>

      <section className="card">
        <div className="section-header">
          <h4>Dados</h4>
        </div>
        <div className="invoice-grid">
          <div>
            <div><strong>Parceiro:</strong> {invoice.partner?.name || '-'}</div>
            <div><strong>Emitida:</strong> {invoice.issued_at || '-'}</div>
            <div><strong>Vencimento:</strong> {invoice.due_at || '-'}</div>
          </div>
          <div>
            <div><strong>Total:</strong> {formatMoney(invoice.total)}</div>
            <div><strong>Pago:</strong> {formatMoney((invoice as any).paid_amount || 0)}</div>
            <div><strong>Saldo:</strong> {formatMoney((invoice as any).balance || 0)}</div>
          </div>
        </div>
      </section>

      <section className="card card--spaced">
        <div className="section-header"><h4>Pagamentos</h4></div>
        <div>
          {payments.length === 0 ? (
            <div>Nenhum pagamento registrado</div>
          ) : (
            <table className="table">
              <thead>
                <tr><th>Data</th><th>Valor</th><th>Método</th><th>Referência</th><th>Notas</th></tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td>{p.paid_at || p.created_at || '-'}</td>
                    <td>{formatMoney(p.amount)}</td>
                    <td>{p.method || '-'}</td>
                    <td>{p.external_id || '-'}</td>
                    <td>{p.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <section className="card card--spaced">
        <div className="section-header"><h4>Linhas</h4></div>
        <table className="table">
          <thead>
            <tr><th>Descrição</th><th>Qtd</th><th>Unitário</th><th>Total</th><th>Alocações</th></tr>
          </thead>
          <tbody>
            {(invoice.lines || []).map((l) => (
              <tr key={l.id}>
                <td>{l.description}</td>
                <td>{l.quantity ?? 1}</td>
                <td>{formatMoney(l.unit_price)}</td>
                <td>{formatMoney(l.line_total ?? ((l.quantity ?? 1) * l.unit_price))}</td>
                <td>
                  {(l as any).allocations && (l as any).allocations.length > 0 ? (
                    (l as any).allocations.map((a: any) => (
                      <div key={a.id}>{formatMoney(a.amount)} ({a.payment?.method || '-'})</div>
                    ))
                  ) : ('-')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <Modal open={payOpen} title="Registrar Pagamento" onClose={() => setPayOpen(false)}>
        <form className="form" onSubmit={doPay}>
          <div className="form-group">
            <label>Valor</label>
            <input type="number" step="0.01" value={payAmount as any} onChange={(e) => setPayAmount(e.target.value === '' ? '' : Number(e.target.value))} required />
          </div>
          <div className="form-group">
            <label>Método</label>
            <input type="text" value={payMethod} onChange={(e) => setPayMethod(e.target.value)} placeholder="ex: cartão, pix, transferência" />
          </div>
          <div className="form-group">
            <label>Referência / External ID</label>
            <input type="text" value={payExternalId} onChange={(e) => setPayExternalId(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Data do Pagamento</label>
            <input type="datetime-local" value={payPaidAt} onChange={(e) => setPayPaidAt(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Notas</label>
            <textarea value={payNotes} onChange={(e) => setPayNotes(e.target.value)} />
          </div>
          <div className="form-actions">
            <button type="button" className="secondary" onClick={() => setPayOpen(false)}>Cancelar</button>
            <button className="primary">Registrar</button>
          </div>
        </form>
      </Modal>

      <ErrorDialog open={!!error} message={error} onClose={() => setError('')} />
    </div>
  );
}
