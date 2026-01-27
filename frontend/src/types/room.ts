import { RoomCategory } from "./roomCategory";

export type Room = {
  id: number;
  number: string;
  name: string;
  beds: number;
  capacity: number;
  active: boolean;
  notes?: string;

  room_category_id?: number | null;
  category?: RoomCategory;
};
