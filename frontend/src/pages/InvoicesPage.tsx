import { useEffect, useState } from 'react';
import { listInvoices } from '../api/invoices';
import { Link } from 'react-router-dom';
import type { Invoice } from '../types/invoice';

function formatMoney(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function InvoicesPage() {
  const [items, setItems] = useState<Invoice[]>([]);

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
              <td><Link to={`/invoices/${i.id}`}>Ver</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
