export type ReservationStatus =
  | "pre-reserva"
  | "reservado"
  | "cancelado";

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
  status: "pre-reserva" | "reservado" | "cancelado";
  total_value?: number;
  notes?: string;
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
