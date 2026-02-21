import React, { useEffect, useRef, useState, useCallback } from 'react'
import { format, parseISO, addDays, differenceInCalendarDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useAuth } from '@contexts/AuthContext'
import { decodeTokenPayload } from '@services/auth'
import Modal from '@components/Shared/Modal/Modal'
import FormField from '@components/Shared/FormField/FormField'
import SkeletonFields from '@components/Shared/Skeleton/SkeletonFields'
import MinibarPanel from './MinibarPanel'
import ReservationCancellationModal from './ReservationCancellationModal'
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
import { listMinibarProducts, listConsumptions } from '@services/minibar'
import './ReservationModal.css'
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

const STATUS_LABELS: Record<string, string> = {
  'pre-reserva': 'Pré-reserva',
  'reservado': 'Reservado',
  'confirmado': 'Confirmado',
  'checked_in': 'Check-in',
  'checked_out': 'Check-out',
  'no_show': 'No-show',
  'cancelado': 'Cancelado',
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
  
  // Status action dialogs
  const [confirmDialog, setConfirmDialog] = useState<{
    action: 'confirm' | 'checkin' | 'checkout' | 'cancel' | null
    isOpen: boolean
  }>({ action: null, isOpen: false })
  const [guaranteeInput, setGuaranteeInput] = useState('')
  const [showCancellationModal, setShowCancellationModal] = useState(false)
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

  // Load existing minibar consumptions when reservation is loaded
  useEffect(() => {
    if (isEditing && reservation?.id) {
      const loadConsumptions = async () => {
        try {
          const consumptions = await listConsumptions(reservation.id)
          setLocalConsumptions(consumptions)
        } catch (err) {
          console.error('Error loading minibar consumptions:', err)
        }
      }
      loadConsumptions()
    } else {
      // Reset consumptions for new reservation
      setLocalConsumptions([])
    }
  }, [isEditing, reservation?.id])

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
    async (action: 'confirm' | 'checkin' | 'checkout' | 'cancel' | 'finalize') => {
      if (action === 'confirm') {
        // Open dialog for guarantee type
        setConfirmDialog({ action: 'confirm', isOpen: true })
        return
      }

      if (action === 'cancel') {
        // Open cancellation modal with refund preview
        setShowCancellationModal(true)
        return
      }

      // For checkin and checkout, execute directly
      if (!reservation || !propertyId) return

      try {
        setLoading(true)
        setError('')

        let updated: Reservation
        switch (action) {
          case 'checkin':
            updated = await checkInReservation(propertyId, reservation.id)
            break
          case 'checkout':
            updated = await checkOutReservation(propertyId, reservation.id)
            break
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

  const executeStatusAction = useCallback(async () => {
    if (!reservation || !propertyId || !confirmDialog.action) return

    try {
      setLoading(true)
      setError('')

      let updated: Reservation
      switch (confirmDialog.action) {
        case 'confirm':
          updated = await confirmReservation(propertyId, reservation.id, guaranteeInput ? { guarantee_type: guaranteeInput } : {})
          break
        case 'cancel':
          updated = await cancelReservation(propertyId, reservation.id)
          break
        default:
          return
      }

      setConfirmDialog({ action: null, isOpen: false })
      setGuaranteeInput('')
      if (onSaved) onSaved()
      onClose()
    } catch (err: any) {
      setError(err.message || 'Erro ao executar ação')
    } finally {
      setLoading(false)
    }
  },
    [reservation, propertyId, confirmDialog.action, guaranteeInput, onSaved, onClose]
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

  // Calculate minibar total
  const minibarTotal = localConsumptions.reduce((sum, consumption) => {
    const product = minibarProducts.find((p) => p.id === consumption.product_id)
    const unitPrice = product ? (product.price || product.price_per_unit || 0) : (consumption.unit_price || 0)
    const total = unitPrice * consumption.quantity
    return sum + total
  }, 0)

  const totalWithMinibar = (priceOverride ? parseFloat(priceOverride) : calcTotal) + minibarTotal

  return (
    <>
      {/* Confirmation Dialog for Guarantee Type */}
      <Modal
        isOpen={confirmDialog.isOpen && confirmDialog.action === 'confirm'}
        onClose={() => {
          setConfirmDialog({ action: null, isOpen: false })
          setGuaranteeInput('')
        }}
        title="Confirmar Reserva"
      >
        <div className="confirm-dialog-content">
          <p className="confirm-dialog-guarantee-text">
            Selecione o tipo de garantia ou deixe em branco:
          </p>
          <div className="confirm-dialog-guarantee-buttons">
            <button
              type="button"
              onClick={() => setGuaranteeInput('card')}
              className={`confirm-dialog-guarantee-button ${guaranteeInput === 'card' ? 'active' : ''}`}
            >
              Cartão
            </button>
            <button
              type="button"
              onClick={() => setGuaranteeInput('prepay')}
              className={`confirm-dialog-guarantee-button ${guaranteeInput === 'prepay' ? 'active' : ''}`}
            >
              Pré-pago
            </button>
            <button
              type="button"
              onClick={() => setGuaranteeInput('')}
              className={`confirm-dialog-guarantee-button ${guaranteeInput === '' ? 'active' : ''}`}
            >
              Nenhuma
            </button>
          </div>

          <div className="confirm-dialog-actions">
            <button
              type="button"
              onClick={() => {
                setConfirmDialog({ action: null, isOpen: false })
                setGuaranteeInput('')
              }}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={executeStatusAction}
              className="btn btn-success"
              disabled={loading}
            >
              {loading ? 'Processando...' : 'Confirmar'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Cancellation Modal with Refund Preview */}
      {reservation && (
        <ReservationCancellationModal
          isOpen={showCancellationModal}
          onClose={() => setShowCancellationModal(false)}
          onConfirm={() => {
            setShowCancellationModal(false)
            if (onSaved) onSaved()
            onClose()
          }}
          reservation={{
            id: reservation.id,
            guest_name: reservation.guest_name,
            check_in_date: reservation.start_date,
            check_out_date: reservation.end_date,
            total_price: reservation.price_override || calcTotal,
            status: reservation.status,
          }}
        />
      )}

      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={isEditing ? 'Editar Reserva' : 'Nova Reserva'}
      >
      <div className="reservation-modal-content" aria-busy={initialLoading || calcLoading}>
        {/* Status row with indicator and action buttons (edit mode only) */}
        {isEditing && (
          <div className="reservation-modal-header">
            <div className="reservation-modal-header__status-section">
              <div
                className={`status-badge status-${formData.status}`}
              >
                {STATUS_LABELS[formData.status] || formData.status}
              </div>
              {reservation?.guarantee_type && (
                <div
                  className="reservation-modal-guarantee-badge"
                  title={`Garantia: ${reservation.guarantee_type}`}
                >
                  {reservation.guarantee_type}
                </div>
              )}
            </div>

            {/* Status transition buttons */}
            <div className="reservation-modal-header__actions">
              {formData.status === 'pre-reserva' && (
                <>
                  <button
                    type="button"
                    onClick={() => handleStatusAction('confirm')}
                    className="btn btn-sm btn-success"
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
                    className="btn btn-sm btn-success"
                    disabled={loading}
                  >
                    Confirmar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusAction('checkin')}
                    className="btn btn-sm btn-purple"
                    disabled={loading}
                  >
                    Check-in
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusAction('cancel')}
                    className="btn btn-sm btn-danger"
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
                  className="btn btn-sm btn-purple"
                  disabled={loading}
                >
                  Check-in
                </button>
              )}
              {formData.status === 'checked_in' && (
                <button
                  type="button"
                  onClick={() => handleStatusAction('checkout')}
                  className="btn btn-sm btn-warning"
                  disabled={loading}
                >
                  Check-out
                </button>
              )}
            </div>

            {/* Minibar toggle button (edit mode only) */}
            {isEditing && minibarProducts.length > 0 && (
              <button
                type="button"
                onClick={() => setShowMinibar(!showMinibar)}
                className="btn btn-sm btn-warning ml-auto"
                disabled={loading}
              >
                {showMinibar ? 'Ocultar Frigobar' : 'Mostrar Frigobar'}
              </button>
            )}
          </div>
        )}

        {/* Minibar Panel */}
        {isEditing && showMinibar && minibarProducts.length > 0 && (
          <div className="reservation-modal-minibar-panel">
            <MinibarPanel
              products={minibarProducts}
              reservationId={reservation?.id || null}
              onConsumptionCreated={(consumption) => {
                setLocalConsumptions((prev) => [consumption, ...prev])
              }}
              onConsumptionDeleted={(consumptionId) => {
                setLocalConsumptions((prev) => prev.filter((c) => c.id !== consumptionId))
              }}
              onProductsChange={setMinibarProducts}
            />
          </div>
        )}

        {error && (
          <div
            className="reservation-modal-error"
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
            <div className="form-grid form-grid--3col">
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
            <div className="form-grid form-grid--2col">
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

            {/* Partner and Notes - 2 column layout */}
            <div className="form-grid form-grid--2col">
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
                  className="form-textarea"
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
                </select>
              </FormField>
            )}

            {/* Summary Panel - Values Breakdown */}
            <div className="reservation-modal-price-summary">
              {/* Hospedagem Breakdown */}
              <div className="reservation-modal-section">
                <div className="reservation-modal-section__title">
                  HOSPEDAGEM
                </div>
                <div className="reservation-modal-days-breakdown">
                  {daysBreakdown.length > 0 ? (
                    daysBreakdown.map((day, idx) => (
                      <span key={idx} className="reservation-modal-days-breakdown__day">
                        {format(parseISO(day.date), 'dd/MM')}:{' '}
                        <span className="reservation-modal-days-breakdown__price">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          }).format(day.price)}
                        </span>
                        {idx < daysBreakdown.length - 1 && ' |'}
                      </span>
                    ))
                  ) : (
                    <span className="reservation-modal-days-breakdown__placeholder">Selecione as datas</span>
                  )}
                </div>
                <div className="reservation-modal-subtotal-row">
                  <div className="reservation-modal-subtotal-row__label">
                    Subtotal Hospedagem:{' '}
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(priceOverride ? parseFloat(priceOverride) : calcTotal)}
                  </div>

                  {/* Manual price control */}
                  <div className="reservation-modal-manual-price">
                    {showManualPrice && (
                      <>
                        <input
                          type="number"
                          step="0.01"
                          value={priceOverride || ''}
                          onChange={(e) => setPriceOverride(e.target.value)}
                          placeholder={calcTotal.toFixed(2)}
                          className="reservation-modal-manual-price__input"
                          disabled={loading || calcLoading}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setPriceOverride(null)
                            setShowManualPrice(false)
                          }}
                          className="btn btn-xs btn-danger"
                          disabled={loading || calcLoading}
                        >
                          Cancelar
                        </button>
                      </>
                    )}
                    {!showManualPrice && (
                      <button
                        type="button"
                        onClick={() => setShowManualPrice(true)}
                        className="btn btn-xs btn-secondary"
                        disabled={loading || calcLoading}
                      >
                        Valor Manual
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Frigobar */}
              {minibarTotal > 0 && (
                <div className="reservation-modal-section reservation-modal-section--frigobar">
                  <div className="reservation-modal-section__title">
                    FRIGOBAR
                  </div>
                  <div className="reservation-modal-section__quantity">
                    {localConsumptions.reduce((sum, c) => sum + c.quantity, 0)} item{localConsumptions.reduce((sum, c) => sum + c.quantity, 0) !== 1 ? 'ns' : ''}
                  </div>
                  <div className="reservation-modal-subtotal-row__label">
                    Subtotal Frigobar:{' '}
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(minibarTotal)}
                  </div>
                </div>
              )}

              {/* Total */}
              <div className="reservation-modal-total-row">
                <span className="reservation-modal-total-row__label">TOTAL:</span>
                <span className="reservation-modal-total-row__amount">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(totalWithMinibar)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="reservation-modal-actions">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
                disabled={loading || calcLoading}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="btn btn-primary"
                disabled={loading || calcLoading || Object.keys(fieldErrors).length > 0}
              >
                {loading ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
    </>
  )
}

