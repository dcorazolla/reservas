import { useEffect, useState } from 'react';
import { listInvoices, updateInvoice, cancelInvoice } from '../api/invoices';
import Modal from '../components/Modal/Modal';
import ErrorDialog from '../components/Common/ErrorDialog';
import { Link } from 'react-router-dom';
import type { Invoice } from '../types/invoice';

function formatMoney(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function InvoicesPage() {
  const [items, setItems] = useState<Invoice[]>([]);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<Invoice | null>(null);
  const [error, setError] = useState('');

  async function doUpdate(id: string, payload: Partial<Invoice>) {
    try {
      await updateInvoice(id, payload);
      setEditOpen(false);
      setEditing(null);
      await load();
    } catch (err: any) {
      setError(err?.message || 'Falha ao atualizar fatura');
    }
  }

  async function doCancel(id: string) {
    if (!confirm('Confirma cancelar esta fatura?')) return;
    try {
      await cancelInvoice(id);
      await load();
    } catch (err: any) {
      setError(err?.message || 'Falha ao cancelar fatura');
    }
  }

  async function load() {
    const res = await listInvoices({ per_page: 50 });
    // backend returns paginated object; items are in data
    setItems(res.data || res);
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="page">
      <div className="page-header">
        <h2>Faturas</h2>
      </div>

      <table className="table">
        <thead>
          <tr><th>Nº</th><th>Parceiro</th><th>Emitida</th><th>Total</th><th>Status</th><th></th></tr>
        </thead>
        <tbody>
          {items.map(i => (
            <tr key={i.id}>
              <td>{i.number || '-'}</td>
              <td>{i.partner?.name || '-'}</td>
              <td>{i.issued_at || '-'}</td>
              <td>{formatMoney(i.total)}</td>
              <td>{i.status}</td>
                <td>
                  <Link to={`/invoices/${i.id}`}>Ver</Link>
                  {' | '}
                  <button className="link-like" onClick={() => { setEditing(i); setEditOpen(true); }}>Editar</button>
                  {' | '}
                  <button className="link-like danger" onClick={() => doCancel(i.id)}>Cancelar</button>
                </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal open={editOpen} title="Editar Fatura" onClose={() => { setEditOpen(false); setEditing(null); }}>
        {editing ? (
          <InvoiceEditForm invoice={editing} onSave={doUpdate} onCancel={() => { setEditOpen(false); setEditing(null); }} />
        ) : null}
      </Modal>

      <ErrorDialog open={!!error} message={error} onClose={() => setError('')} />
    </div>
  );
}
