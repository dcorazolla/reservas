import { useState } from 'react';
import type { Invoice } from '../types/invoice';

type Props = {
  invoice: Invoice;
  onSave: (id: string, payload: Partial<Invoice>) => Promise<void>;
  onCancel: () => void;
};

export default function InvoiceEditForm({ invoice, onSave, onCancel }: Props) {
  const [number, setNumber] = useState(invoice.number || '');
  const [issuedAt, setIssuedAt] = useState(invoice.issued_at || '');
  const [dueAt, setDueAt] = useState(invoice.due_at || '');
  const [status, setStatus] = useState(invoice.status || 'draft');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(invoice.id, { number, issued_at: issuedAt || null, due_at: dueAt || null, status });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Número</label>
        <input value={number} onChange={(e) => setNumber(e.target.value)} />
      </div>

      <div className="form-group">
        <label>Emitida</label>
        <input type="date" value={issuedAt ? issuedAt.split('T')[0] : ''} onChange={(e) => setIssuedAt(e.target.value)} />
      </div>

      <div className="form-group">
        <label>Vencimento</label>
        <input type="date" value={dueAt ? dueAt.split('T')[0] : ''} onChange={(e) => setDueAt(e.target.value)} />
      </div>

      <div className="form-group">
        <label>Status</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="draft">Draft</option>
          <option value="issued">Issued</option>
          <option value="paid">Paid</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="form-actions">
        <button type="button" className="secondary" onClick={onCancel}>Cancelar</button>
        <button className="primary" disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</button>
      </div>
    </form>
  );
}
