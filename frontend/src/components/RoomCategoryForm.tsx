import { useEffect, useState } from "react";
import type { RoomCategory } from "../types/roomCategory";
import { createRoomCategory, updateRoomCategory } from "../api/roomCategories";
import ErrorDialog from "./Common/ErrorDialog";

type Props = {
  category: RoomCategory | null;
  onSaved: () => void;
  onClose: () => void;
};

export default function RoomCategoryForm({
  category,
  onSaved,
  onClose,
}: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    setName(category?.name ?? "");
    setDescription(category?.description ?? "");
  }, [category]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (category) {
        await updateRoomCategory(category.id, { name, description });
      } else {
        await createRoomCategory({ name, description });
      }
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err?.message || "Falha ao salvar a categoria.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="form">
      <div className="form-group">
        <label>Nome</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label>Descrição</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="form-actions">
        <button
          type="button"
          className="secondary"
          onClick={onClose}
        >
          Cancelar
        </button>
        <button type="submit" className="primary">
          Salvar
        </button>
      </div>

      <ErrorDialog open={!!error} message={error} onClose={() => setError("")} />
    </form>
  );
}
