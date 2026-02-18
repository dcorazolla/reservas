import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@contexts/AuthContext'
import { decodeTokenPayload } from '@services/auth'
import Modal from '@components/Shared/Modal/Modal'
import SkeletonList from '@components/Shared/Skeleton/SkeletonList'
import { format, parseISO, addDays, subDays, addMonths, startOfMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import CalendarGrid from '@components/Calendar/CalendarGrid'
import { getCalendarData, generateDateRange } from '@services/calendar'
import { Room } from '@models/room'
import { Reservation } from '@models/reservation'
import './CalendarPage.css'

export default function CalendarPage() {
  const { t } = useTranslation()
  const { token } = useAuth()
  const [propertyId, setPropertyId] = useState<string | null>(null)

  const [days, setDays] = useState(21) // Default: 21 days for desktop
  const [dateOffset, setDateOffset] = useState(0) // Offset in days from centered today
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  // Compute currentDate: center on today, minus half of days, plus offset
  const currentDate = React.useMemo(() => {
    const today = new Date()
    const halfDays = Math.floor(days / 2)
    return addDays(subDays(today, halfDays), dateOffset)
  }, [days, dateOffset])

  // Determine responsive defaults based on viewport width
  useEffect(() => {
    // Decode property_id from token
    if (token) {
      const payload = decodeTokenPayload(token) as any
      if (payload?.property_id) {
        setPropertyId(payload.property_id)
      }
    }
  }, [token])

  // Determine responsive defaults based on viewport width
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      if (width < 600) {
        setDays(7) // Mobile default: 7 days
      } else if (width < 1024) {
        setDays(12) // Tablet default: 12 days
      } else {
        setDays(21) // Desktop default: 21 days
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Load calendar data
  useEffect(() => {
    if (!token || !propertyId) return

    const loadCalendarData = async () => {
      try {
        setLoading(true)
        const startDate = format(currentDate, 'yyyy-MM-dd')
        const endDate = format(addDays(currentDate, days - 1), 'yyyy-MM-dd')

        const data = await getCalendarData(propertyId, startDate, endDate)
        setRooms(data.rooms || [])
      } catch (error) {
        console.error('Error loading calendar:', error)
      } finally {
        setLoading(false)
      }
    }

    loadCalendarData()
  }, [currentDate, days, token, propertyId])

  const handlePrevMonth = () => {
    setDateOffset(prev => prev - days)
  }

  const handleNextMonth = () => {
    setDateOffset(prev => prev + days)
  }

  const handleResetToday = () => {
    setDateOffset(0)
  }

  const handleDaysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value)
    const min = 5
    const max = 35

    if (value >= min && value <= max) {
      setDays(value)
    }
  }

  const handleEmptyCellClick = (roomId: string, date: string) => {
    setSelectedRoom(roomId)
    setSelectedDate(date)
    setSelectedReservation(null)
    setIsModalOpen(true)
  }

  const handleReservationClick = (reservation: Reservation) => {
    setSelectedReservation(reservation)
    setSelectedRoom(null)
    setSelectedDate(null)
    setIsModalOpen(true)
  }

  const handleBlockClick = (block: any) => {
    // TODO: Implement block editing
    console.log('Block clicked:', block)
  }

  const handleSaveReservation = () => {
    setIsModalOpen(false)
    setSelectedReservation(null)
    setSelectedRoom(null)
    setSelectedDate(null)
    // Refresh calendar data
    const loadCalendarData = async () => {
      try {
        const startDate = format(currentDate, 'yyyy-MM-dd')
        const endDate = format(addDays(currentDate, days - 1), 'yyyy-MM-dd')
        const data = await getCalendarData(propertyId, startDate, endDate)
        setRooms(data.rooms || [])
      } catch (error) {
        console.error('Error refreshing calendar:', error)
      }
    }
    loadCalendarData()
  }

  if (loading && rooms.length === 0) {
    return (
      <div className="calendar-page">
        <SkeletonList rows={5} />
      </div>
    )
  }

  const startDate = format(currentDate, 'yyyy-MM-dd')
  const endDate = format(addDays(currentDate, days - 1), 'yyyy-MM-dd')
  const monthYearLabel = format(currentDate, 'MMMM yyyy', { locale: ptBR })
  const minDays = 5
  const maxDays = 35

  return (
    <div className="calendar-page">
      <div className="calendar-controls">
        <button onClick={handlePrevMonth} className="btn-nav btn-nav-small" title={t('calendar.prev')}>
          ←
        </button>

        <button onClick={handleResetToday} className="btn-nav btn-nav-small" title="Hoje">
          Hoje
        </button>

        <button onClick={handleNextMonth} className="btn-nav btn-nav-small" title={t('calendar.next')}>
          →
        </button>

        <div className="controls-group">
          <div className="control-item">
            <label htmlFor="days-count">{t('calendar.days')}</label>
            <input
              type="number"
              id="days-count"
              min={minDays}
              max={maxDays}
              value={days}
              onChange={handleDaysChange}
            />
          </div>

          <div className="period-label">
            {monthYearLabel}
          </div>
        </div>
      </div>

      <div className="calendar-grid-wrapper">
        {rooms.length > 0 ? (
          <CalendarGrid
            rooms={rooms}
            startDate={startDate}
            days={days}
            onEmptyCellClick={handleEmptyCellClick}
            onReservationClick={handleReservationClick}
            onBlockClick={handleBlockClick}
          />
        ) : (
          <div className="empty-state">
            <p>{t('calendar.empty')}</p>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedReservation(null)
          setSelectedRoom(null)
          setSelectedDate(null)
        }}
        title={selectedReservation ? t('reservations.edit') : t('reservations.new')}
      >
        <div style={{ padding: '20px' }}>
          <p>{selectedReservation ? 'Editar reserva' : 'Criar nova reserva'}</p>
          <p>Room: {selectedRoom}</p>
          <p>Date: {selectedDate}</p>
          <button
            onClick={handleSaveReservation}
            style={{
              padding: '8px 16px',
              marginTop: '16px',
              backgroundColor: '#3182CE',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Salvar
          </button>
        </div>
      </Modal>
    </div>
  )
}
