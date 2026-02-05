import { useEffect, useState } from "react";
import type { Reservation, ReservationStatus } from "../types/calendar";
import type { Partner } from "../types/partner";
import { createReservation, updateReservation, calculateReservationPriceDetailed } from "../api/reservations";
import { listPartners } from "../api/partners";
import Modal from "./Modal/Modal";
import { formatMoney } from "../utils/money";


type Props = {
  roomId: string | null;
  date: string | null;
  reservation: Reservation | null;
  onClose: () => void;
  onSaved?: () => void;
  roomCapacity?: number;
};

export default function ReservationModal({
  roomId,
  date,
  reservation,
  onClose,
  onSaved,
  roomCapacity,
}: Props) {
  const [guestName, setGuestName] = useState("");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [startDate, setStartDate] = useState(date ?? "");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState<ReservationStatus>("pre-reserva");
  const [notes, setNotes] = useState("");
  const [partners, setPartners] = useState<Partner[]>([]);
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [calcTotal, setCalcTotal] = useState<number>(0);
  const [days, setDays] = useState<Array<{ date: string; price: number }>>([]);
  const [error, setError] = useState("");
  const [fieldError, setFieldError] = useState("");

  const editing = !!reservation;

  useEffect(() => {
  if (reservation) {
    setGuestName(reservation.guest_name);
    setAdults(reservation.adults_count || reservation.people_count || 1);
    setChildren(reservation.children_count || 0);
    setInfants(reservation.infants_count || 0);
    setStartDate(reservation.start_date);
    setEndDate(reservation.end_date);
    setStatus(reservation.status);
    setNotes(reservation.notes ?? "");
    setPartnerId(reservation.partner_id ?? null);
  }
}, [reservation]);

  useEffect(() => {
    // default end date to next day when creating
    if (!editing && startDate && !endDate) {
      const d = new Date(startDate);
      const next = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)
        .toISOString()
        .slice(0, 10);
      setEndDate(next);
    }
  }, [editing, startDate, endDate]);

  useEffect(() => {
    // client-side validations: capacity and dates
    const totalPeople = adults + children; // infants don't count for capacity
    if (roomCapacity && totalPeople > roomCapacity) {
      setFieldError(`Número de pessoas excede a capacidade (${roomCapacity}).`);
      return;
    }
    if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
      setFieldError('Saída deve ser maior que a entrada.');
      return;
    }
    setFieldError("");
  }, [adults, children, roomCapacity, startDate, endDate]);

  useEffect(() => {
    async function recalc() {
      try {
        if (!roomId && !reservation) return;
        const rid = reservation ? reservation.room_id : (roomId as string);
        if (!rid || !startDate || !endDate || !adults) return;
        if (fieldError) return; // skip calc when validation fails
        const calc: any = await calculateReservationPriceDetailed({
          room_id: rid,
          start_date: startDate,
          end_date: endDate,
          adults_count: adults,
          children_count: children,
          infants_count: infants,
        });
        setCalcTotal(calc.total || 0);
        // expose days breakdown in state for rendering
        setDays(calc.days || []);
        setError("");
      } catch (e: any) {
        console.error('Falha ao calcular preço:', e);
        setCalcTotal(0);
        setDays([]);
        setError(e?.message || 'Falha ao calcular preço');
      }
    }
    recalc();
  }, [roomId, reservation, startDate, endDate, adults, children, infants, fieldError]);

  useEffect(() => {
    async function loadPartners() {
      try {
        const p: any = await listPartners();
        setPartners(p || []);
      } catch (e) {
        console.warn('Não foi possível carregar parceiros', e);
      }
    }
    loadPartners();
  }, []);


  return (
    <Modal open={true} title={reservation ? "Editar Reserva" : "Nova Reserva"} onClose={onClose}>
      <div className="form">
        {(error || fieldError) && (
          <div className="form-error">{error}</div>
        )}

        <div className="form-group">
          <label>Hóspede</label>
          <input value={guestName} onChange={e => setGuestName(e.target.value)} />
        </div>

        <div className="form-group">
          <label>Adultos</label>
          <input type="number" min={1} value={adults} onChange={e => setAdults(+e.target.value)} />
        </div>
        <div className="form-group">
          <label>Crianças</label>
          <input type="number" min={0} value={children} onChange={e => setChildren(+e.target.value)} />
        </div>
        <div className="form-group">
          <label>Bebês</label>
          <input type="number" min={0} value={infants} onChange={e => setInfants(+e.target.value)} />
        </div>

        <div className="form-group">
          <label>Entrada</label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
        </div>

        <div className="form-group">
          <label>Saída</label>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
        </div>

        {editing && (
          <div className="form-group">
            <label>Status</label>
            <select value={status} onChange={e => setStatus(e.target.value as ReservationStatus)}>
              <option value="pre-reserva">Pré-reserva</option>
              <option value="reservado">Reservado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
        )}

        <div className="form-group">
          <label>Resumo</label>
          <div style={{ display: 'grid', gap: 8 }}>
            <div style={{ fontWeight: 600 }}>Total: {formatMoney(calcTotal)}</div>
            {days.length > 0 && (
              <div>
                {days.map((d: any) => (
                  <div key={d.date}>{d.date}: {formatMoney(d.price)}</div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="form-group">
          <label>Observações</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} />
        </div>

        <div className="form-group">
          <label>Parceiro</label>
          <select value={partnerId ?? ""} onChange={e => setPartnerId(e.target.value || null)}>
            <option value="">(Nenhum)</option>
            {partners.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div className="form-actions">
          <button className="secondary" onClick={onClose}>Cancelar</button>
          <button className="primary" disabled={!!fieldError} onClick={async () => {
            try {
              if (reservation) {
                await updateReservation(reservation.id, {
                    partner_id: partnerId,
                  guest_name: guestName,
                  adults_count: adults,
                  children_count: children,
                  infants_count: infants,
                  start_date: startDate,
                  end_date: endDate,
                  status,
                  notes,
                });
              } else {
                await createReservation({
                  room_id: roomId,
                    partner_id: partnerId,
                  guest_name: guestName,
                  adults_count: adults,
                  children_count: children,
                  infants_count: infants,
                  start_date: startDate,
                  end_date: endDate,
                  notes,
                });
              }
              if (onSaved) onSaved();
              onClose();
            } catch (e: any) {
              console.error('Erro ao salvar reserva:', e);
              setError(e?.error || e?.message || "Erro ao salvar reserva");
            }
          }}>Salvar</button>
        </div>
      </div>
      
    </Modal>
  );
}

