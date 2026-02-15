import { useEffect, useMemo, useState } from "react";
import { listRooms } from "../../../api/rooms";
import { listRoomCategories } from "../../../api/roomCategories";
import type { Room } from "../../../types/room";
import type { RoomCategory } from "../../../types/roomCategory";
import { listRoomRates, createRoomRate, deleteRoomRate, updateRoomRate } from "../../../api/rates";
import { listCategoryRates, createCategoryRate, deleteCategoryRate, updateCategoryRate } from "../../../api/rates";
import type { RoomRate, RoomCategoryRate } from "../../../types/rate";
import { formatMoney, formatMoneyNullable } from "../../../utils/money";
import { RateModal, CategoryRateModal } from "../../../components/rates";

export default function RoomTariffsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [categories, setCategories] = useState<RoomCategory[]>([]);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [roomRates, setRoomRates] = useState<RoomRate[]>([]);
  const [categoryRates, setCategoryRates] = useState<RoomCategoryRate[]>([]);
  const [categoryRatesMap, setCategoryRatesMap] = useState<Record<string, RoomCategoryRate[]>>({});

  const [openRoomRate, setOpenRoomRate] = useState(false);
  const [openCategoryRate, setOpenCategoryRate] = useState(false);
  const [editingRoomRate, setEditingRoomRate] = useState<{ id: string; initial: RoomRate } | null>(null);
  const [editingCategoryRate, setEditingCategoryRate] = useState<{ id: string; categoryId: string; initial: RoomCategoryRate } | null>(null);

  useEffect(() => {
    (async () => {
      const [rs, cs] = await Promise.all([listRooms(), listRoomCategories()]);
      setRooms(rs);
      setCategories(cs);
      // Preload category rates for all categories
      const entries = await Promise.all(cs.map(async (c) => [c.id, await listCategoryRates(c.id)] as const));
      const map: Record<string, RoomCategoryRate[]> = {};
      for (const [id, rates] of entries) map[id] = rates;
      setCategoryRatesMap(map);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (!roomId) return;
      setRoomRates(await listRoomRates(roomId));
    })();
  }, [roomId]);

  useEffect(() => {
    (async () => {
      if (!categoryId) return;
      const rates = await listCategoryRates(categoryId);
      setCategoryRates(rates);
      setCategoryRatesMap((prev) => ({ ...prev, [categoryId]: rates }));
    })();
  }, [categoryId]);

  const selectedRoom = useMemo(() => rooms.find((r) => r.id === roomId) || null, [rooms, roomId]);
  const selectedCategory = useMemo(() => categories.find((c) => c.id === categoryId) || null, [categories, categoryId]);

  async function saveRoomRate(values: { people_count: number; price_per_day: number }) {
    if (!roomId) return;
    const rate = await createRoomRate(roomId, values);
    setRoomRates((prev) => [...prev.filter((r) => r.id !== rate.id), rate].sort((a, b) => a.people_count - b.people_count));
  }

  async function removeRoomRate(id: string) {
    await deleteRoomRate(id);
    setRoomRates((prev) => prev.filter((r) => r.id !== id));
  }

  async function saveEditedRoomRate(values: { people_count: number; price_per_day: number }) {
    if (!editingRoomRate) return;
    const updated = await updateRoomRate(editingRoomRate.id, values);
    setRoomRates((prev) => [...prev.filter((r) => r.id !== updated.id), updated].sort((a, b) => a.people_count - b.people_count));
    setEditingRoomRate(null);
  }

  async function saveCategoryRate(values: { base_one_adult?: number | null; base_two_adults?: number | null; additional_adult?: number | null; child_price?: number | null }) {
    if (!categoryId) return;
    const rate = await createCategoryRate(categoryId, values);
    setCategoryRates([rate]);
    setCategoryRatesMap((prev) => ({ ...prev, [categoryId]: [rate] }));
  }

  async function removeCategoryRate(id: string) {
    await deleteCategoryRate(id);
    setCategoryRates((prev) => prev.filter((r) => r.id !== id));
    if (categoryId) {
      setCategoryRatesMap((prev) => ({ ...prev, [categoryId]: (prev[categoryId] || []).filter((r) => r.id !== id) }));
    }
  }

  async function saveEditedCategoryRate(values: { base_one_adult?: number | null; base_two_adults?: number | null; additional_adult?: number | null; child_price?: number | null }) {
    if (!editingCategoryRate) return;
    const updated = await updateCategoryRate(editingCategoryRate.id, values);
    setCategoryRatesMap((prev) => {
      const list = (prev[editingCategoryRate.categoryId] || []).map((r) => (r.id === updated.id ? updated : r));
      return { ...prev, [editingCategoryRate.categoryId]: list };
    });
    if (categoryId === editingCategoryRate.categoryId) {
      setCategoryRates((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    }
    setEditingCategoryRate(null);
  }

  return (
    <div className="page">
      <div className="page-header">
        <h2>Tarifas de Quartos</h2>
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
          <button className="primary" onClick={() => setOpenCategoryRate(true)} disabled={!categoryId}>Adicionar</button>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Categoria</th>
              <th>Base 1 adulto</th>
              <th>Base 2 adultos</th>
              <th>Adicional adulto</th>
              <th>Preço criança</th>
              <th style={{ width: 160 }}></th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => {
              const rates = categoryRatesMap[c.id] || [];
              if (rates.length === 0) {
                return (
                  <tr key={c.id}>
                    <td>{c.name}</td>
                    <td colSpan={4} style={{ color: 'var(--color-muted)' }}>Sem tarifa cadastrada</td>
                    <td className="table-actions">
                      <button className="link" onClick={() => { setCategoryId(c.id); setOpenCategoryRate(true); }}>Adicionar</button>
                    </td>
                  </tr>
                );
              }
              return rates.map((r) => (
                <tr key={r.id}>
                  <td>{c.name}</td>
                  <td>{formatMoneyNullable(r.base_one_adult)}</td>
                  <td>{formatMoneyNullable(r.base_two_adults)}</td>
                  <td>{formatMoneyNullable(r.additional_adult)}</td>
                  <td>{formatMoneyNullable(r.child_price)}</td>
                  <td className="table-actions">
                    <button className="link" onClick={() => setEditingCategoryRate({ id: r.id, categoryId: c.id, initial: r })}>Editar</button>
                    <button className="link" onClick={() => removeCategoryRate(r.id)}>Excluir</button>
                  </td>
                </tr>
              ));
            })}
          </tbody>
        </table>
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
          <button className="primary" onClick={() => setOpenRoomRate(true)} disabled={!roomId}>Adicionar</button>
        </div>

        {selectedRoom && (
          <table className="table">
            <thead>
              <tr>
                <th>Pessoas</th>
                <th>Preço/dia</th>
                <th style={{ width: 160 }}></th>
              </tr>
            </thead>
            <tbody>
              {roomRates.map((r) => (
                <tr key={r.id}>
                  <td>{r.people_count}</td>
                  <td>{formatMoney(r.price_per_day)}</td>
                  <td className="table-actions">
                    <button className="link" onClick={() => setEditingRoomRate({ id: r.id, initial: r })}>Editar</button>
                    <button className="link" onClick={() => removeRoomRate(r.id)}>Excluir</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <RateModal open={openRoomRate} initial={{}} onClose={()=>setOpenRoomRate(false)} onSave={saveRoomRate} title="Tarifa Base do Quarto" />
      <RateModal open={!!editingRoomRate} initial={editingRoomRate?.initial || {}} onClose={()=>setEditingRoomRate(null)} onSave={saveEditedRoomRate} title="Editar Tarifa do Quarto" />
      <CategoryRateModal open={openCategoryRate} onClose={()=>setOpenCategoryRate(false)} onSave={saveCategoryRate} />
      <CategoryRateModal open={!!editingCategoryRate} initial={editingCategoryRate?.initial} onClose={()=>setEditingCategoryRate(null)} onSave={saveEditedCategoryRate} />
    </div>
  );
}
