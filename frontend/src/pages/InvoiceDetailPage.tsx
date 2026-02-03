import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getInvoice } from '../api/invoices';
import { createPayment } from '../api/payments';
import type { Invoice } from '../types/invoice';
import Modal from '../components/Modal/Modal';
import ErrorDialog from '../components/Common/ErrorDialog';

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

  async function load() {
    if (!id) return;
    setLoading(true);
    try {
      const data = await getInvoice(id);
      setInvoice(data);
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
      await createPayment(id, { amount });
      setPayOpen(false);
      setPayAmount('');
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
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

      <section className="card" style={{ marginTop: 12 }}>
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
