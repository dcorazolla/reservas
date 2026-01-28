import { useEffect, useMemo, useState } from "react";
import { listRooms } from "../../../api/rooms";
import { listRoomCategories } from "../../../api/roomCategories";
import type { Room } from "../../../types/room";
import type { RoomCategory } from "../../../types/roomCategory";
import { listRoomRatePeriods, createRoomRatePeriod, deleteRoomRatePeriod } from "../../../api/rates";
import { listCategoryRatePeriods, createCategoryRatePeriod, deleteCategoryRatePeriod } from "../../../api/rates";
import type { RoomRatePeriod, RoomCategoryRatePeriod } from "../../../types/rate";
import { formatMoney, formatMoneyNullable } from "../../../utils/money";
import { formatDate } from "../../../utils/dates";
import RatePeriodModal from "../../../components/rates/RatePeriodModal";
import CategoryRatePeriodModal from "../../../components/rates/CategoryRatePeriodModal";

export default function PeriodTariffsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [categories, setCategories] = useState<RoomCategory[]>([]);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [roomPeriods, setRoomPeriods] = useState<RoomRatePeriod[]>([]);
  const [categoryPeriods, setCategoryPeriods] = useState<RoomCategoryRatePeriod[]>([]);

  const [openRoomPeriod, setOpenRoomPeriod] = useState(false);
  const [openCategoryPeriod, setOpenCategoryPeriod] = useState(false);

  useEffect(() => {
    (async () => {
      setRooms(await listRooms());
      setCategories(await listRoomCategories());
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (!roomId) return;
      setRoomPeriods(await listRoomRatePeriods(roomId));
    })();
  }, [roomId]);

  useEffect(() => {
    (async () => {
      if (!categoryId) return;
      setCategoryPeriods(await listCategoryRatePeriods(categoryId));
    })();
  }, [categoryId]);

  const selectedRoom = useMemo(() => rooms.find((r) => r.id === roomId) || null, [rooms, roomId]);
  const selectedCategory = useMemo(() => categories.find((c) => c.id === categoryId) || null, [categories, categoryId]);

  async function saveRoomPeriod(values: { start_date: string; end_date: string; people_count: number; price_per_day: number }) {
    if (!roomId) return;
    const period = await createRoomRatePeriod(roomId, values);
    setRoomPeriods((prev) => [period, ...prev]);
  }

  async function removeRoomPeriod(id: string) {
    await deleteRoomRatePeriod(id);
    setRoomPeriods((prev) => prev.filter((r) => r.id !== id));
  }

  async function saveCategoryPeriod(values: { start_date: string; end_date: string; base_one_adult?: number | null; base_two_adults?: number | null; additional_adult?: number | null; child_price?: number | null; description?: string | null }) {
    if (!categoryId) return;
    const period = await createCategoryRatePeriod(categoryId, values);
    setCategoryPeriods((prev) => [period, ...prev]);
  }

  async function removeCategoryPeriod(id: string) {
    await deleteCategoryRatePeriod(id);
    setCategoryPeriods((prev) => prev.filter((r) => r.id !== id));
  }

  return (
    <div className="page">
      <div className="page-header">
        <h2>Tarifas de Período</h2>
      </div>

      <section className="card" style={{ marginBottom: 16 }}>
        <h3>Por Categoria</h3>
        <div className="form-row">
          <label>
            <div>Categoria</div>
            <select value={categoryId ?? ''} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="" disabled>Selecione uma categoria</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </label>
          <button className="primary" onClick={() => setOpenCategoryPeriod(true)} disabled={!categoryId}>Adicionar</button>
        </div>

        {selectedCategory && (
          <table className="table">
            <thead>
              <tr>
                <th>Início</th>
                <th>Fim</th>
                <th>Base 1 adulto</th>
                <th>Base 2 adultos</th>
                <th>Adicional adulto</th>
                <th>Preço criança</th>
                <th style={{ width: 120 }}></th>
              </tr>
            </thead>
            <tbody>
              {categoryPeriods.map((p) => (
                <tr key={p.id}>
                  <td>{formatDate(p.start_date)}</td>
                  <td>{formatDate(p.end_date)}</td>
                  <td>{formatMoneyNullable(p.base_one_adult)}</td>
                  <td>{formatMoneyNullable(p.base_two_adults)}</td>
                  <td>{formatMoneyNullable(p.additional_adult)}</td>
                  <td>{formatMoneyNullable(p.child_price)}</td>
                  <td className="table-actions">
                    <button className="link" onClick={() => removeCategoryPeriod(p.id)}>Excluir</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="card">
        <h3>Por Quarto</h3>
        <div className="form-row">
          <label>
            <div>Quarto</div>
            <select value={roomId ?? ''} onChange={(e) => setRoomId(e.target.value)}>
              <option value="" disabled>Selecione um quarto</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.number ? `${r.number} - ${r.name}` : r.name}
                </option>
              ))}
            </select>
          </label>
          <button className="primary" onClick={() => setOpenRoomPeriod(true)} disabled={!roomId}>Adicionar</button>
        </div>

        {selectedRoom && (
          <table className="table">
            <thead>
              <tr>
                <th>Início</th>
                <th>Fim</th>
                <th>Pessoas</th>
                <th>Preço/dia</th>
                <th style={{ width: 120 }}></th>
              </tr>
            </thead>
            <tbody>
              {roomPeriods.map((p) => (
                <tr key={p.id}>
                  <td>{formatDate(p.start_date)}</td>
                  <td>{formatDate(p.end_date)}</td>
                  <td>{p.people_count}</td>
                  <td>{formatMoney(p.price_per_day)}</td>
                  <td className="table-actions">
                    <button className="link" onClick={() => removeRoomPeriod(p.id)}>Excluir</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <RatePeriodModal open={openRoomPeriod} initial={{}} onClose={()=>setOpenRoomPeriod(false)} onSave={saveRoomPeriod} title="Período do Quarto" />
      <CategoryRatePeriodModal open={openCategoryPeriod} onClose={()=>setOpenCategoryPeriod(false)} onSave={saveCategoryPeriod} />
    </div>
  );
}
