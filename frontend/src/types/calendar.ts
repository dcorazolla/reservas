export type ReservationStatus =
  | "pre-reserva"
  | "reservado"
  | "confirmado"
  | "checked_in"
  | "checked_out"
  | "no_show"
  | "cancelado"
  | "blocked";

export type Reservation = {
  id: string;
  room_id: string;
  guest_name: string;
  people_count: number;
  adults_count?: number;
  children_count?: number;
  infants_count?: number;
  start_date: string;
  end_date: string;
  status: "pre-reserva" | "reservado" | "confirmado" | "checked_in" | "checked_out" | "no_show" | "cancelado" | "blocked";
  total_value?: number;
  notes?: string;
  partner_id?: string | null;
  partner_name?: string | null;
  price_override?: number | null;
};

export type Room = {
  id: string;
  name: string;
  capacity: number;
  reservations: Reservation[];
};

export type CalendarResponse = {
  start: string;
  end: string;
  rooms: Room[];
};
