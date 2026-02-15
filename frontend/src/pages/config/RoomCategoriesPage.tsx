import { useEffect, useState } from "react";
import {
  listRoomCategories,
  deleteRoomCategory,
} from "../../api/roomCategories";
import type { RoomCategory } from "../../types/roomCategory";
import { RoomCategoryForm } from "../../components/forms";
import Modal from "../../components/Modal";
import { ConfirmDialog, ErrorDialog } from "../../components/Common";

export default function RoomCategoriesPage() {
  const [categories, setCategories] = useState<RoomCategory[]>([]);
  const [editing, setEditing] = useState<RoomCategory | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [toDelete, setToDelete] = useState<RoomCategory | null>(null);
  const [error, setError] = useState<string>("");

  async function load() {
    setCategories(await listRoomCategories());
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <h2>Categorias de Quartos</h2>
        <button
          className="primary"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          Nova Categoria
        </button>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Descrição</th>
            <th style={{ width: 120 }}></th>
          </tr>
        </thead>
        <tbody>
          {categories.map((c) => (
            <tr key={c.id}>
              <td>{c.name}</td>
              <td>{c.description || "-"}</td>
              <td>
                <div className="table-actions">
                  <button
                    className="link"
                    onClick={() => {
                      setEditing(c);
                      setFormOpen(true);
                    }}
                  >
                    Editar
                  </button>

                  <button
                    className="link"
                    onClick={() => setToDelete(c)}
                  >
                    Excluir
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal
        open={formOpen}
        title={editing ? "Editar Categoria" : "Nova Categoria"}
        onClose={() => setFormOpen(false)}
      >
        <RoomCategoryForm
          category={editing}
          onSaved={load}
          onClose={() => setFormOpen(false)}
        />
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        message={`Remover categoria "${toDelete?.name}"?`}
        onCancel={() => setToDelete(null)}
        onConfirm={async () => {
          if (!toDelete) return;
          try {
            await deleteRoomCategory(toDelete.id);
            setToDelete(null);
            load();
          } catch (err: any) {
            setError(err?.message || "Não foi possível excluir a categoria.");
          }
        }}
      />

      <ErrorDialog open={!!error} message={error} onClose={() => setError("")} />
    </div>
  );
}
