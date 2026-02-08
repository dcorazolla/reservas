import { useState, useEffect } from "react";
import { createReservation, updateReservation, calculateReservationPriceDetailed } from "../api/reservations";
import { createInvoice } from "../api/invoices";
import type { Reservation } from "../types/calendar";
import { isFeatureEnabled } from "../utils/featureFlags";

type Props = {
  roomId?: string;
  reservation?: Reservation | null;
  initialDate?: string | null;
  onSaved?: () => void;
};

export default function ReservationForm({ roomId, reservation, initialDate, onSaved }: Props) {
  const [guestName, setGuestName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [adults, setAdults] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (reservation) {
      setGuestName(reservation.guest_name || "");
      setStartDate(reservation.start_date || "");
      setEndDate(reservation.end_date || "");
      setAdults(reservation.adults_count || reservation.people_count || 1);
    }
  }, [reservation]);

  useEffect(() => {
    // when creating: if initialDate provided, set startDate and default endDate to next day
    if (!reservation && initialDate) {
      setStartDate(initialDate);
      if (!endDate) {
        const d = new Date(initialDate);
        const next = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)
          .toISOString()
          .slice(0, 10);
        setEndDate(next);
      }
    }
  }, [initialDate, reservation]);

  useEffect(() => {
    // when creating and initialDate is provided, default the start date
    if (!reservation && (typeof (arguments as any) !== 'undefined')) {
      // no-op placeholder to satisfy TypeScript; real initialDate handled via props below
    }
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!guestName) return setError("Nome do hóspede é obrigatório");
    if (!startDate || !endDate) return setError("Datas são obrigatórias");
    setLoading(true);
    try {
      if (reservation) {
        await updateReservation(reservation.id, {
          guest_name: guestName,
          start_date: startDate,
          end_date: endDate,
          adults_count: adults,
        });
      } else {
        if (!roomId) throw new Error('roomId é obrigatório para criação');
        await createReservation({
          room_id: roomId,
          guest_name: guestName,
          start_date: startDate,
          end_date: endDate,
          adults_count: adults,
        });
      }
      if (onSaved) onSaved();
    } catch (err: any) {
      setError(err?.message || "Erro ao salvar reserva");
    } finally {
      setLoading(false);
    }
  }

  async function generateInvoice() {
    if (!reservation) return setError('Reserva necessária para gerar fatura');
    setError('');
    setLoading(true);
    try {
      let total = reservation.total_value;
      if (!total) {
        const calc: any = await calculateReservationPriceDetailed({
          room_id: reservation.room_id,
          start_date: reservation.start_date,
          end_date: reservation.end_date,
          adults_count: reservation.adults_count || reservation.people_count || 1,
          children_count: reservation.children_count || 0,
          infants_count: reservation.infants_count || 0,
        });
        total = calc.total || 0;
      }
      const lines = [{ description: `Reserva ${reservation.id}`, quantity: 1, unit_price: total }];
      const payload: any = { reservation_id: reservation.id, lines };
      const inv: any = await createInvoice(payload);
      // try to show user the invoice id/number
      const link = inv?.id ? `/invoices/${inv.id}` : (inv?.number ? `/invoices/${inv.number}` : null);
      if (link) window.location.href = link;
      else setError('Fatura criada, mas não foi possível navegar para a fatura.');
    } catch (err: any) {
      setError(err?.message || 'Erro ao gerar fatura');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} aria-label="reservation-form">
      {error && <div role="alert">{error}</div>}
      <div>
        <label htmlFor="guestName">Hóspede</label>
        <input id="guestName" value={guestName} onChange={(e) => setGuestName(e.target.value)} />
      </div>
      <div>
        <label htmlFor="startDate">Entrada</label>
        <input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
      </div>
      <div>
        <label htmlFor="endDate">Saída</label>
        <input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
      </div>
      <div>
        <label htmlFor="adults">Adultos</label>
        <input id="adults" type="number" min={1} value={adults} onChange={(e) => setAdults(Number(e.target.value))} />
      </div>
      <div>
        <button type="submit" disabled={loading}>{loading ? 'Salvando...' : 'Salvar'}</button>
        {isFeatureEnabled('invoices.create_from_reservation') && reservation && (
          <button type="button" onClick={generateInvoice} disabled={loading} style={{ marginLeft: 8 }}>
            Gerar fatura
          </button>
        )}
      </div>
    </form>
  );
}
