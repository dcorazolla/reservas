import { useEffect, useState, useId } from "react";
import type { Room } from "../types/room";
import type { RoomCategory } from "../types/roomCategory";
import { createRoom, updateRoom } from "../api/rooms";
import ErrorDialog from "./Common/ErrorDialog";
import RoomRatesEditor from "./rates/RoomRatesEditor";
import RoomRatePeriodsEditor from "./rates/RoomRatePeriodsEditor";

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
  const id = useId();
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

  const [error, setError] = useState<string>("");
  const [showRates, setShowRates] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        room_category_id: form.room_category_id || null,
      };

      room
        ? await updateRoom(room.id, payload)
        : await createRoom(payload);

      onSaved();
      onClose();
    } catch (err: any) {
      setError(err?.message || "Falha ao salvar o quarto.");
    }
  }

  return (
    <form onSubmit={submit} className="form">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="form-group">
          <label htmlFor={`${id}-category`}>Categoria</label>
          <select
            id={`${id}-category`}
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
          <label htmlFor={`${id}-number`}>Número</label>
          <input
            id={`${id}-number`}
            value={form.number}
            onChange={(e) => setForm({ ...form, number: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor={`${id}-name`}>Nome</label>
          <input
            id={`${id}-name`}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor={`${id}-capacity`}>Capacidade</label>
          <input
            id={`${id}-capacity`}
            value={form.capacity}
            onChange={(e) => setForm({ ...form, capacity: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor={`${id}-beds`}>Camas</label>
          <input
            id={`${id}-beds`}
            value={form.beds}
            onChange={(e) => setForm({ ...form, beds: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="form-divider" />

      <label className="checkbox">
        <input
          type="checkbox"
          checked={showRates}
          onChange={(e) => setShowRates(e.target.checked)}
        />
        <span>Editar tarifário do quarto</span>
      </label>

      {showRates && room?.id && (
        <div style={{ display: 'grid', gap: 16 }}>
          <RoomRatesEditor roomId={room.id} />
          <RoomRatePeriodsEditor roomId={room.id} />
        </div>
      )}

      <div className="form-actions">
        <button type="button" className="secondary" onClick={onClose}>
          Cancelar
        </button>
        <button className="primary">Salvar</button>
      </div>

      <ErrorDialog open={!!error} message={error} onClose={() => setError("")} />
    </form>
  );
}
