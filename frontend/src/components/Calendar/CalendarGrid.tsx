import React, { useEffect, useRef, useState } from 'react'
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

  const tableRef = useRef<HTMLTableElement | null>(null)
  const floatingRef = useRef<HTMLDivElement | null>(null)
  const floatingRoomRef = useRef<HTMLDivElement | null>(null)
  const [floatingVisible, setFloatingVisible] = useState(false)
  const [floatingRoomVisible, setFloatingRoomVisible] = useState(false)

  useEffect(() => {
    const table = tableRef.current
    const floating = floatingRef.current
    if (!table || !floating) return

    const wrapper = table.closest('.calendar-grid-wrapper') as HTMLElement | null
    const floatingRoom = floatingRoomRef.current

    let rafId: number | null = null

    const headerHStyle = getComputedStyle(document.documentElement).getPropertyValue('--app-header-h') || ''
    const headerH = headerHStyle ? parseInt(headerHStyle) : 60

    function update() {
      rafId = null
      const stickyTh = table.querySelector('thead th.day-header') as HTMLElement | null
      const firstRoomCell = table.querySelector('.room-col') as HTMLElement | null
      if (!stickyTh || !firstRoomCell) return

      const rect = stickyTh.getBoundingClientRect()
      const tableRect = table.getBoundingClientRect()

      // Show floating header when the rendered sticky header cell reaches the
      // app header (i.e. when the sticky th's top <= header height). Using the
      // sticky th is more reliable across browsers because the thead element
      // itself doesn't move when its th children become sticky.
      const shouldFix = rect.top <= headerH + 1

      if (shouldFix) {
        // ensure floating thead mirrors structure & column widths
        const floatingTable = floating.querySelector('table') as HTMLTableElement | null
        const originalThead = table.querySelector('thead') as HTMLElement | null
        if (floatingTable && originalThead) {
          // copy the thead markup
          floatingTable.innerHTML = originalThead.outerHTML

          // copy computed widths of each th to the floating ths to avoid misalignment
          const origThs = Array.from(originalThead.querySelectorAll('th')) as HTMLElement[]
          const floatThs = Array.from(floatingTable.querySelectorAll('th')) as HTMLElement[]
          origThs.forEach((oth, i) => {
            const w = Math.max(0, Math.round(oth.getBoundingClientRect().width))
            if (floatThs[i]) floatThs[i].style.width = `${w}px`
          })
        }
        floating.style.display = 'block'
        floating.style.left = `${tableRect.left}px`
        floating.style.width = `${Math.max(0, tableRect.width)}px`
        // nudge 1px up to avoid a hairline gap between header and clone
        floating.style.top = `calc(var(--app-header-h, ${headerH}px) - 1px)`

        const sx = wrapper ? wrapper.scrollLeft : window.scrollX || window.pageXOffset
        floating.style.transform = `translateX(${-sx}px)`
        setFloatingVisible(true)
      } else {
        floating.style.display = 'none'
        floating.style.transform = ''
        setFloatingVisible(false)
      }

      // --- Floating room column logic ---
      try {
        const roomRect = firstRoomCell.getBoundingClientRect()
        // read sidebar left from CSS var (fallback to 55)
        const sidebarLeftRaw = getComputedStyle(document.documentElement).getPropertyValue('--app-sidebar-left') || ''
        const sidebarLeft = sidebarLeftRaw ? parseInt(sidebarLeftRaw) : 55

        // Show floating room when the original room-col would be scrolled under the table
        const shouldFixRoom = roomRect.left < sidebarLeft + 1

        if (shouldFixRoom && floatingRoom) {
          // build floating room column: copy all .room-col cells (thead + tbody)
          const cells = Array.from(table.querySelectorAll('.calendar-table .room-col')) as HTMLElement[]
          const floatTable = document.createElement('table')
          floatTable.className = 'calendar-table floating-room-table'
          floatTable.style.borderCollapse = 'collapse'

          const tbody = document.createElement('tbody')
          cells.forEach((c, idx) => {
            const tr = document.createElement('tr')
            const td = document.createElement(idx === 0 ? 'th' : 'td')
            td.className = c.className
            td.innerHTML = c.innerHTML
            // copy computed height to keep rows aligned visually
            const h = Math.round(c.getBoundingClientRect().height)
            td.style.height = `${h}px`
            tr.appendChild(td)
            tbody.appendChild(tr)
          })
          floatTable.appendChild(tbody)

          // replace contents
          floatingRoom.innerHTML = ''
          floatingRoom.appendChild(floatTable)

          // position the floating room next to sidebar
          floatingRoom.style.display = 'block'
          floatingRoom.style.left = `${sidebarLeft}px`
          floatingRoom.style.top = `${tableRect.top}px`
          floatingRoom.style.height = `${tableRect.height}px`
          floatingRoom.style.width = `${Math.max(0, Math.round(firstRoomCell.getBoundingClientRect().width))}px`
          setFloatingRoomVisible(true)
        } else if (floatingRoom) {
          floatingRoom.style.display = 'none'
          setFloatingRoomVisible(false)
        }
      } catch (err) {
        // ignore DOM errors
      }
    }

    function schedule() {
      if (rafId == null) rafId = requestAnimationFrame(update)
    }

    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    if (wrapper) wrapper.addEventListener('scroll', schedule, { passive: true })
    
    // keep floating room in sync with vertical scroll of window (updates top)
    function scheduleRoom() {
      if (rafId == null) rafId = requestAnimationFrame(() => {
        rafId = null
        const table = tableRef.current
        const floatingRoom = floatingRoomRef.current
        if (!table || !floatingRoom) return
        const tableRect = table.getBoundingClientRect()
        floatingRoom.style.top = `${tableRect.top}px`
      })
    }
    window.addEventListener('scroll', scheduleRoom, { passive: true })

    schedule()

    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      if (wrapper) wrapper.removeEventListener('scroll', schedule)
      window.removeEventListener('scroll', scheduleRoom)
      if (rafId != null) cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <div className="calendar-wrapper">
      {/* Floating cloned header (hidden until needed) */}
      <div ref={floatingRef} className="floating-thead" aria-hidden={!floatingVisible} style={{ display: 'none' }}>
        <table className="calendar-table floating-table" role="presentation">
          <thead>
            <tr>
              <th className="room-col">Quarto</th>
              {dates.map((date) => {
                const dayNum = format(parseISO(date), 'd')
                const monthAbbr = format(parseISO(date), 'MMM', { locale: ptBR })
                return (
                  <th key={date} className="day-header">
                    <div className="day-header-inner">
                      <span className="month-label">{monthAbbr}</span>
                      <span className="day-label">{dayNum}</span>
                    </div>
                  </th>
                )
              })}
            </tr>
          </thead>
        </table>
      </div>

      {/* Floating room column clone */}
      <div ref={floatingRoomRef} className="floating-roomcol" aria-hidden={!floatingRoomVisible} style={{ display: 'none' }} />

      <table ref={tableRef} className="calendar-table">
        <thead>
          <tr>
            <th className="room-col">Quarto</th>
            {dates.map((date) => {
              const dayNum = format(parseISO(date), 'd')
              const monthAbbr = format(parseISO(date), 'MMM', { locale: ptBR })

              return (
                <th key={date} className="day-header">
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
            const cells: React.ReactElement[] = []

            const reservations: Reservation[] = (room as any).reservations || []
            const blocks: RoomBlock[] = (room as any).room_blocks || []

            // Normalize reservation ranges to render as single colspan overlays
            const reservationRanges: Array<{
              res: Reservation
              startIdx: number
              endIdx: number
              origStart: number
              origEnd: number
            }> = []

            reservations.forEach((r) => {
              const s = format(parseISO(String(r.start_date)), 'yyyy-MM-dd')
              const e = format(parseISO(String(r.end_date)), 'yyyy-MM-dd')
              const origStart = dates.indexOf(s)
              const origEnd = dates.indexOf(e)
              // If reservation doesn't intersect visible range, skip
              if (origEnd === -1 && origStart === -1) return

              const startIdx = Math.max(0, origStart === -1 ? 0 : origStart)
              const endIdx = Math.min(dates.length - 1, origEnd === -1 ? dates.length - 1 : origEnd)

              if (endIdx < 0 || startIdx > dates.length - 1) return

              reservationRanges.push({ res: r, startIdx, endIdx, origStart, origEnd })
            })

            // Sort by start index
            reservationRanges.sort((a, b) => a.startIdx - b.startIdx)

            for (let dayIndex = 0; dayIndex < dates.length; dayIndex++) {
              // If a reservation starts at this visible index, render it with colspan
              const range = reservationRanges.find((rr) => rr.startIdx === dayIndex)
              if (range) {
                const { res, startIdx, endIdx, origStart, origEnd } = range
                const span = endIdx - startIdx + 1
                const statusKey = canonicalStatus(res.status)
                const hasPartner = res.partner_id || (res.partner && res.partner.id)

                // Determine half offsets: startHalf true if reservation originally starts inside visible range
                let startHalf = origStart !== -1 && origStart === startIdx
                let endHalf = origEnd !== -1 && origEnd === endIdx

                // Special-case single-day reservation (start === end visible): render as right-half
                if (origStart !== -1 && origEnd !== -1 && origStart === origEnd) {
                  startHalf = true
                  endHalf = false
                }

                // Compute inline style for overlay using CSS variable for the day width
                // so the overlay starts/ends exactly at the midpoint of the first/last day cell.
                const overlayStyle: React.CSSProperties = {
                  left: startHalf ? 'calc(var(--day-cell-w) / 2)' : '2px',
                  right: endHalf ? 'calc(var(--day-cell-w) / 2)' : '2px',
                }

                // Click handler to determine which day and which half was clicked
                const handleResTdClick = (e: React.MouseEvent<HTMLTableCellElement>) => {
                  // Simple click on a reservation -> edit it
                  onReservationClick(res)
                }

                cells.push(
                  <td key={`res-${res.id}-${startIdx}`} colSpan={span} className="day-cell" onClick={handleResTdClick}>
                    <div
                      className={`reservation-overlay full status-${statusKey} ${hasPartner ? 'has-partner' : ''}`}
                      style={overlayStyle}
                      title={`${res.guest_name} - ${format(parseISO(String(res.start_date)), 'dd/MM')} a ${format(parseISO(String(res.end_date)), 'dd/MM')}`}
                    >
                      <div className="reservation-info">
                        {hasPartner && <span className="partner-badge">🤝</span>}
                        <span className="guest-name">{res.guest_name}</span>
                      </div>
                    </div>
                  </td>
                )

                dayIndex += span - 1
                continue
              }

              // Room block spanning days: find block that intersects this day and render colspan
              const block = blocks.find((blk) => {
                const s = (blk.start_date || '').slice(0, 10)
                const e = (blk.end_date || '').slice(0, 10)
                const bStart = dates.indexOf(s)
                const bEnd = dates.indexOf(e)
                return bStart <= dayIndex && bEnd >= dayIndex
              })

              if (block) {
                // compute contiguous span for this block starting at dayIndex
                const s = (block.start_date || '').slice(0, 10)
                const e = (block.end_date || '').slice(0, 10)
                const bStart = Math.max(0, dates.indexOf(s) === -1 ? 0 : dates.indexOf(s))
                const bEnd = Math.min(dates.length - 1, dates.indexOf(e) === -1 ? dates.length - 1 : dates.indexOf(e))
                const span = Math.max(1, bEnd - Math.max(bStart, dayIndex) + 1)

                cells.push(
                  <td key={`block-${block.id}-${dayIndex}`} colSpan={span} className="day-cell room-block-cell" onClick={() => onBlockClick?.(block)}>
                    <div className="room-block" title={block.reason || 'Bloqueado'}>
                      <span className="block-label">🔒</span>
                      <span className="block-reason">{block.reason || 'Bloqueado'}</span>
                    </div>
                  </td>
                )

                dayIndex += span - 1
                continue
              }

              // Empty day cell
              const date = dates[dayIndex]
              cells.push(
                <td key={`empty-${room.id}-${dayIndex}`} className="day-cell empty" onClick={() => onEmptyCellClick(room.id, date)} />
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
