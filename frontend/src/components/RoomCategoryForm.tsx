import { useEffect, useState } from "react";
import { RoomCategory } from "../types/roomCategory";
import { createRoomCategory, updateRoomCategory } from "../api/roomCategories";

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

  useEffect(() => {
    setName(category?.name ?? "");
    setDescription(category?.description ?? "");
  }, [category]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (category) {
      await updateRoomCategory(category.id, { name, description });
    } else {
      await createRoomCategory({ name, description });
    }

    onSaved();
    onClose();
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
    </form>
  );
}
