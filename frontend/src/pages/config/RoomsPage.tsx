import { useEffect, useState } from "react";
import type { Room } from "../../types/room";
import type { RoomCategory } from "../../types/roomCategory";
import { listRooms } from "../../api/rooms";
import { listRoomCategories } from "../../api/roomCategories";
import Modal from "../../components/Modal/Modal";
import RoomForm from "../../components/RoomForm";

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [categories, setCategories] = useState<RoomCategory[]>([]);
  const [editing, setEditing] = useState<Room | null>(null);
  const [open, setOpen] = useState(false);

  async function load() {
    setRooms(await listRooms());
    setCategories(await listRoomCategories());
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <h2>Quartos</h2>
        <button
          className="primary"
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          Novo Quarto
        </button>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Nº</th>
            <th>Nome</th>
            <th>Categoria</th>
            <th>Capacidade</th>
            <th>Camas</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rooms.map((r) => (
            <tr key={r.id}>
              <td>{r.number}</td>
              <td>{r.name}</td>
              <td>{r.category?.name ?? "-"}</td>
              <td>{r.capacity}</td>
              <td>{r.beds}</td>
              <td className="table-actions">
                <button
                  className="link"
                  onClick={() => {
                    setEditing(r);
                    setOpen(true);
                  }}
                >
                  Editar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal
        open={open}
        title={editing ? "Editar Quarto" : "Novo Quarto"}
        onClose={() => setOpen(false)}
      >
        <RoomForm
          room={editing}
          categories={categories}
          onSaved={load}
          onClose={() => setOpen(false)}
        />
      </Modal>
    </div>
  );
}
