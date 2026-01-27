export type ReservationStatus =
  | "pre-reserva"
  | "reservado"
  | "cancelado";

export type Reservation = {
  id: number;
  room_id: number;
  guest_name: string;
  people_count: number;
  start_date: string;
  end_date: string;
  status: "pre-reserva" | "reservado" | "cancelado";
  total_value?: number;
  notes?: string;
};

export type Room = {
  id: number;
  name: string;
  capacity: number;
  reservations: Reservation[];
};

export type CalendarResponse = {
  start: string;
  end: string;
  rooms: Room[];
};
