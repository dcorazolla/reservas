import { useEffect, useState } from 'react';
import type { Partner } from '../types/partner';
import { createPartner, updatePartner } from '../api/partners';
import ErrorDialog from './Common/ErrorDialog';

type Props = {
  partner: Partner | null;
  onSaved: () => void;
  onClose: () => void;
};

export default function PartnerForm({ partner, onSaved, onClose }: Props) {
  const [form, setForm] = useState<Partial<Partner>>({
    name: '',
    email: '',
    phone: '',
    tax_id: '',
    address: '',
    notes: '',
  });
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (partner) setForm(partner as Partial<Partner>);
    else setForm({ name: '', email: '', phone: '', tax_id: '', address: '', notes: '' });
  }, [partner]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (!form.name || form.name.trim() === '') throw new Error('Nome é obrigatório');
      if (partner) {
        await updatePartner(partner.id, form);
      } else {
        await createPartner(form);
      }
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Falha ao salvar parceiro.');
    }
  }

  return (
    <form onSubmit={submit} className="form">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="form-group">
          <label>Nome</label>
          <input value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input type="email" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>

        <div className="form-group">
          <label>Telefone</label>
          <input value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>

        <div className="form-group">
          <label>CPF / CNPJ</label>
          <input value={form.tax_id || ''} onChange={(e) => setForm({ ...form, tax_id: e.target.value })} />
        </div>

        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label>Endereço</label>
          <input value={form.address || ''} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        </div>

        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label>Notas</label>
          <textarea value={form.notes || ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="secondary" onClick={onClose}>Cancelar</button>
        <button className="primary">Salvar</button>
      </div>

      <ErrorDialog open={!!error} message={error} onClose={() => setError('')} />
    </form>
  );
}
