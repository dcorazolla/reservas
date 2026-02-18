import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@auth/AuthContext'
import { useAlert } from '@components/Shared/AlertContext/AlertContext'
import Modal from '@components/Shared/Modal/Modal'
import SkeletonList from '@components/Shared/Skeleton/SkeletonList'
import { format, parseISO, addDays, subDays, addMonths, startOfMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import CalendarGrid from '@components/Calendar/CalendarGrid'
import ReservationModal from '@components/Reservations/ReservationModal'
import { calendarService } from '@services/calendar'
import { Room } from '@models/room'
import { Reservation } from '@models/reservation'
import './CalendarPage.css'

export default function CalendarPage() {
  const { t } = useTranslation()
  const { token } = useAuth()
  const { showAlert } = useAlert()

  const [currentDate, setCurrentDate] = useState<Date>(() => startOfMonth(new Date()))
  const [days, setDays] = useState(21) // Default: 21 days for desktop
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

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
    if (!token) return

    const loadCalendarData = async () => {
      try {
        setLoading(true)
        const startDate = format(currentDate, 'yyyy-MM-dd')
        const endDate = format(addDays(currentDate, days - 1), 'yyyy-MM-dd')

        const data = await calendarService.getCalendar(startDate, endDate)
        setRooms(data.rooms || [])
      } catch (error) {
        showAlert('error', t('calendar.error_loading') || 'Erro ao carregar calendário')
        console.error('Error loading calendar:', error)
      } finally {
        setLoading(false)
      }
    }

    loadCalendarData()
  }, [currentDate, days, token])

  const handlePrevMonth = () => {
    setCurrentDate(prev => subDays(prev, days))
  }

  const handleNextMonth = () => {
    setCurrentDate(prev => addDays(prev, days))
  }

  const handleDaysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value)
    const min = window.innerWidth < 600 ? 5 : window.innerWidth < 1024 ? 10 : 15
    const max = window.innerWidth < 600 ? 10 : window.innerWidth < 1024 ? 15 : 35

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
        const data = await calendarService.getCalendar(startDate, endDate)
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
        <div className="calendar-header">
          <h1>{t('calendar.title')}</h1>
        </div>
        <SkeletonList rows={5} />
      </div>
    )
  }

  const startDate = format(currentDate, 'yyyy-MM-dd')
  const endDate = format(addDays(currentDate, days - 1), 'yyyy-MM-dd')
  const monthYearLabel = format(currentDate, 'MMMM yyyy', { locale: ptBR })
  const minDays = window.innerWidth < 600 ? 5 : window.innerWidth < 1024 ? 10 : 15
  const maxDays = window.innerWidth < 600 ? 10 : window.innerWidth < 1024 ? 15 : 35

  return (
    <div className="calendar-page">
      <div className="calendar-header">
        <h1>{t('calendar.title')}</h1>
      </div>

      <div className="calendar-controls">
        <button onClick={handlePrevMonth} className="btn-nav" title={t('calendar.prev')}>
          ← {t('calendar.prev')}
        </button>

        <div className="controls-group">
          <div className="control-item">
            <label htmlFor="current-date">{t('calendar.period')}</label>
            <input
              type="date"
              id="current-date"
              value={startDate}
              onChange={(e) => setCurrentDate(parseISO(e.target.value))}
            />
          </div>

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
            {monthYearLabel} ({startDate} a {endDate})
          </div>
        </div>

        <button onClick={handleNextMonth} className="btn-nav" title={t('calendar.next')}>
          {t('calendar.next')} →
        </button>
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
        <ReservationModal
          reservation={selectedReservation}
          roomId={selectedRoom}
          startDate={selectedDate}
          rooms={rooms}
          onSave={handleSaveReservation}
          onClose={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  )
}
