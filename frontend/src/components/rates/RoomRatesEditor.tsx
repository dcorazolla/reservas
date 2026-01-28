import { useEffect, useState } from "react";
import type { RoomRate } from "../../types/rate";
import { listRoomRates, createRoomRate, deleteRoomRate } from "../../api/rates";
import ErrorDialog from "../Common/ErrorDialog";
import { formatMoney } from "../../utils/money";

type Props = {
  roomId: number;
};

export default function RoomRatesEditor({ roomId }: Props) {
  const [rates, setRates] = useState<RoomRate[]>([]);
  const [error, setError] = useState<string>("");
  const [form, setForm] = useState<{ people_count: number | ""; price_per_day: number | "" }>({ people_count: "", price_per_day: "" });
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      const r = await listRoomRates(roomId);
      setRates(r.sort((a, b) => a.people_count - b.people_count));
    } catch (err: any) {
      setError(err?.message || "Falha ao carregar tarifas do quarto.");
    }
  }

  useEffect(() => {
    load();
  }, [roomId]);

  async function add() {
    if (!form.people_count || !form.price_per_day) return;
    setSaving(true);
    try {
      const created = await createRoomRate(roomId, {
        people_count: Number(form.people_count),
        price_per_day: Number(form.price_per_day),
      });
      setForm({ people_count: "", price_per_day: "" });
      setRates((prev) => [...prev.filter((x) => x.id !== created.id), created].sort((a, b) => a.people_count - b.people_count));
    } catch (err: any) {
      setError(err?.message || "Falha ao adicionar tarifa.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: number) {
    try {
      await deleteRoomRate(id);
      setRates((prev) => prev.filter((x) => x.id !== id));
    } catch (err: any) {
      setError(err?.message || "Falha ao excluir tarifa.");
    }
  }

  return (
    <div>
      <div className="section-header">
        <h4>Tarifas Base (por pessoas)</h4>
      </div>

      <div className="form" style={{ marginBottom: 8 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 8 }}>
          <div className="form-group">
            <label>Pessoas</label>
            <input type="number" min={1} value={form.people_count}
                   onChange={(e) => setForm({ ...form, people_count: e.target.value === "" ? "" : Number(e.target.value) })} />
          </div>
          <div className="form-group">
            <label>Preço por dia</label>
            <input type="number" step="0.01" min={0} value={form.price_per_day}
                   onChange={(e) => setForm({ ...form, price_per_day: e.target.value === "" ? "" : Number(e.target.value) })} />
          </div>
          <div className="form-actions">
            <button className="primary" onClick={add} disabled={saving}>Adicionar</button>
          </div>
        </div>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Pessoas</th>
            <th>Preço/dia</th>
            <th style={{ width: 120 }}></th>
          </tr>
        </thead>
        <tbody>
          {rates.map((r) => (
            <tr key={r.id}>
              <td>{r.people_count}</td>
              <td>{formatMoney(r.price_per_day)}</td>
              <td className="table-actions">
                <button className="link" onClick={() => remove(r.id)}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ErrorDialog open={!!error} message={error} onClose={() => setError("")} />
    </div>
  );
}
