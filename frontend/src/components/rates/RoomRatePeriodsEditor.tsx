import { useEffect, useState } from "react";
import type { RoomRatePeriod } from "../../types/rate";
import { listRoomRatePeriods, createRoomRatePeriod, deleteRoomRatePeriod } from "../../api/rates";
import ErrorDialog from "../Common/ErrorDialog";
import { formatMoney } from "../../utils/money";

type Props = {
  roomId: string;
};

export default function RoomRatePeriodsEditor({ roomId }: Props) {
  const [periods, setPeriods] = useState<RoomRatePeriod[]>([]);
  const [error, setError] = useState<string>("");
  const [form, setForm] = useState<{ start_date: string; end_date: string; people_count: number | ""; price_per_day: number | ""; description: string }>(
    { start_date: "", end_date: "", people_count: "", price_per_day: "", description: "" }
  );
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      const r = await listRoomRatePeriods(roomId);
      setPeriods(r);
    } catch (err: any) {
      setError(err?.message || "Falha ao carregar períodos do quarto.");
    }
  }

  useEffect(() => {
    load();
  }, [roomId]);

  async function add() {
    if (!form.start_date || !form.end_date || !form.people_count || !form.price_per_day) return;
    setSaving(true);
    try {
      const created = await createRoomRatePeriod(roomId, {
        start_date: form.start_date,
        end_date: form.end_date,
        people_count: Number(form.people_count),
        price_per_day: Number(form.price_per_day),
        description: form.description || undefined,
      });
      setForm({ start_date: "", end_date: "", people_count: "", price_per_day: "", description: "" });
      setPeriods((prev) => [created, ...prev]);
    } catch (err: any) {
      setError(err?.message || "Falha ao adicionar período.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    try {
      await deleteRoomRatePeriod(id);
      setPeriods((prev) => prev.filter((x) => x.id !== id));
    } catch (err: any) {
      setError(err?.message || "Falha ao excluir período.");
    }
  }

  return (
    <div>
      <div className="section-header">
        <h4>Tarifas por Período</h4>
      </div>

      <div className="form" style={{ marginBottom: 8 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
          <div className="form-group">
            <label>Início</label>
            <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Fim</label>
            <input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
          </div>
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
        </div>
        <div className="form-group">
          <label>Descrição (opcional)</label>
          <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="form-actions">
          <button className="primary" onClick={add} disabled={saving}>Adicionar</button>
        </div>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Início</th>
            <th>Fim</th>
            <th>Pessoas</th>
            <th>Preço/dia</th>
            <th>Descrição</th>
            <th style={{ width: 120 }}></th>
          </tr>
        </thead>
        <tbody>
          {periods.map((p) => (
            <tr key={p.id}>
              <td>{p.start_date}</td>
              <td>{p.end_date}</td>
              <td>{p.people_count}</td>
              <td>{formatMoney(p.price_per_day)}</td>
              <td>{p.description || '-'}</td>
              <td className="table-actions">
                <button className="link" onClick={() => remove(p.id)}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ErrorDialog open={!!error} message={error} onClose={() => setError("")} />
    </div>
  );
}
