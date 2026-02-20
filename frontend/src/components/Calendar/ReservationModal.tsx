import React, { useEffect, useRef, useState, useCallback } from 'react'
import { format, parseISO, addDays, differenceInCalendarDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useAuth } from '@contexts/AuthContext'
import { decodeTokenPayload } from '@services/auth'
import Modal from '@components/Shared/Modal/Modal'
import FormField from '@components/Shared/FormField/FormField'
import SkeletonFields from '@components/Shared/Skeleton/SkeletonFields'
import MinibarPanel from './MinibarPanel'
import {
  createReservation,
  updateReservation,
  calculateReservationPrice,
  checkInReservation,
  checkOutReservation,
  confirmReservation,
  cancelReservation,
} from '@services/reservations'
import { listPartners } from '@services/partners'
import { listRooms } from '@services/rooms'
import { listMinibarProducts } from '@services/minibar'
import type { Reservation } from '@models/reservation'
import type { Room } from '@models/room'
import type { Partner } from '@models/partner'
import type { MinibarProduct, MinibarConsumption } from '@models/minibar'

type Props = {
  isOpen: boolean
  onClose: () => void
  onSaved?: () => void
  reservation?: Reservation | null
  roomId?: string | null
  date?: string | null
  rooms?: Room[]
}

type ReservationFormData = {
  guest_name: string
  room_id: string
  start_date: string
  end_date: string
  adults_count: number
  children_count: number
  infants_count: number
  notes: string
  partner_id: string | null
  status: string
}

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  'pre-reserva': { bg: '#fbbf24', text: '#78350f', label: 'Pré-reserva' },
  'reservado': { bg: '#60a5fa', text: 'white', label: 'Reservado' },
  'confirmado': { bg: '#34d399', text: 'white', label: 'Confirmado' },
  'checked_in': { bg: '#a78bfa', text: 'white', label: 'Check-in' },
  'checked_out': { bg: '#fb923c', text: 'white', label: 'Check-out' },
  'no_show': { bg: '#ef4444', text: 'white', label: 'No-show' },
  'cancelado': { bg: '#9ca3af', text: 'white', label: 'Cancelado' },
  'blocked': { bg: '#6b7280', text: 'white', label: 'Bloqueado' },
}

export default function ReservationModal({
  isOpen,
  onClose,
  onSaved,
  reservation,
  roomId,
  date,
  rooms = [],
}: Props) {
  const { token } = useAuth()
  const [propertyId, setPropertyId] = useState<string | null>(null)

  const isEditing = !!reservation
  const firstFieldRef = useRef<HTMLInputElement | null>(null)
  const previousActiveRef = useRef<HTMLElement | null>(null)

  // Form state
  const [formData, setFormData] = useState<ReservationFormData>({
    guest_name: '',
    room_id: roomId ?? '',
    start_date: date ?? '',
    end_date: '',
    adults_count: 1,
    children_count: 0,
    infants_count: 0,
    notes: '',
    partner_id: null,
    status: 'pre-reserva',
  })

  // API data
  const [allRooms, setAllRooms] = useState<Room[]>(rooms)
  const [partners, setPartners] = useState<Partner[]>([])
  const [minibarProducts, setMinibarProducts] = useState<MinibarProduct[]>([])
  const [showMinibar, setShowMinibar] = useState(false)
  const [localConsumptions, setLocalConsumptions] = useState<MinibarConsumption[]>([])

  // Computed fields
  const [calcTotal, setCalcTotal] = useState(0)
  const [daysBreakdown, setDaysBreakdown] = useState<Array<{ date: string; price: number }>>([])
  const [priceOverride, setPriceOverride] = useState<string | null>(null)
  const [showManualPrice, setShowManualPrice] = useState(false)

  // UI state
  const [initialLoading, setInitialLoading] = useState(true)
  const [calcLoading, setCalcLoading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  // Extract property_id from token
  useEffect(() => {
    if (token) {
      const payload = decodeTokenPayload(token) as any
      if (payload?.property_id) {
        setPropertyId(payload.property_id)
      }
    }
  }, [token])

  // Load partners and rooms on mount
  useEffect(() => {
    if (!isOpen || !propertyId) return

    const loadData = async () => {
      try {
        setInitialLoading(true)
        const [partnersData, roomsData, minibarData] = await Promise.all([
          listPartners(),
          listRooms(),
          listMinibarProducts(),
        ])
        setPartners(partnersData)
        setAllRooms(roomsData)
        setMinibarProducts(minibarData)
      } catch (err) {
        console.error('Error loading modal data:', err)
      } finally {
        setInitialLoading(false)
      }
    }

    loadData()
  }, [isOpen, propertyId])

  // Initialize form from reservation
  useEffect(() => {
    if (isEditing && reservation) {
      setFormData({
        guest_name: reservation.guest_name || '',
        room_id: reservation.room_id || '',
        start_date: reservation.start_date || '',
        end_date: reservation.end_date || '',
        adults_count: reservation.adults_count || 1,
        children_count: reservation.children_count || 0,
        infants_count: reservation.infants_count || 0,
        notes: reservation.notes || '',
        partner_id: reservation.partner_id || null,
        status: reservation.status || 'pre-reserva',
      })
      if (reservation.price_override) {
        setPriceOverride(String(reservation.price_override))
        setShowManualPrice(true)
      }
    } else if (date && roomId) {
      // Criar nova reserva com data e quarto pré-selecionados
      const endDate = format(addDays(parseISO(date), 1), 'yyyy-MM-dd')
      setFormData((prev) => ({
        ...prev,
        room_id: roomId,
        start_date: date,
        end_date: endDate,
      }))
    }
  }, [isEditing, reservation, date, roomId])

  // Accessibility: manage focus
  useEffect(() => {
    if (isOpen) {
      previousActiveRef.current = document.activeElement as HTMLElement | null
      const timer = setTimeout(() => firstFieldRef.current?.focus(), 100)

      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose()
      }

      document.addEventListener('keydown', handleEsc)
      return () => {
        document.removeEventListener('keydown', handleEsc)
        clearTimeout(timer)
      }
    }
  }, [isOpen, onClose])

  // Restore focus on close
  useEffect(() => {
    return () => {
      if (previousActiveRef.current) {
        previousActiveRef.current.focus()
      }
    }
  }, [])

  // Validate dates and capacity
  useEffect(() => {
    const newErrors: Record<string, string> = {}

    if (!formData.guest_name) {
      newErrors.guest_name = 'Nome do hóspede é obrigatório'
    }
    if (!formData.room_id) {
      newErrors.room_id = 'Quarto é obrigatório'
    }
    if (!formData.start_date) {
      newErrors.start_date = 'Data de entrada é obrigatória'
    }
    if (!formData.end_date) {
      newErrors.end_date = 'Data de saída é obrigatória'
    }
    if (formData.start_date && formData.end_date && parseISO(formData.end_date) <= parseISO(formData.start_date)) {
      newErrors.end_date = 'Saída deve ser após a entrada'
    }

    const totalPeople = formData.adults_count + formData.children_count
    const selectedRoom = allRooms.find((r) => r.id === formData.room_id)
    if (selectedRoom?.capacity && totalPeople > selectedRoom.capacity) {
      newErrors.adults_count = `Total de pessoas excede capacidade (${selectedRoom.capacity})`
    }

    setFieldErrors(newErrors)
  }, [formData, allRooms])

  // Calculate price
  const computePrice = useCallback(async () => {
    if (!propertyId || !formData.start_date || !formData.end_date || !formData.room_id) return

    try {
      setCalcLoading(true)
      const calculation = await calculateReservationPrice(propertyId, {
        room_id: formData.room_id,
        start_date: formData.start_date,
        end_date: formData.end_date,
        adults_count: formData.adults_count,
        children_count: formData.children_count,
        infants_count: formData.infants_count,
      })
      setCalcTotal(calculation.total)
      setDaysBreakdown(calculation.days || [])
      setError('')
    } catch (err: any) {
      console.error('Erro ao calcular preço:', err)
      setError(err.message || 'Erro ao calcular preço')
      setCalcTotal(0)
      setDaysBreakdown([])
    } finally {
      setCalcLoading(false)
    }
  }, [propertyId, formData])

  // Trigger price calculation
  useEffect(() => {
    if (priceOverride) {
      const override = parseFloat(priceOverride)
      if (!Number.isNaN(override)) {
        setCalcTotal(override)
        return
      }
    }

    computePrice()
  }, [formData.start_date, formData.end_date, formData.room_id, priceOverride, computePrice])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as any
    const val = type === 'number' ? parseInt(value) : value
    setFormData((prev) => ({
      ...prev,
      [name]: val,
    }))
  }

  const handleStatusAction = useCallback(
    async (action: 'confirm' | 'checkin' | 'checkout' | 'cancel' | 'finalize', extras?: Record<string, string>) => {
      if (!reservation || !propertyId) return

      try {
        setLoading(true)
        setError('')

        let updated: Reservation
        switch (action) {
          case 'confirm': {
            const guarantee = window.prompt('Tipo de garantia (card/prepay) — deixe vazio para sem garantia')
            updated = await confirmReservation(propertyId, reservation.id, guarantee ? { guarantee_type: guarantee } : {})
            break
          }
          case 'checkin':
            updated = await checkInReservation(propertyId, reservation.id)
            break
          case 'checkout':
            updated = await checkOutReservation(propertyId, reservation.id)
            break
          case 'cancel': {
            const reason = window.prompt('Motivo do cancelamento')
            updated = await cancelReservation(propertyId, reservation.id)
            break
          }
          default:
            return
        }

        if (onSaved) onSaved()
        onClose()
      } catch (err: any) {
        setError(err.message || `Erro ao ${action}`)
      } finally {
        setLoading(false)
      }
    },
    [reservation, propertyId, onSaved, onClose]
  )

  const handleSave = async () => {
    if (Object.keys(fieldErrors).length > 0) {
      setError('Corrija os erros antes de salvar')
      return
    }

    if (!propertyId) {
      setError('Property ID não encontrado')
      return
    }

    setLoading(true)
    setError('')

    try {
      const payload = {
        guest_name: formData.guest_name,
        room_id: formData.room_id,
        start_date: formData.start_date,
        end_date: formData.end_date,
        adults_count: formData.adults_count,
        children_count: formData.children_count,
        infants_count: formData.infants_count,
        notes: formData.notes,
        partner_id: formData.partner_id,
        status: formData.status,
        price_override: priceOverride ? parseFloat(priceOverride) : null,
      }

      if (isEditing && reservation) {
        await updateReservation(propertyId, reservation.id, payload)
      } else {
        await createReservation(propertyId, payload)
      }

      if (onSaved) onSaved()
      onClose()
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar reserva')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const selectedRoom = allRooms.find((r) => r.id === formData.room_id)
  const stayLength =
    formData.start_date && formData.end_date
      ? differenceInCalendarDays(parseISO(formData.end_date), parseISO(formData.start_date))
      : 0

  const statusConfig = STATUS_COLORS[formData.status] || STATUS_COLORS['pre-reserva']

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Reserva' : 'Nova Reserva'}
    >
      <div style={{ padding: '20px', maxWidth: '800px' }} aria-busy={initialLoading || calcLoading}>
        {/* Status row with indicator and action buttons (edit mode only) */}
        {isEditing && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  padding: '6px 12px',
                  backgroundColor: statusConfig.bg,
                  color: statusConfig.text,
                  borderRadius: '4px',
                  fontWeight: '500',
                  fontSize: '14px',
                }}
              >
                {statusConfig.label}
              </div>
              {reservation?.guarantee_type && (
                <div
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#f0f0f0',
                    color: '#333',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '500',
                  }}
                  title={`Garantia: ${reservation.guarantee_type}`}
                >
                  {reservation.guarantee_type}
                </div>
              )}
            </div>

            {/* Status transition buttons */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {formData.status === 'pre-reserva' && (
                <>
                  <button
                    type="button"
                    onClick={() => handleStatusAction('confirm')}
                    style={{
                      padding: '6px 12px',
                      fontSize: '12px',
                      backgroundColor: '#34d399',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                    disabled={loading}
                  >
                    Confirmar
                  </button>
                </>
              )}
              {formData.status === 'reservado' && (
                <>
                  <button
                    type="button"
                    onClick={() => handleStatusAction('confirm')}
                    style={{
                      padding: '6px 12px',
                      fontSize: '12px',
                      backgroundColor: '#34d399',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                    disabled={loading}
                  >
                    Confirmar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusAction('checkin')}
                    style={{
                      padding: '6px 12px',
                      fontSize: '12px',
                      backgroundColor: '#a78bfa',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                    disabled={loading}
                  >
                    Check-in
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusAction('cancel')}
                    style={{
                      padding: '6px 12px',
                      fontSize: '12px',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                    disabled={loading}
                  >
                    Cancelar
                  </button>
                </>
              )}
              {formData.status === 'confirmado' && (
                <button
                  type="button"
                  onClick={() => handleStatusAction('checkin')}
                  style={{
                    padding: '6px 12px',
                    fontSize: '12px',
                    backgroundColor: '#a78bfa',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                  disabled={loading}
                >
                  Check-in
                </button>
              )}
              {formData.status === 'checked_in' && (
                <button
                  type="button"
                  onClick={() => handleStatusAction('checkout')}
                  style={{
                    padding: '6px 12px',
                    fontSize: '12px',
                    backgroundColor: '#fb923c',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                  disabled={loading}
                >
                  Check-out
                </button>
              )}
            </div>

            {/* Minibar toggle button (edit mode only) */}
            {isEditing && minibarProducts.length > 0 && (
              <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
                <button
                  type="button"
                  onClick={() => setShowMinibar(!showMinibar)}
                  style={{
                    padding: '6px 12px',
                    fontSize: '12px',
                    backgroundColor: '#f59e0b',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: '500',
                  }}
                  disabled={loading}
                >
                  {showMinibar ? 'Ocultar Frigobar' : 'Mostrar Frigobar'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Minibar Panel */}
        {isEditing && showMinibar && minibarProducts.length > 0 && (
          <div
            style={{
              padding: '12px',
              marginBottom: '16px',
              backgroundColor: '#fffbeb',
              border: '1px solid #fcd34d',
              borderRadius: '4px',
            }}
          >
            <MinibarPanel
              products={minibarProducts}
              reservationId={reservation?.id || null}
              onConsumptionCreated={(consumption) => {
                setLocalConsumptions((prev) => [consumption, ...prev])
              }}
              onProductsChange={setMinibarProducts}
            />
          </div>
        )}

        {error && (
          <div
            style={{
              padding: '12px',
              marginBottom: '16px',
              backgroundColor: '#fee',
              color: '#c33',
              borderRadius: '4px',
              fontSize: '14px',
            }}
            aria-live="assertive"
          >
            {error}
          </div>
        )}

        {initialLoading ? (
          <SkeletonFields rows={6} />
        ) : (
          <>
            {/* Guest Name */}
            <FormField label="Hóspede" name="guest_name" errors={fieldErrors}>
              <input
                ref={firstFieldRef}
                type="text"
                name="guest_name"
                value={formData.guest_name}
                onChange={handleInputChange}
                placeholder="Nome completo"
                disabled={loading || calcLoading}
                autoFocus
              />
            </FormField>

            {/* Guests breakdown - 3 column layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <FormField label="Adultos" name="adults_count" errors={fieldErrors}>
                <input
                  type="number"
                  name="adults_count"
                  value={formData.adults_count}
                  onChange={handleInputChange}
                  min={1}
                  disabled={loading || calcLoading}
                />
              </FormField>
              <FormField label="Crianças" name="children_count">
                <input
                  type="number"
                  name="children_count"
                  value={formData.children_count}
                  onChange={handleInputChange}
                  min={0}
                  disabled={loading || calcLoading}
                />
              </FormField>
              <FormField label="Bebês" name="infants_count">
                <input
                  type="number"
                  name="infants_count"
                  value={formData.infants_count}
                  onChange={handleInputChange}
                  min={0}
                  disabled={loading || calcLoading}
                />
              </FormField>
            </div>

            {/* Dates - 2 column layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <FormField label="Entrada" name="start_date" errors={fieldErrors}>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  disabled={loading || calcLoading}
                />
              </FormField>
              <FormField label="Saída" name="end_date" errors={fieldErrors}>
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleInputChange}
                  disabled={loading || calcLoading}
                />
              </FormField>
            </div>

            {/* Room Selection */}
            <FormField label="Quarto" name="room_id" errors={fieldErrors}>
              <select
                name="room_id"
                value={formData.room_id}
                onChange={handleInputChange}
                disabled={loading || calcLoading || allRooms.length === 0}
              >
                <option value="">(Selecione um quarto)</option>
                {allRooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.name || room.id}
                  </option>
                ))}
              </select>
            </FormField>

            {/* Price Summary */}
            <div
              style={{
                padding: '12px',
                marginBottom: '16px',
                backgroundColor: '#f5f5f5',
                borderRadius: '4px',
                border: '1px solid #ddd',
              }}
            >
              {calcLoading ? (
                <div>Calculando preço…</div>
              ) : (
                <>
                  {/* Total price row with edit button */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '8px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '4px' }}>
                        Total: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(calcTotal)}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {stayLength} noite{stayLength !== 1 ? 's' : ''}
                      </div>
                    </div>

                    {/* Manual price input field (compact, inline with button) */}
                    {showManualPrice && (
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <input
                          type="number"
                          step="0.01"
                          value={priceOverride || ''}
                          onChange={(e) => setPriceOverride(e.target.value)}
                          placeholder={String(calcTotal)}
                          style={{
                            padding: '6px 8px',
                            fontSize: '13px',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            width: '100px',
                          }}
                          disabled={loading || calcLoading}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setPriceOverride(null)
                            setShowManualPrice(false)
                          }}
                          style={{
                            padding: '6px 8px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            backgroundColor: '#fff',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            whiteSpace: 'nowrap',
                          }}
                          disabled={loading || calcLoading}
                        >
                          Apagar
                        </button>
                      </div>
                    )}

                    {!showManualPrice && (
                      <button
                        type="button"
                        onClick={() => setShowManualPrice(true)}
                        style={{
                          padding: '6px 12px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          backgroundColor: '#fff',
                          border: '1px solid #ccc',
                          borderRadius: '4px',
                          whiteSpace: 'nowrap',
                        }}
                        disabled={loading || calcLoading}
                      >
                        Editar
                      </button>
                    )}
                  </div>

                  {/* Days breakdown (small font, pipe-separated) */}
                  {daysBreakdown.length > 0 && !priceOverride && (
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '8px', lineHeight: '1.4' }}>
                      {daysBreakdown
                        .map((d) => `${format(parseISO(d.date), 'dd/MM')}: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(d.price)}`)
                        .join(' | ')}
                    </div>
                  )}

                  {/* Show when no manual override */}
                  {!priceOverride && !showManualPrice && daysBreakdown.length === 0 && (
                    <div style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
                      (Preço manual não definido)
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Partner and Notes - 2 column layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <FormField label="Parceiro" name="partner_id">
                <select
                  name="partner_id"
                  value={formData.partner_id || ''}
                  onChange={handleInputChange}
                  disabled={loading || calcLoading}
                >
                  <option value="">(Nenhum)</option>
                  {partners.map((partner) => (
                    <option key={partner.id} value={partner.id}>
                      {partner.name}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="Observações" name="notes">
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Adicione informações adicionais..."
                  style={{ minHeight: '80px', fontFamily: 'inherit', resize: 'vertical' }}
                  disabled={loading || calcLoading}
                />
              </FormField>
            </div>

            {/* Status (only on edit) */}
            {isEditing && (
              <FormField label="Status" name="status">
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  disabled={loading || calcLoading}
                >
                  <option value="pre-reserva">Pré-reserva</option>
                  <option value="reservado">Reservado</option>
                  <option value="confirmado">Confirmado</option>
                  <option value="checked_in">Check-in</option>
                  <option value="checked_out">Check-out</option>
                  <option value="no_show">No-show</option>
                  <option value="cancelado">Cancelado</option>
                  <option value="blocked">Bloqueado</option>
                </select>
              </FormField>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#f5f5f5',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
                disabled={loading || calcLoading}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSave}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#3182CE',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
                disabled={loading || calcLoading || Object.keys(fieldErrors).length > 0}
              >
                {loading ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}
