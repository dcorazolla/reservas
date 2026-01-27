import { useEffect, useState } from "react";
import { fetchCalendar } from "../api/calendar";
import { Room, Reservation } from "../types/calendar";
import CalendarGrid from "../components/Calendar/CalendarGrid";
import ReservationModal from "../components/ReservationModal";

export default function CalendarPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

  useEffect(() => {
    fetchCalendar("2026-01-01", "2026-01-15")
      .then(data => setRooms(data.rooms))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Carregando calendário...</p>;

  return (
    <>
      <CalendarGrid
        rooms={rooms}
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
          onClose={() => {
            setSelectedRoomId(null);
            setSelectedDate(null);
            setSelectedReservation(null);
          }}
        />
      )}
    </>
  );
}
