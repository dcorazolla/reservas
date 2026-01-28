import { apiFetch } from "./client";
import type { CalendarResponse } from "../types/calendar";

export function fetchCalendar(start: string, end: string) {
  return apiFetch<CalendarResponse>(
    `/calendar?start=${start}&end=${end}`
  );
}
