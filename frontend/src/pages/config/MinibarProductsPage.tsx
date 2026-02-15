import React, { useEffect, useState } from 'react';
import { listProducts, type Product, createProduct, updateProduct, deleteProduct } from '../../api/minibar';
import './minibar-products-page.css';

function ProductForm({ initial, onCancel, onSave }: { initial?: Partial<Product>, onCancel: () => void, onSave: (p: Partial<Product>) => void }) {
  const [state, setState] = useState<Partial<Product>>(initial || {});

  useEffect(() => setState(initial || {}), [initial]);

  return (
    <div className="minibar-product-form">
      <label>Nome
        <input value={state.name || ''} onChange={(e) => setState(s => ({ ...s, name: e.target.value }))} />
      </label>
      <label>SKU
        <input value={state.sku || ''} onChange={(e) => setState(s => ({ ...s, sku: e.target.value }))} />
      </label>
      <label>Preço
        <input type="number" step="0.01" value={(state.price ?? 0).toString()} onChange={(e) => setState(s => ({ ...s, price: Number(e.target.value || 0) }))} />
      </label>
      <label>Estoque
        <input type="number" value={(state.stock ?? 0).toString()} onChange={(e) => setState(s => ({ ...s, stock: Number(e.target.value || 0) }))} />
      </label>
      <label>
        <input type="checkbox" checked={!!state.active} onChange={(e) => setState(s => ({ ...s, active: e.target.checked }))} /> Ativo
      </label>
      <div className="actions">
        <button onClick={() => onSave(state)}>Salvar</button>
        <button className="secondary" onClick={onCancel}>Cancelar</button>
      </div>
    </div>
  );
}

export default function MinibarProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Product> | null>(null);
  const [creating, setCreating] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await listProducts();
      setProducts(res || []);
    } catch (e) {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleSave(payload: Partial<Product>) {
    try {
      if (editing && editing.id) {
        const updated = await updateProduct(editing.id, payload);
        setProducts(p => p.map(x => x.id === updated.id ? updated : x));
        setEditing(null);
      } else {
        const created = await createProduct(payload);
        setProducts(p => [created, ...p]);
        setCreating(false);
      }
    } catch (err) {
      // show error (left minimal for now)
      console.error(err);
    }
  }

  async function handleDelete(id?: string) {
    if (!id) return;
    if (!confirm('Confirmar exclusão deste produto?')) return;
    try {
      await deleteProduct(id);
      setProducts(p => p.filter(x => x.id !== id));
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="minibar-products-page">
      <h2>Catálogo de Produtos (Frigobar)</h2>
      <div className="toolbar">
        <button onClick={() => setCreating(true)}>Novo Produto</button>
        <button className="secondary" onClick={load}>Atualizar</button>
      </div>

      {loading ? <p>Carregando...</p> : (
        <table className="products-table">
          <thead>
            <tr><th>Nome</th><th>SKU</th><th>Preço</th><th>Estoque</th><th>Ativo</th><th></th></tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.sku}</td>
                <td>{p.price?.toFixed(2)}</td>
                <td>{p.stock}</td>
                <td>{p.active ? '✓' : '—'}</td>
                <td className="actions-cell">
                  <button onClick={() => setEditing(p)}>Editar</button>
                  <button className="danger" onClick={() => handleDelete(p.id)}>Remover</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {(creating || editing) && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>{editing ? 'Editar Produto' : 'Novo Produto'}</h3>
            <ProductForm initial={editing ?? undefined} onCancel={() => { setEditing(null); setCreating(false); }} onSave={handleSave} />
          </div>
        </div>
      )}
    </div>
  );
}
