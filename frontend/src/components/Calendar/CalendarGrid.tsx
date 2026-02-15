import React from "react";
import type { Room } from "../../types/calendar";
import Popover from "../../components/Popover";
import { generateDateRange, formatDate } from "../../utils/dates";
type RoomBlock = { id: string; room_id: string; start_date: string; end_date: string; reason?: string };
import "./calendar.css";
type Props = {
  rooms: Room[];
  startDate: string;
  days: number;
  onEmptyCellClick: (roomId: string, date: string) => void;
  onReservationClick: (reservation: any) => void;
  onBlockClick?: (b: any) => void;
};

export default function CalendarGrid({
  rooms,
  startDate,
  days,
  onEmptyCellClick,
  onReservationClick,
  onBlockClick,
}: Props) {
  const dates = generateDateRange(startDate, days);

  const canonicalStatus = (s: any) => {
    if (!s) return 'reserved';
    const key = String(s).toLowerCase().trim();
    const map: Record<string, string> = {
      'reservado': 'reservado',
      'reserved': 'reservado',
      'pre-reserva': 'pre-reserva',
      'pre_reserva': 'pre-reserva',
      'confirmed': 'confirmado',
      'confirmado': 'confirmado',
      'confimado': 'confirmado',
      'cancelado': 'cancelado',
      'canceled': 'cancelado',
      'checked_in': 'checked_in',
      'checked-in': 'checked_in',
      'checkedout': 'checked_out',
      'checked_out': 'checked_out',
      'checked-out': 'checked_out',
      'no_show': 'no_show',
      'no-show': 'no_show',
      'noshow': 'no_show',
      'blocked': 'blocked',
      'bloqueado': 'blocked',
    };

    return map[key] ?? key.replace(/\s+/g, '-');
  };

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
              const monthLabel = monthShort.charAt(0).toUpperCase() + monthShort.slice(1);

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

            // blocks mapping: build an occupancy array for half-columns so blocks
            // reliably create contiguous colSpans even when dates include timestamps.
            const blocks: RoomBlock[] = (room as any).room_blocks || [];
            const occupied: Array<any | null> = new Array(totalHalfCols).fill(null);
            blocks.forEach((b) => {
              const bStart = (b.start_date || '').slice(0, 10);
              const bEnd = (b.end_date || '').slice(0, 10);
              const startDay = dates.indexOf(bStart);
              const endDay = dates.indexOf(bEnd);
              if (startDay === -1) return;
              const startCol = startDay * 2; // left half of start day
              const endCol = endDay === -1 ? totalHalfCols - 1 : endDay * 2 + 1; // right half of end day
              for (let i = startCol; i <= endCol && i < totalHalfCols; i++) {
                occupied[i] = b;
              }
            });

            const cells: React.ReactElement[] = [];

            for (let col = 0; col < totalHalfCols; col++) {
              // reserva começa aqui
              if (reservationMap[col]) {
                const r = reservationMap[col];
                const statusKey = canonicalStatus(r.status);

                cells.push(
                  <td
                    key={`res-${r.id}`}
                    colSpan={r.span}
                    className={`reservation-cell status-${statusKey} ${r.partner_id || (r.partner && r.partner.id) ? 'has-partner' : ''}`}
                    onClick={() => onReservationClick(r)}
                  >
                    <Popover content={<div><strong>{r.guest_name}</strong><div>{formatDate(r.start_date)} → {formatDate(r.end_date)}</div></div>}>
                        <div className="reservation-info">
                        { (r.partner && r.partner.name) || r.partner_name ? (
                          <span className="partner-badge" aria-label={(r.partner && r.partner.name) || r.partner_name}>🤝</span>
                        ) : null}
                        {r.guest_name}
                      </div>
                    </Popover>
                  </td>
                );

                col += r.span - 1;
                continue;
              }

              // bloqueio começa aqui (blocks take precedence over creating reservations)
              if (occupied[col]) {
                const b = occupied[col];

                // only render at the first column of this occupied span
                if (col === 0 || occupied[col - 1] !== b) {
                  let j = col + 1;
                  while (j < totalHalfCols && occupied[j] === b) j++;
                  const span = j - col;

                  cells.push(
                    <td key={`block-${b.id}`} colSpan={span} className={`reservation-cell room-block-cell`} onClick={() => onBlockClick?.(b)}>
                          <Popover content={<div><strong>Bloqueado</strong><div>{b.reason || 'bloqueio'}</div><div>{formatDate(b.start_date)} → {formatDate(b.end_date)}</div></div>}>
                            <div className="room-block">
                              <span className="block-label">🔒</span>
                              <span className="block-reason">{b.reason || 'Bloqueado'}</span>
                            </div>
                          </Popover>
                        </td>
                  );

                  col += span - 1;
                }

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
