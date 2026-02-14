import { useEffect, useState, useRef } from "react";
import type { Reservation, ReservationStatus } from "../types/calendar";
import type { Partner } from "../types/partner";
import { createReservation, updateReservation, calculateReservationPriceDetailed } from "../api/reservations";
import { listPartners } from "../api/partners";
import { listRooms } from "../api/rooms";
import Modal from "./Modal/Modal";
import "./ReservationModal.css";
import { formatMoney } from "../utils/money";
import { formatDate } from "../utils/dates";
import Skeleton from "./Skeleton/Skeleton";


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
  const [rooms, setRooms] = useState<Array<any>>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(roomId ?? null);
  const [startDate, setStartDate] = useState(date ?? "");
  const [endDate, setEndDate] = useState(() => {
    // If editing, we'll load from reservation in effect below.
    if (reservation && reservation.end_date) return reservation.end_date;
    // When opened from calendar (date provided) default end date to start + 1 day
    if (!reservation && date) {
      const d = new Date(date.length > 10 ? date : `${date}T00:00:00`);
      d.setDate(d.getDate() + 1);
      return d.toISOString().slice(0, 10);
    }
    return "";
  });
  const [status, setStatus] = useState<ReservationStatus>("pre-reserva");
  const [notes, setNotes] = useState("");
  const [partners, setPartners] = useState<Partner[]>([]);
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [calcTotal, setCalcTotal] = useState<number>(0);
  const [days, setDays] = useState<Array<{ date: string; price: number }>>([]);
  const [priceOverride, setPriceOverride] = useState<string | null>(null);
  const [showManualInput, setShowManualInput] = useState<boolean>(false);
  const [error, setError] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [calcLoading, setCalcLoading] = useState<boolean>(false);

  const editing = !!reservation;

  const firstFieldRef = useRef<HTMLInputElement | null>(null);
  const previousActive = useRef<HTMLElement | null>(null);
  // Use a simple window navigation instead of useNavigate to keep tests
  // working outside of a Router context.

  useEffect(() => {
    if (reservation) {
      setSelectedRoomId(reservation.room_id ?? selectedRoomId);
      setGuestName(reservation.guest_name);
      setAdults(reservation.adults_count || reservation.people_count || 1);
      setChildren(reservation.children_count || 0);
      setInfants(reservation.infants_count || 0);
      setStartDate(reservation.start_date);
      setEndDate(reservation.end_date);
      setStatus(reservation.status);
      setNotes(reservation.notes ?? "");
      setPartnerId(reservation.partner_id ?? null);
      // Prefer explicit price_override (new column). Only show manual input
      // when an explicit override exists. Do NOT treat total_value as an
      // implicit manual override to avoid exposing the field for legacy data.
      if (reservation.price_override != null) {
        setPriceOverride(String(reservation.price_override));
        setShowManualInput(true);
      } else {
        setPriceOverride(null);
        setShowManualInput(false);
      }
    }
  }, [reservation]);

  // helper to (re)compute calcTotal/days from server
  async function computeCalcFromServer() {
    try {
      setCalcLoading(true);
      const rid = reservation ? reservation.room_id : (roomId as string);
      if (!rid || !startDate || !endDate || !adults) return;
      const calc: any = await calculateReservationPriceDetailed({
        room_id: rid,
        start_date: startDate,
        end_date: endDate,
        adults_count: adults,
        children_count: children,
        infants_count: infants,
      });
      setCalcTotal(calc.total || 0);
      setDays(calc.days || []);
      setError("");
    } catch (e: any) {
      console.error('Falha ao calcular preço:', e);
      setCalcTotal(0);
      setDays([]);
      setError(e?.message || 'Falha ao calcular preço');
    } finally {
      setCalcLoading(false);
    }
  }

  // Accessibility: manage focus when modal opens and handle ESC to close
  useEffect(() => {
    previousActive.current = document.activeElement as HTMLElement | null;
    // focus first input when modal mounts
    const timer = setTimeout(() => {
      firstFieldRef.current?.focus();
    }, 0);

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("keydown", onKey);
      if (previousActive.current) previousActive.current.focus();
      clearTimeout(timer);
    };
  }, [onClose]);

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
          setCalcLoading(false);
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
    async function loadPartnersAndRooms() {
      try {
        setInitialLoading(true);
        const p: any = await listPartners();
        setPartners(p || []);
      } catch (e) {
        console.warn('Não foi possível carregar parceiros', e);
      }
      try {
        const r: any = await listRooms();
        setRooms(r || []);
        // If modal opened with a roomId prop (from calendar grid), preselect it
        if (roomId && r && r.length) {
          setSelectedRoomId(roomId as string);
        }
      } catch (e) {
        console.warn('Não foi possível carregar quartos', e);
      } finally {
        setInitialLoading(false);
      }
    }
    loadPartnersAndRooms();
  }, []);


  return (
    <Modal open={true} title={reservation ? "Editar Reserva" : "Nova Reserva"} titleId="reservation-title" onClose={onClose} closeOnBackdrop={false}>
      <div className="form reservation-modal" aria-busy={initialLoading || calcLoading}>
        {(error || fieldError) && (
          <div className="form-error" aria-live="assertive">{error}</div>
        )}

        <div className="form-group">
          <label htmlFor="guestName">Hóspede</label>
          {initialLoading ? (
            <Skeleton variant="text" style={{ width: '100%', height: 32 }} />
          ) : (
            <input id="guestName" ref={firstFieldRef} value={guestName} onChange={e => setGuestName(e.target.value)} />
          )}
        </div>

        <div className="form-row three-cols">
          <div className="form-group">
            <label htmlFor="adults">Adultos</label>
            {initialLoading ? <Skeleton variant="text" style={{ width: 120, height: 32 }} /> : <input id="adults" type="number" min={1} value={adults} onChange={e => setAdults(+e.target.value)} />}
          </div>
          <div className="form-group">
            <label htmlFor="children">Crianças</label>
            {initialLoading ? <Skeleton variant="text" style={{ width: 120, height: 32 }} /> : <input id="children" type="number" min={0} value={children} onChange={e => setChildren(+e.target.value)} />}
          </div>
          <div className="form-group">
            <label htmlFor="infants">Bebês</label>
            {initialLoading ? <Skeleton variant="text" style={{ width: 120, height: 32 }} /> : <input id="infants" type="number" min={0} value={infants} onChange={e => setInfants(+e.target.value)} />}
          </div>
        </div>

        <div className="form-row two-cols">
          <div className="form-group">
            <label htmlFor="startDate">Entrada</label>
            {initialLoading ? <Skeleton variant="text" style={{ width: 180, height: 32 }} /> : <input id="startDate" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />}
          </div>
          <div className="form-group">
            <label htmlFor="endDate">Saída</label>
            {initialLoading ? <Skeleton variant="text" style={{ width: 180, height: 32 }} /> : <input id="endDate" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />}
          </div>
        </div>

        <div className="form-row two-cols">
          <div className="form-group">
            <label htmlFor="room">Quarto</label>
            {initialLoading ? (
              <Skeleton variant="text" style={{ width: '100%', height: 36 }} />
            ) : (
              <select id="room" value={selectedRoomId ?? ''} onChange={e => setSelectedRoomId(e.target.value || null)}>
                <option value="">(Selecione um quarto)</option>
                {rooms.map(r => (
                  <option key={r.id} value={r.id}>{r.name || r.number || r.id}</option>
                ))}
              </select>
            )}
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
        </div>

        <div className="form-group">
          <label>Resumo</label>
          <div className="summary">
            {calcLoading ? (
              <div>
                <Skeleton variant="text" style={{ width: 140, height: 20 }} />
                <div style={{ marginTop: 8 }}>
                  <Skeleton variant="rect" style={{ width: '100%', height: 48 }} />
                </div>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="summary-total">Total: {formatMoney(calcTotal)}</div>
                      {!priceOverride && !showManualInput && (
                        <button type="button" className="secondary" onClick={() => setShowManualInput(true)} style={{ padding: '4px 8px' }}>Editar</button>
                      )}
                    </div>

                  <div style={{ minWidth: 140, textAlign: 'right' }}>
                    {(showManualInput || (priceOverride !== null && priceOverride !== "")) ? (
                      initialLoading ? (
                        <Skeleton variant="text" style={{ width: '100%', height: 32 }} />
                      ) : (
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', alignItems: 'center' }}>
                          <input id="priceOverride" type="number" step="0.01" value={priceOverride ?? ""} onChange={e => {
                            const v = e.target.value || null;
                            setPriceOverride(v);
                            if (v) {
                              const n = parseFloat(v as string);
                              if (!Number.isNaN(n)) setCalcTotal(n);
                            } else {
                              // removed manual override — recompute from server
                              computeCalcFromServer();
                            }
                          }} placeholder={priceOverride ? String(priceOverride) : String(calcTotal)} style={{ width: 120 }} />
                          {priceOverride ? (
                            <button type="button" className="secondary" onClick={() => {
                              // clear manual price
                              setPriceOverride(null);
                              setShowManualInput(false);
                              computeCalcFromServer();
                            }}>Apagar</button>
                          ) : (
                            <button type="button" className="secondary" onClick={() => { setPriceOverride(null); setShowManualInput(false); }}>Fechar</button>
                          )}
                        </div>
                      )
                    ) : (
                      <div style={{ color: '#666' }}>(Preço manual não definido)</div>
                    )}
                  </div>
                </div>

                {days.length > 0 && (
                  <div style={{ marginTop: 8, color: '#555', fontSize: 15 }}>
                    {days.map((d: any) => `${formatDate(d.date)}: ${formatMoney(d.price)}`).join(' | ')}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="notes">Observações</label>
          <textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} />
        </div>

        <div className="form-group">
          <label htmlFor="partner">Parceiro</label>
          {initialLoading ? (
            <Skeleton variant="text" style={{ width: '100%', height: 36 }} />
          ) : (
            <select id="partner" value={partnerId ?? ""} onChange={e => setPartnerId(e.target.value || null)}>
              <option value="">(Nenhum)</option>
              {partners.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          )}
        </div>

        <div className="form-actions">
          {initialLoading ? (
            <>
              <Skeleton variant="text" style={{ width: 100, height: 36 }} />
              <Skeleton variant="text" style={{ width: 120, height: 36, marginLeft: 8 }} />
            </>
          ) : (
            <>
              <button type="button" className="secondary" onClick={onClose}>Cancelar</button>
              {editing && (
                <button
                  type="button"
                  className="secondary"
                  onClick={() => { window.location.href = `/minibar?reservation_id=${reservation?.id}`; }}
                >
                  Frigobar
                </button>
              )}
            </>
          )}
            <button type="button" className="primary" disabled={!!fieldError || initialLoading || calcLoading} onClick={async () => {
            try {
              const payloadRoomId = selectedRoomId ?? roomId ?? reservation?.room_id ?? null;
              if (!payloadRoomId) throw new Error('Escolha um quarto antes de salvar.');

              if (reservation) {
                await updateReservation(reservation.id, {
                    price_override: priceOverride ? parseFloat(priceOverride) : null,
                    partner_id: partnerId,
                  guest_name: guestName,
                  adults_count: adults,
                  children_count: children,
                  infants_count: infants,
                  start_date: startDate,
                  end_date: endDate,
                  status,
                  notes,
                  room_id: payloadRoomId,
                });
              } else {
                await createReservation({
                  price_override: priceOverride ? parseFloat(priceOverride) : null,
                  room_id: payloadRoomId,
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

