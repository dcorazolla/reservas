import React from "react";
import type { Room } from "../../types/calendar";
import { generateDateRange } from "../../utils/dates";
import "./calendar.css";

type Props = {
  rooms: Room[];
  onEmptyCellClick: (roomId: string, date: string) => void;
  onReservationClick: (reservation: any) => void;
};

const START_DATE = "2026-01-01";
const DAYS = 20;

export default function CalendarGrid({
  rooms,
  onEmptyCellClick,
  onReservationClick,
}: Props) {
  const dates = generateDateRange(START_DATE, DAYS);

  return (
    <div className="calendar-wrapper">
      <table className="calendar-table">
        <thead>
          {/* HEADER DOS DIAS */}
          <tr>
            <th className="room-col">Quarto</th>
            {dates.map((date) => (
              <th key={date} colSpan={2} className="day-header">
                {date.slice(8, 10)}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rooms.map((room) => {
            // total de colunas = dias * 2
            const totalHalfCols = dates.length * 2;

            // mapa de reservas por coluna inicial
            const reservationMap: Record<number, any> = {};

            room.reservations.forEach((r) => {
              const startDay = dates.indexOf(r.start_date);
              const endDay = dates.indexOf(r.end_date);

              if (startDay === -1) return;

              // entra na metade direita do dia inicial
              const startCol = startDay * 2 + 1;

              // sai na metade esquerda do dia final
              const endCol =
                endDay === -1 ? totalHalfCols - 1 : endDay * 2;

              const span = Math.max(endCol - startCol + 1, 1);

              reservationMap[startCol] = {
                ...r,
                span,
              };
            });

            const cells: React.ReactElement[] = [];

            for (let col = 0; col < totalHalfCols; col++) {
              // reserva começa aqui
              if (reservationMap[col]) {
                const r = reservationMap[col];

                cells.push(
                  <td
                    key={`res-${r.id}`}
                    colSpan={r.span}
                    className={`reservation-cell status-${r.status}`}
                    onClick={() => onReservationClick(r)}
                    title={`${r.guest_name}\n${r.start_date} → ${r.end_date}`}
                  >
                    #{r.id} {r.guest_name}
                  </td>
                );

                col += r.span - 1;
                continue;
              }

              // célula vazia
              const dayIndex = Math.floor(col / 2);
              const date = dates[dayIndex];

              cells.push(
                <td
                  key={`empty-${col}`}
                  className={`half-cell ${col % 2 === 0 ? "checkout" : "checkin"}`}
                  onClick={() => onEmptyCellClick(room.id, date)}
                />
              );
            }

            return (
              <tr key={room.id}>
                <td className="room-col">{room.name}</td>
                {cells}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
