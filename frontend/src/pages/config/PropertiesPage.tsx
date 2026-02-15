import { useEffect, useState } from "react";
import type { Property } from "../../types/property";
import { listProperties, deleteProperty } from "../../api/properties";
import Modal from "../../components/Modal";
import { ConfirmDialog, ErrorDialog } from "../../components/Common";
import { PropertyForm } from "../../components/forms";

export default function PropertiesPage() {
  const [items, setItems] = useState<Property[]>([]);
  const [editing, setEditing] = useState<Property | null>(null);
  const [open, setOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Property | null>(null);
  const [error, setError] = useState<string>("");

  async function load() {
    setItems(await listProperties());
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <h2>Propriedades</h2>
        <button
          className="primary"
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          Nova Propriedade
        </button>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Timezone</th>
            <th style={{ width: 160 }}></th>
          </tr>
        </thead>
        <tbody>
          {items.map((p) => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>{p.timezone || "-"}</td>
              <td className="table-actions">
                <button
                  className="link"
                  onClick={() => {
                    setEditing(p);
                    setOpen(true);
                  }}
                >
                  Editar
                </button>
                <button className="link" onClick={() => setToDelete(p)}>
                  Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal
        open={open}
        title={editing ? "Editar Propriedade" : "Nova Propriedade"}
        onClose={() => setOpen(false)}
      >
        <PropertyForm property={editing} onSaved={load} onClose={() => setOpen(false)} />
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        message={toDelete ? `Remover propriedade "${toDelete.name}"?` : ""}
        onCancel={() => setToDelete(null)}
        onConfirm={async () => {
          if (!toDelete) return;
          try {
            await deleteProperty(toDelete.id);
            setToDelete(null);
            load();
          } catch (err: any) {
            setError(err?.message || "Não foi possível excluir a propriedade.");
          }
        }}
      />

      <ErrorDialog open={!!error} message={error} onClose={() => setError("")} />
    </div>
  );
}
