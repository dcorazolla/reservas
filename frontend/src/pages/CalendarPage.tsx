import { useEffect, useState } from "react";
import { fetchCalendar } from "../api/calendar";
import type { Room, Reservation } from "../types/calendar";
import CalendarGrid from "../components/Calendar/CalendarGrid";
import ReservationModal from "../components/ReservationModal";

export default function CalendarPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const selectedRoom = selectedRoomId ? rooms.find(r => r.id === selectedRoomId) : null;
  const selectedCapacity = selectedRoom?.capacity || (selectedReservation ? rooms.find(r => r.id === selectedReservation.room_id)?.capacity : undefined);

  async function load() {
    const data = await fetchCalendar("2026-01-01", "2026-01-15");
    setRooms(data.rooms);
  }

  useEffect(() => {
    load().finally(() => setLoading(false));
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
