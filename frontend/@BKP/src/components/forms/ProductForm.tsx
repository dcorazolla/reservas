import { useEffect, useId, useState } from 'react';
import type { Product } from '@api/minibar';
import { createProduct, updateProduct } from '@api/minibar';
import { ErrorDialog } from '@components/Common';

type Props = {
  product: Product | null;
  onSaved: () => void;
  onClose: () => void;
};

export default function ProductForm({ product, onSaved, onClose }: Props) {
  const id = useId();
  const [form, setForm] = useState<any>({
    name: '',
    sku: '',
    price: 0,
    stock: 0,
    active: true,
    description: '',
  });

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name ?? '',
        sku: product.sku ?? '',
        price: product.price ?? 0,
        stock: product.stock ?? 0,
        active: !!product.active,
        description: product.description ?? '',
      });
    } else {
      setForm({
        name: '',
        sku: '',
        price: 0,
        stock: 0,
        active: true,
        description: '',
      });
    }
  }, [product]);

  const [error, setError] = useState<string>('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload = {
        name: form.name,
        sku: form.sku || null,
        price: form.price === '' ? null : Number(form.price),
        stock: form.stock === '' ? null : Number(form.stock),
        active: !!form.active,
        description: form.description || null,
      };

      if (product && product.id) {
        await updateProduct(product.id, payload);
      } else {
        await createProduct(payload);
      }

      onSaved();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Falha ao salvar o produto.');
    }
  }

  return (
    <form onSubmit={submit} className="form">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="form-group">
          <label htmlFor={`${id}-name`}>Nome</label>
          <input id={`${id}-name`} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </div>

        <div className="form-group">
          <label htmlFor={`${id}-sku`}>SKU</label>
          <input id={`${id}-sku`} value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
        </div>

        <div className="form-group">
          <label htmlFor={`${id}-price`}>Preço</label>
          <input id={`${id}-price`} type="number" step="0.01" value={form.price ?? 0} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
        </div>

        <div className="form-group">
          <label htmlFor={`${id}-stock`}>Estoque</label>
          <input id={`${id}-stock`} type="number" value={form.stock ?? 0} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} />
        </div>
      </div>

      <div className="form-divider" />

      <div style={{ display: 'grid', gap: 8 }}>
        <label className="checkbox">
          <input type="checkbox" checked={!!form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
          <span>Ativo</span>
        </label>

        <div className="form-group">
          <label htmlFor={`${id}-description`}>Descrição</label>
          <textarea id={`${id}-description`} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
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
