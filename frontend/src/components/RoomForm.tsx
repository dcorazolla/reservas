import { useEffect, useState } from "react";
import { Room } from "../types/room";
import { RoomCategory } from "../types/roomCategory";
import { createRoom, updateRoom } from "../api/rooms";

type Props = {
  room: Room | null;
  categories: RoomCategory[];
  onSaved: () => void;
  onClose: () => void;
};

export default function RoomForm({
  room,
  categories,
  onSaved,
  onClose,
}: Props) {
  const [form, setForm] = useState<any>({
    number: "",
    name: "",
    beds: 1,
    capacity: 1,
    room_category_id: "",
    notes: "",
  });

  useEffect(() => {
    if (room) {
      setForm({
        ...room,
        room_category_id: room.room_category_id ?? "",
      });
    }
  }, [room]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    const payload = {
      ...form,
      room_category_id: form.room_category_id || null,
    };

    room
      ? await updateRoom(room.id, payload)
      : await createRoom(payload);

    onSaved();
    onClose();
  }

  return (
    <form onSubmit={submit} className="form">
      <div className="form-group">
        <label>Categoria</label>
        <select
          value={form.room_category_id}
          onChange={(e) =>
            setForm({ ...form, room_category_id: e.target.value })
          }
        >
          <option value="">— Sem categoria —</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Número</label>
        <input
          value={form.number}
          onChange={(e) => setForm({ ...form, number: e.target.value })}
          required
        />
      </div>

      <div className="form-group">
        <label>Nome</label>
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
      </div>

      <div className="form-group">
        <label>Capacidade</label>
        <input
          value={form.capacity}
          onChange={(e) => setForm({ ...form, capacity: e.target.value })}
          required
        />
      </div>

      <div className="form-group">
        <label>Camas</label>
        <input
          value={form.beds}
          onChange={(e) => setForm({ ...form, beds: e.target.value })}
          required
        />
      </div>

      <div className="form-actions">
        <button type="button" className="secondary" onClick={onClose}>
          Cancelar
        </button>
        <button className="primary">Salvar</button>
      </div>
    </form>
  );
}
