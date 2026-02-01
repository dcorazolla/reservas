import { useEffect, useMemo, useState } from "react";
import { listRooms } from "../../api/rooms";
import type { Room } from "../../types/room";
import type { PropertyPricing, RoomRate, RoomRatePeriod } from "../../types/rate";
import { getPropertyPricing, updatePropertyPricing } from "../../api/pricing";
import {
  listRoomRates,
  createRoomRate,
  deleteRoomRate,
  listRoomRatePeriods,
  createRoomRatePeriod,
  deleteRoomRatePeriod,
} from "../../api/rates";

export default function RatesPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [pricing, setPricing] = useState<PropertyPricing>({
    base_one_adult: null,
    base_two_adults: null,
    additional_adult: null,
    child_price: null,
    infant_max_age: null,
    child_max_age: null,
    child_factor: null,
  });
  const [baseRates, setBaseRates] = useState<RoomRate[]>([]);
  const [periodRates, setPeriodRates] = useState<RoomRatePeriod[]>([]);

  useEffect(() => {
    (async () => {
      setRooms(await listRooms());
      try {
        setPricing(await getPropertyPricing());
      } catch {}
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (!roomId) return;
      setBaseRates(await listRoomRates(roomId));
      setPeriodRates(await listRoomRatePeriods(roomId));
    })();
  }, [roomId]);

  const selectedRoom = useMemo(() => rooms.find((r) => r.id === roomId) || null, [rooms, roomId]);

  async function onSavePricing() {
    const data = await updatePropertyPricing({
      base_two_adults: pricing.base_two_adults ?? null,
      additional_adult: pricing.additional_adult ?? null,
      base_one_adult: pricing.base_one_adult ?? null,
      child_price: pricing.child_price ?? null,
      infant_max_age: pricing.infant_max_age ?? null,
      child_max_age: pricing.child_max_age ?? null,
      child_factor: pricing.child_factor ?? null,
    });
    setPricing(data);
    alert("Tarifário padrão salvo");
  }

  async function addBaseRate() {
    if (!roomId || !selectedRoom) return;
    const peopleStr = prompt(`Pessoas (1 a ${selectedRoom.capacity})`);
    const priceStr = prompt("Preço por dia (ex: 250.00)");
    if (!peopleStr || !priceStr) return;
    const rate = await createRoomRate(roomId, {
      people_count: Number(peopleStr),
      price_per_day: Number(priceStr),
    });
    setBaseRates((prev) => [...prev.filter((r) => r.id !== rate.id), rate].sort((a, b) => a.people_count - b.people_count));
  }

  async function removeBaseRate(id: string) {
    await deleteRoomRate(id);
    setBaseRates((prev) => prev.filter((r) => r.id !== id));
  }

  async function addPeriodRate() {
    if (!roomId || !selectedRoom) return;
    const peopleStr = prompt(`Pessoas (1 a ${selectedRoom.capacity})`);
    const start = prompt("Início (YYYY-MM-DD)");
    const end = prompt("Fim (YYYY-MM-DD)");
    const priceStr = prompt("Preço por dia (ex: 300.00)");
    if (!peopleStr || !start || !end || !priceStr) return;
    const rate = await createRoomRatePeriod(roomId, {
      people_count: Number(peopleStr),
      start_date: start,
      end_date: end,
      price_per_day: Number(priceStr),
    });
    setPeriodRates((prev) => [rate, ...prev]);
  }

  async function removePeriodRate(id: string) {
    await deleteRoomRatePeriod(id);
    setPeriodRates((prev) => prev.filter((r) => r.id !== id));
  }

  return (
    <div className="page">
      <div className="page-header">
        <h2>Tarifário</h2>
      </div>

      <section className="card" style={{ marginBottom: 16 }}>
        <h3>Tarifário Padrão da Propriedade</h3>
        <div className="form-row">
          <label>
            <div>Base (1 adulto)</div>
            <input
              type="number"
              step="0.01"
              value={pricing.base_one_adult ?? ''}
              onChange={(e) => setPricing({ ...pricing, base_one_adult: Number(e.target.value) })}
            />
          </label>
          <label>
            <div>Base (2 adultos)</div>
            <input
              type="number"
              step="0.01"
              value={pricing.base_two_adults ?? ''}
              onChange={(e) => setPricing({ ...pricing, base_two_adults: Number(e.target.value) })}
            />
          </label>
          <label>
            <div>Adicional por adulto</div>
            <input
              type="number"
              step="0.01"
              value={pricing.additional_adult ?? ''}
              onChange={(e) => setPricing({ ...pricing, additional_adult: Number(e.target.value) })}
            />
          </label>
          <button className="primary" onClick={onSavePricing}>Salvar</button>
        </div>
      </section>

      <section className="card">
        <h3>Tarifas por Quarto</h3>
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
        </div>

        {selectedRoom && (
          <div style={{ display: 'grid', gap: 16, marginTop: 12 }}>
            <div>
              <div className="section-header">
                <h4>Tarifas Base (por pessoas)</h4>
                <button className="primary" onClick={addBaseRate}>Adicionar</button>
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
                  {baseRates.map((r) => (
                    <tr key={r.id}>
                      <td>{r.people_count}</td>
                      <td>{r.price_per_day.toFixed(2)}</td>
                      <td className="table-actions">
                        <button className="link" onClick={() => removeBaseRate(r.id)}>Excluir</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div>
              <div className="section-header">
                <h4>Tarifas por Período</h4>
                <button className="primary" onClick={addPeriodRate}>Adicionar</button>
              </div>
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
                  {periodRates.map((p) => (
                    <tr key={p.id}>
                      <td>{p.start_date}</td>
                      <td>{p.end_date}</td>
                      <td>{p.people_count}</td>
                      <td>{p.price_per_day.toFixed(2)}</td>
                      <td className="table-actions">
                        <button className="link" onClick={() => removePeriodRate(p.id)}>Excluir</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
