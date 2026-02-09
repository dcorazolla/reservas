import { useEffect, useState } from "react";
import { fetchCalendar } from "../api/calendar";
import { fetchRoomBlocks } from "../api/roomBlocks";
import type { Room, Reservation } from "../types/calendar";
import CalendarGrid from "../components/Calendar/CalendarGrid";
import ReservationModal from "../components/ReservationModal";
import RoomBlockModal from "../components/RoomBlockModal";
import { formatDate } from "../utils/dates";

function monthStart(date: Date) {
  // Use local year/month to avoid ISO parsing timezone shifts
  return new Date(date.getFullYear(), date.getMonth(), 1).toISOString().slice(0, 10);
}

function addMonthsToIsoDate(isoDate: string, deltaMonths: number) {
  // isoDate expected format: YYYY-MM-DD
  const parts = isoDate.split('-');
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // zero-based

  const d = new Date(year, month + deltaMonths, 1);
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}

function addDaysToIsoDate(isoDate: string, deltaDays: number) {
  // isoDate expected format: YYYY-MM-DD
  const d = new Date(isoDate.length > 10 ? isoDate : `${isoDate}T00:00:00`);
  d.setDate(d.getDate() + deltaDays);
  return d.toISOString().slice(0, 10);
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
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<any | null>(null);
  const selectedRoom = selectedRoomId ? rooms.find((r) => r.id === selectedRoomId) : null;
  const selectedCapacity =
    selectedRoom?.capacity || (selectedReservation ? rooms.find((r) => r.id === selectedReservation.room_id)?.capacity : undefined);

  async function load(start = startDate, len = days) {
    setLoading(true);
    try {
      const end = new Date(start);
      end.setDate(end.getDate() + len - 1);
      const data = await fetchCalendar(start, end.toISOString().slice(0, 10));
      const blocks = await fetchRoomBlocks(start, end.toISOString().slice(0, 10));

      // merge blocks into rooms
      const roomsWithBlocks = (data.rooms || []).map((r: any) => ({
        ...r,
        room_blocks: (blocks || []).filter((b) => b.room_id === r.id),
      }));
      setRooms(roomsWithBlocks);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, days]);

  return (
    <div className="page">
      <div className="calendar-area">
        <div className="calendar-scroll-wrapper">
          <div className="page-header">
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button type="button" className="secondary" onClick={() => {
                // Move back by number of days window
                setStartDate(addDaysToIsoDate(startDate, -days));
              }}>Anterior</button>
              <button type="button" className="secondary" onClick={() => {
                // Move forward by the visible window length
                setStartDate(addDaysToIsoDate(startDate, +days));
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
            </div>

            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div><strong>Período:</strong> {formatDate(startDate)} → {formatDate(new Date(new Date(startDate).setDate(new Date(startDate).getDate() + days - 1)).toISOString().slice(0,10))}</div>
              <button type="button" className="primary" onClick={() => { setSelectedBlock(null); setShowBlockModal(true); }}>Criar bloqueio de quarto</button>
            </div>
          </div>

          {loading ? <p>Carregando calendário...</p> : null}

          <CalendarGrid
            rooms={rooms}
            startDate={startDate}
            days={days}
            onEmptyCellClick={(roomId, date) => {
              // do not allow creating reservations in blocked cells; the grid will not produce empty cells for blocked ranges
              setSelectedRoomId(roomId);
              setSelectedDate(date);
              setSelectedReservation(null);
            }}
            onReservationClick={(reservation) => {
              setSelectedReservation(reservation);
              setSelectedRoomId(null);
              setSelectedDate(null);
            }}
            onBlockClick={(b) => {
              setSelectedBlock(b);
              setShowBlockModal(true);
            }}
          />
        </div>
      </div>

      {showBlockModal && (
        <RoomBlockModal
          open={showBlockModal}
          block={selectedBlock}
          onClose={() => { setSelectedBlock(null); setShowBlockModal(false); }}
          onSaved={() => { setSelectedBlock(null); setShowBlockModal(false); load(); }}
        />
      )}

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
    </div>
  );
}
