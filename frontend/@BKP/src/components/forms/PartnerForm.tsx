import { useEffect, useState, useId } from 'react';
import type { Partner } from '@typings/partner';
import { createPartner, updatePartner } from '@api/partners';
import { ErrorDialog } from '@components/Common';

type Props = {
  partner: Partner | null;
  onSaved: () => void;
  onClose: () => void;
};

export default function PartnerForm({ partner, onSaved, onClose }: Props) {
  const id = useId();
  const [form, setForm] = useState<Partial<Partner>>({
    name: '',
    email: '',
    phone: '',
    tax_id: '',
    address: '',
    notes: '',
    billing_rule: 'none',
    partner_discount_percent: null,
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
          <label htmlFor={`${id}-name`}>Nome</label>
          <input id={`${id}-name`} value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </div>

        <div className="form-group">
          <label htmlFor={`${id}-email`}>Email</label>
          <input id={`${id}-email`} type="email" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>

        <div className="form-group">
          <label htmlFor={`${id}-phone`}>Telefone</label>
          <input id={`${id}-phone`} value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>

        <div className="form-group">
          <label htmlFor={`${id}-tax`}>CPF / CNPJ</label>
          <input id={`${id}-tax`} value={form.tax_id || ''} onChange={(e) => setForm({ ...form, tax_id: e.target.value })} />
        </div>

        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label htmlFor={`${id}-address`}>Endereço</label>
          <input id={`${id}-address`} value={form.address || ''} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        </div>

        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label htmlFor={`${id}-notes`}>Notas</label>
          <textarea id={`${id}-notes`} value={form.notes || ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </div>

        <div className="form-group">
          <label htmlFor={`${id}-billing`}>Regra de Cobrança</label>
          <select id={`${id}-billing`} value={form.billing_rule || 'none'} onChange={(e) => setForm({ ...form, billing_rule: e.target.value as any })}>
            <option value="none">Nenhuma (padrão)</option>
            <option value="charge_partner">Cobrar parceiro</option>
            <option value="charge_guest">Cobrar hóspede</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor={`${id}-discount`}>Desconto parceiro (%)</label>
          <input id={`${id}-discount`} type="number" min={0} max={100} value={form.partner_discount_percent ?? ''} onChange={(e) => setForm({ ...form, partner_discount_percent: e.target.value === '' ? null : Number(e.target.value) })} />
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
