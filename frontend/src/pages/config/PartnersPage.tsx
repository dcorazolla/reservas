import { useEffect, useState } from 'react';
import type { Partner } from '../../types/partner';
import { listPartners, deletePartner } from '../../api/partners';
import Modal from '../../components/Modal/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import ErrorDialog from '../../components/Common/ErrorDialog';
import PartnerForm from '../../components/PartnerForm';

export default function PartnersPage() {
  const [items, setItems] = useState<Partner[]>([]);
  const [editing, setEditing] = useState<Partner | null>(null);
  const [open, setOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Partner | null>(null);
  const [error, setError] = useState<string>('');

  async function load() {
    setItems(await listPartners());
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <h2>Parceiros</h2>
        <button className="primary" onClick={() => { setEditing(null); setOpen(true); }}>
          Novo Parceiro
        </button>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>Telefone</th>
            <th style={{ width: 160 }}></th>
          </tr>
        </thead>
        <tbody>
          {items.map((p) => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>{p.email || '-'}</td>
              <td>{p.phone || '-'}</td>
              <td className="table-actions">
                <button className="link" onClick={() => { setEditing(p); setOpen(true); }}>Editar</button>
                <button className="link" onClick={() => setToDelete(p)}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal open={open} title={editing ? 'Editar Parceiro' : 'Novo Parceiro'} onClose={() => setOpen(false)}>
        <PartnerForm partner={editing} onSaved={load} onClose={() => setOpen(false)} />
      </Modal>

      <ConfirmDialog open={!!toDelete} message={toDelete ? `Remover parceiro "${toDelete.name}"?` : ''} onCancel={() => setToDelete(null)} onConfirm={async () => {
        if (!toDelete) return;
        try {
          await deletePartner(toDelete.id);
          setToDelete(null);
          load();
        } catch (err: any) {
          setError(err?.message || 'Não foi possível excluir o parceiro.');
        }
      }} />

      <ErrorDialog open={!!error} message={error} onClose={() => setError('')} />
    </div>
  );
}
