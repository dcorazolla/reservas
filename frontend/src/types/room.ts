import type { RoomCategory } from "./roomCategory";

export type Room = {
  id: string;
  number: string;
  name: string;
  beds: number;
  capacity: number;
  active: boolean;
  notes?: string;

  room_category_id?: string | null;
  category?: RoomCategory;
};
