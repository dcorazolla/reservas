/**
 * Reservation Domain Models
 * Types and interfaces for reservations, rooms, and calendar data
 */

/**
 * Reservation Status - 8 possible states
 * Transitions: pre-reserva → reservado → confirmado → checked_in → checked_out
 * Alternative paths: no_show, cancelado, blocked
 */
export enum ReservationStatus {
  PRE_RESERVA = 'pre-reserva',
  RESERVADO = 'reservado',
  CONFIRMADO = 'confirmado',
  CHECKED_IN = 'checked_in',
  CHECKED_OUT = 'checked_out',
  NO_SHOW = 'no_show',
  CANCELADO = 'cancelado',
  BLOCKED = 'blocked',
}

/**
 * Payment Status for a reservation
 */
export enum PaymentStatus {
  OPEN = 'open',
  PARTIALLY_PAID = 'partially_paid',
  PAID = 'paid',
}

/**
 * Guarantee Type for reservations
 */
export enum GuaranteeType {
  CREDIT_CARD = 'credit_card',
  BANK_TRANSFER = 'bank_transfer',
  DEPOSIT = 'deposit',
  NONE = 'none',
}

/**
 * Core Reservation entity
 */
export interface Reservation {
  id: string // UUID
  room_id: string // UUID
  property_id: string // UUID
  guest_name: string
  email?: string
  phone?: string
  
  // Guest composition
  adults_count: number // >= 1
  children_count: number // >= 0
  infants_count: number // >= 0
  
  // Dates
  start_date: string // YYYY-MM-DD
  end_date: string // YYYY-MM-DD
  
  // Status and payment
  status: ReservationStatus
  payment_status?: PaymentStatus
  
  // Pricing
  total_value?: number // calculated or overridden
  price_override?: number | null // manual price override (audited)
  
  // Additional info
  notes?: string
  guarantee_type?: GuaranteeType | null
  guarantee_at?: string | null // timestamp when guarantee expires
  
  // Partner association
  partner_id?: string | null // UUID of partner
  partner_name?: string | null // Partner name (denormalized)
  
  // Metadata
  created_at?: string
  updated_at?: string
}

/**
 * Room entity with reservations
 * Used in calendar grid context
 */
export interface Room {
  id: string // UUID
  property_id: string // UUID
  name: string
  capacity: number // max people
  reservations: Reservation[]
  room_blocks?: RoomBlock[]
}

/**
 * Room Block - blocking a room for maintenance or other reasons
 */
export interface RoomBlock {
  id: string // UUID
  room_id: string // UUID
  property_id: string // UUID
  start_date: string // YYYY-MM-DD
  end_date: string // YYYY-MM-DD
  reason?: string // "maintenance", "cleaning", etc
  created_at?: string
  updated_at?: string
}

/**
 * Calendar Grid Response
 * Complete data for rendering calendar view
 */
export interface CalendarResponse {
  start: string // YYYY-MM-DD
  end: string // YYYY-MM-DD
  rooms: Room[]
}

/**
 * Reservation List Response
 * Pagininated list of reservations
 */
export interface ReservationListResponse {
  data: Reservation[]
  total: number
  per_page: number
  current_page: number
  last_page: number
  from: number
  to: number
}

/**
 * Price Calculation Result
 * Returned by /api/reservations/calculate-detailed
 */
export interface ReservationPriceCalculation {
  total: number
  days: Array<{
    date: string // YYYY-MM-DD
    price: number
    source: string // "room_period" | "category_period" | "room_base" | "category_base" | "property_base"
  }>
}

/**
 * Filters for reservation list page
 */
export interface ReservationFilters {
  month?: number // 1-12
  year?: number
  guest_name?: string
  contact?: string // search email or phone
  partner_id?: string | null
  status?: ReservationStatus[]
  sort?: string
  order?: 'asc' | 'desc'
  page?: number
  per_page?: number
}

/**
 * Status color mapping for UI
 */
export const STATUS_COLORS: Record<ReservationStatus, string> = {
  [ReservationStatus.PRE_RESERVA]: '#fbbf24', // Âmbar
  [ReservationStatus.RESERVADO]: '#60a5fa', // Azul
  [ReservationStatus.CONFIRMADO]: '#34d399', // Verde
  [ReservationStatus.CHECKED_IN]: '#a78bfa', // Roxo
  [ReservationStatus.CHECKED_OUT]: '#fb923c', // Laranja
  [ReservationStatus.NO_SHOW]: '#ef4444', // Vermelho
  [ReservationStatus.CANCELADO]: '#9ca3af', // Cinza
  [ReservationStatus.BLOCKED]: '#1f2937', // Preto
}

/**
 * Status labels for display
 */
export const STATUS_LABELS: Record<ReservationStatus, string> = {
  [ReservationStatus.PRE_RESERVA]: 'Pre-reserva',
  [ReservationStatus.RESERVADO]: 'Reservado',
  [ReservationStatus.CONFIRMADO]: 'Confirmado',
  [ReservationStatus.CHECKED_IN]: 'Hospedado',
  [ReservationStatus.CHECKED_OUT]: 'Checkout',
  [ReservationStatus.NO_SHOW]: 'Não compareceu',
  [ReservationStatus.CANCELADO]: 'Cancelado',
  [ReservationStatus.BLOCKED]: 'Bloqueado',
}

/**
 * Responsive breakpoints for calendar days display
 */
export const CALENDAR_BREAKPOINTS = {
  MOBILE: {
    breakpoint: 600,
    min_days: 5,
    max_days: 10,
    default_days: 7,
    half_cell_width: 30,
  },
  TABLET: {
    breakpoint: 1024,
    min_days: 10,
    max_days: 15,
    default_days: 12,
    half_cell_width: 35,
  },
  DESKTOP: {
    breakpoint: Infinity,
    min_days: 15,
    max_days: 35,
    default_days: 21,
    half_cell_width: 40,
  },
}

/**
 * Helper to get days configuration based on viewport width
 */
export function getCalendarConfig(viewportWidth: number) {
  if (viewportWidth < CALENDAR_BREAKPOINTS.MOBILE.breakpoint) {
    return CALENDAR_BREAKPOINTS.MOBILE
  }
  if (viewportWidth < CALENDAR_BREAKPOINTS.TABLET.breakpoint) {
    return CALENDAR_BREAKPOINTS.TABLET
  }
  return CALENDAR_BREAKPOINTS.DESKTOP
}

/**
 * Helper to validate reservation date range
 */
export function isValidReservationDates(startDate: string, endDate: string): boolean {
  const start = new Date(startDate)
  const end = new Date(endDate)
  return start < end
}

/**
 * Helper to calculate length of stay in days
 */
export function getStayLength(startDate: string, endDate: string): number {
  const start = new Date(startDate)
  const end = new Date(endDate)
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
}

/**
 * Helper to check if a date is within a reservation
 */
export function isDateInReservation(date: string, reservation: Reservation): boolean {
  return date >= reservation.start_date && date < reservation.end_date
}

/**
 * Helper to canonicalize status strings (handles variations from backend)
 */
export function canonicalizeStatus(status: unknown): ReservationStatus {
  if (!status) return ReservationStatus.PRE_RESERVA

  const str = String(status).toLowerCase().trim()

  const statusMap: Record<string, ReservationStatus> = {
    'pre-reserva': ReservationStatus.PRE_RESERVA,
    'pre_reserva': ReservationStatus.PRE_RESERVA,
    'tentative': ReservationStatus.PRE_RESERVA,
    'tentativa': ReservationStatus.PRE_RESERVA,

    'reservado': ReservationStatus.RESERVADO,
    'reserved': ReservationStatus.RESERVADO,
    'booked': ReservationStatus.RESERVADO,

    'confirmed': ReservationStatus.CONFIRMADO,
    'confirmado': ReservationStatus.CONFIRMADO,
    'guaranteed': ReservationStatus.CONFIRMADO,

    'checked_in': ReservationStatus.CHECKED_IN,
    'checked-in': ReservationStatus.CHECKED_IN,
    'checkin': ReservationStatus.CHECKED_IN,
    'in-house': ReservationStatus.CHECKED_IN,
    'in_house': ReservationStatus.CHECKED_IN,
    'inhospedado': ReservationStatus.CHECKED_IN,

    'checked_out': ReservationStatus.CHECKED_OUT,
    'checked-out': ReservationStatus.CHECKED_OUT,
    'checkout': ReservationStatus.CHECKED_OUT,
    'departed': ReservationStatus.CHECKED_OUT,

    'no_show': ReservationStatus.NO_SHOW,
    'no-show': ReservationStatus.NO_SHOW,
    'noshow': ReservationStatus.NO_SHOW,
    'no show': ReservationStatus.NO_SHOW,

    'cancelado': ReservationStatus.CANCELADO,
    'canceled': ReservationStatus.CANCELADO,
    'cancelled': ReservationStatus.CANCELADO,

    'blocked': ReservationStatus.BLOCKED,
    'block': ReservationStatus.BLOCKED,
    'bloqueado': ReservationStatus.BLOCKED,
    'manutencao': ReservationStatus.BLOCKED,
    'manutenção': ReservationStatus.BLOCKED,
  }

  return statusMap[str] || ReservationStatus.PRE_RESERVA
}
