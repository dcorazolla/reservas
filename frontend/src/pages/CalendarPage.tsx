import { useEffect, useState } from "react";
import { fetchCalendar } from "../api/calendar";
import type { Room, Reservation } from "../types/calendar";
import CalendarGrid from "../components/Calendar/CalendarGrid";
import ReservationModal from "../components/ReservationModal";
import { formatDate } from "../utils/dates";

function monthStart(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1).toISOString().slice(0, 10);
}

export default function CalendarPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  // startDate controls the calendar viewport; default to current month
  const [startDate, setStartDate] = useState<string>(monthStart(new Date()));
  const [days, setDays] = useState<number>(30);

  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const selectedRoom = selectedRoomId ? rooms.find((r) => r.id === selectedRoomId) : null;
  const selectedCapacity =
    selectedRoom?.capacity || (selectedReservation ? rooms.find((r) => r.id === selectedReservation.room_id)?.capacity : undefined);

  async function load(start = startDate, len = days) {
    setLoading(true);
    try {
      const end = new Date(start);
      end.setDate(end.getDate() + len - 1);
      const data = await fetchCalendar(start, end.toISOString().slice(0, 10));
      setRooms(data.rooms || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, days]);

  if (loading) return <p>Carregando calendário...</p>;

  return (
    <>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
        <button onClick={() => {
          const d = new Date(startDate);
          d.setMonth(d.getMonth() - 1);
          setStartDate(monthStart(d));
        }}>Anterior</button>
        <button onClick={() => {
          const d = new Date(startDate);
          d.setMonth(d.getMonth() + 1);
          setStartDate(monthStart(d));
        }}>Próximo</button>

        <label style={{ marginLeft: 8 }}>
          Mês:
          <input type="month" value={startDate.slice(0,7)} onChange={(e) => {
            const [y, m] = e.target.value.split('-');
            setStartDate(`${y}-${m.padStart(2,'0')}-01`);
          }} />
        </label>

        <label style={{ marginLeft: 12 }}>
          Dias:
          <input type="number" value={String(days)} min={7} max={90} onChange={(e)=>setDays(Number(e.target.value))} style={{ width: 80, marginLeft: 6 }} />
        </label>

        <div style={{ marginLeft: 'auto' }}><strong>Período:</strong> {formatDate(startDate)} → {formatDate(new Date(new Date(startDate).setDate(new Date(startDate).getDate() + days - 1)).toISOString().slice(0,10))}</div>
      </div>

      <CalendarGrid
        rooms={rooms}
        startDate={startDate}
        days={days}
        onEmptyCellClick={(roomId, date) => {
          setSelectedRoomId(roomId);
          setSelectedDate(date);
          setSelectedReservation(null);
        }}
        onReservationClick={(reservation) => {
          setSelectedReservation(reservation);
          setSelectedRoomId(null);
          setSelectedDate(null);
        }}
      />

      {(selectedRoomId || selectedReservation) && (
        <ReservationModal
          roomId={selectedRoomId}
          date={selectedDate}
          reservation={selectedReservation}
          roomCapacity={selectedCapacity}
          onClose={() => {
            setSelectedRoomId(null);
            setSelectedDate(null);
            setSelectedReservation(null);
          }}
          onSaved={() => {
            load();
          }}
        />
      )}
    </>
  );
}
