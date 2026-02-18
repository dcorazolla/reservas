import React from 'react'
import { format, parseISO, addDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { Room } from '@models/room'
import type { Reservation } from '@models/reservation'
import './CalendarGrid.css'

interface RoomBlock {
  id: string
  room_id: string
  start_date: string
  end_date: string
  reason?: string
}

interface CalendarGridProps {
  rooms: Room[]
  startDate: string
  days: number
  onEmptyCellClick: (roomId: string, date: string) => void
  onReservationClick: (reservation: Reservation) => void
  onBlockClick?: (block: RoomBlock) => void
}

export default function CalendarGrid({
  rooms,
  startDate,
  days,
  onEmptyCellClick,
  onReservationClick,
  onBlockClick,
}: CalendarGridProps) {
  // Generate date range
  const dates: string[] = []
  for (let i = 0; i < days; i++) {
    const date = addDays(parseISO(startDate), i)
    dates.push(format(date, 'yyyy-MM-dd'))
  }

  const canonicalStatus = (s: any): string => {
    if (!s) return 'reservado'
    const key = String(s).toLowerCase().trim()
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
      'checked_in': 'checked-in',
      'checked-in': 'checked-in',
      'checkedout': 'checked-out',
      'checked_out': 'checked-out',
      'checked-out': 'checked-out',
      'no_show': 'no-show',
      'no-show': 'no-show',
      'noshow': 'no-show',
      'blocked': 'blocked',
      'bloqueado': 'blocked',
    }
    return map[key] ?? key.replace(/\s+/g, '-')
  }

  return (
    <div className="calendar-wrapper">
      <table className="calendar-table">
        <thead>
          <tr>
            <th className="room-col">Quarto</th>
            {dates.map((date) => {
              const dayNum = format(parseISO(date), 'd')
              const monthAbbr = format(parseISO(date), 'MMM', { locale: ptBR })

              return (
                <th key={date} colSpan={2} className="day-header">
                  <div className="day-header-inner">
                    <span className="month-label">{monthAbbr}</span>
                    <span className="day-label">{dayNum}</span>
                  </div>
                </th>
              )
            })}
          </tr>
        </thead>

        <tbody>
          {rooms.map((room) => {
            const totalHalfCols = dates.length * 2
            const reservationMap: Record<number, any> = {}
            const occupied: Array<any | null> = new Array(totalHalfCols).fill(null)

            // Map reservations
            if (room.reservations) {
              room.reservations.forEach((r: Reservation) => {
                const startDateStr = format(parseISO(String(r.start_date)), 'yyyy-MM-dd')
                const endDateStr = format(parseISO(String(r.end_date)), 'yyyy-MM-dd')
                const startDay = dates.indexOf(startDateStr)
                const endDay = dates.indexOf(endDateStr)

                if (startDay === -1) return

                const startCol = startDay * 2 + 1 // Check-in half
                const endCol = endDay === -1 ? totalHalfCols - 1 : endDay * 2 // Checkout half
                const span = Math.max(endCol - startCol + 1, 1)

                reservationMap[startCol] = {
                  ...r,
                  span,
                }
              })
            }

            // Map room blocks
            const blocks: RoomBlock[] = (room as any).room_blocks || []
            blocks.forEach((b) => {
              const bStart = (b.start_date || '').slice(0, 10)
              const bEnd = (b.end_date || '').slice(0, 10)
              const startDay = dates.indexOf(bStart)
              const endDay = dates.indexOf(bEnd)

              if (startDay === -1) return

              const startCol = startDay * 2 // Left half
              const endCol = endDay === -1 ? totalHalfCols - 1 : endDay * 2 + 1 // Right half

              for (let i = startCol; i <= endCol && i < totalHalfCols; i++) {
                occupied[i] = b
              }
            })

            const cells: React.ReactElement[] = []

            for (let col = 0; col < totalHalfCols; col++) {
              // Reservation
              if (reservationMap[col]) {
                const r = reservationMap[col]
                const statusKey = canonicalStatus(r.status)
                const hasPartner = r.partner_id || (r.partner && r.partner.id)

                cells.push(
                  <td
                    key={`res-${r.id}`}
                    colSpan={r.span}
                    className={`reservation-cell status-${statusKey} ${hasPartner ? 'has-partner' : ''}`}
                    onClick={() => onReservationClick(r)}
                  >
                    <div className="reservation-info" title={`${r.guest_name} - ${format(parseISO(String(r.start_date)), 'dd/MM')} a ${format(parseISO(String(r.end_date)), 'dd/MM')}`}>
                      {hasPartner && <span className="partner-badge">🤝</span>}
                      <span className="guest-name">{r.guest_name}</span>
                    </div>
                  </td>
                )

                col += r.span - 1
                continue
              }

              // Room block
              if (occupied[col]) {
                const b = occupied[col]

                if (col === 0 || occupied[col - 1] !== b) {
                  let j = col + 1
                  while (j < totalHalfCols && occupied[j] === b) j++
                  const span = j - col

                  cells.push(
                    <td
                      key={`block-${b.id}`}
                      colSpan={span}
                      className="reservation-cell room-block-cell"
                      onClick={() => onBlockClick?.(b)}
                    >
                      <div className="room-block" title={b.reason || 'Bloqueado'}>
                        <span className="block-label">🔒</span>
                        <span className="block-reason">{b.reason || 'Bloqueado'}</span>
                      </div>
                    </td>
                  )

                  col += span - 1
                }

                continue
              }

              // Empty cell
              const dayIndex = Math.floor(col / 2)
              const date = dates[dayIndex]
              const isCheckout = col % 2 === 0
              const cellLabel = isCheckout ? 'checkout' : 'checkin'

              cells.push(
                <td
                  key={`empty-${col}`}
                  className={`half-cell ${cellLabel}`}
                  onClick={() => onEmptyCellClick(room.id, date)}
                />
              )
            }

            return (
              <tr key={room.id}>
                <td className="room-col">{room.name}</td>
                {cells}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
