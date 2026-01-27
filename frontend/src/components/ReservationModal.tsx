import { useEffect, useState } from "react";
import { Reservation, ReservationStatus } from "../types/calendar";
import { createReservation, updateReservation } from "../api/reservations";


type Props = {
  roomId: number | null;
  date: string | null;
  reservation: Reservation | null;
  onClose: () => void;
};

export default function ReservationModal({
  roomId,
  date,
  reservation,
  onClose,
}: Props) {
  const [guestName, setGuestName] = useState("");
  const [peopleCount, setPeopleCount] = useState(1);
  const [startDate, setStartDate] = useState(date ?? "");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState<ReservationStatus>("pre-reserva");
  const [totalValue, setTotalValue] = useState<number | "">("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
  if (reservation) {
    setGuestName(reservation.guest_name);
    setPeopleCount(reservation.people_count);
    setStartDate(reservation.start_date);
    setEndDate(reservation.end_date);
    setStatus(reservation.status);
    setTotalValue(reservation.total_value ?? "");
    setNotes(reservation.notes ?? "");
  }
}, [reservation]);


  return (
    <div style={overlay}>
      <div style={modal}>
        <h3>{reservation ? "Editar Reserva" : "Nova Reserva"}</h3>

        <label>
          Hóspede
          <input value={guestName} onChange={e => setGuestName(e.target.value)} />
        </label>

        <label>
        Pessoas
        <input
            type="number"
            min={1}
            value={peopleCount}
            onChange={e => setPeopleCount(+e.target.value)}
        />
        </label>

        <label>
          Entrada
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
          />
        </label>

        <label>
          Saída
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
          />
        </label>

        <label>
          Status
          <select
            value={status}
            onChange={e => setStatus(e.target.value as ReservationStatus)}
          >
            <option value="pre-reserva">Pré-reserva</option>
            <option value="reservado">Reservado</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </label>

        <label>
          Valor total
          <input
            type="number"
            value={totalValue}
            onChange={e => setTotalValue(+e.target.value)}
          />
        </label>

        <label>
        Observações
        <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
        />
        </label>

        <div style={{ marginTop: 16 }}>
          <button onClick={onClose}>Cancelar</button>
          <button
  onClick={async () => {
    try {
      if (reservation) {
        await updateReservation(reservation.id, {
        guest_name: guestName,
        people_count: peopleCount,
        start_date: startDate,
        end_date: endDate,
        status,
        total_value: totalValue,
        notes,
        });
      } else {
        await createReservation({
            room_id: roomId,
            guest_name: guestName,
            people_count: peopleCount,
            start_date: startDate,
            end_date: endDate,
            status,
            total_value: totalValue,
            notes,
            });
      }

      onClose();
      window.location.reload(); // temporário
    } catch (e: any) {
      console.log(e.error)
      alert(e.error ?? "Erro ao salvar reserva");
    }
  }}
>
  Salvar
</button>

        </div>
      </div>
    </div>
  );
}

const overlay: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const modal: React.CSSProperties = {
  background: "#fff",
  padding: 20,
  width: 420,
  display: "flex",
  flexDirection: "column",
  gap: 8,
  zIndex: 1001,
};

