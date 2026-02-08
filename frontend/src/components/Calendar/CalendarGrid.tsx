import React from "react";
import type { Room } from "../../types/calendar";
import { generateDateRange } from "../../utils/dates";
import "./calendar.css";
export default function CalendarGrid({
  rooms,
  startDate,
  days,
  onEmptyCellClick,
  onReservationClick,
}: Props) {
  const dates = generateDateRange(startDate, days);

  return (
    <div className="calendar-wrapper">
      <table className="calendar-table">
        <thead>
          {/* HEADER DOS DIAS */}
          <tr>
            <th className="room-col">Quarto</th>
            {dates.map((date) => {
              const day = date.slice(8, 10);
              const monthShort = new Date(date + "T00:00:00").toLocaleString("pt-BR", {
                month: "short",
              });
              const monthLabel =
                monthShort.charAt(0).toUpperCase() + monthShort.slice(1);

              return (
                <th key={date} colSpan={2} className="day-header">
                  <div className="day-header-inner">
                    <span className="month-label">{monthLabel}</span>
                    <span className="day-label">{day}</span>
                  </div>
                </th>
              );
            })}
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
                    className={`reservation-cell status-${r.status} ${r.partner_id || (r.partner && r.partner.id) ? 'has-partner' : ''}`}
                    onClick={() => onReservationClick(r)}
                    title={`${r.guest_name}\n${r.start_date} → ${r.end_date}`}
                  >
                    { (r.partner && r.partner.name) || r.partner_name ? (
                      <span className="partner-badge" title={(r.partner && r.partner.name) || r.partner_name}>🤝</span>
                    ) : null}
                    {r.guest_name}
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
