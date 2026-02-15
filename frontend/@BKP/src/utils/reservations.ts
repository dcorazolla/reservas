import type { Reservation } from "@typings/calendar";

export function isDateInReservation(date: string, reservation: Reservation) {
  return date >= reservation.start_date && date < reservation.end_date;
}

export function isReservationStart(date: string, reservation: Reservation) {
  return date === reservation.start_date;
}

export function getReservationLength(reservation: Reservation) {
  const start = new Date(reservation.start_date);
  const end = new Date(reservation.end_date);
  return Math.ceil(
    (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );
}
