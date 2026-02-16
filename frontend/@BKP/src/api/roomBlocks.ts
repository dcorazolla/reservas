import { get, post, put, del } from './client';

export type RoomBlock = {
  id: string;
  room_id: string;
  start_date: string;
  end_date: string;
  reason?: string;
};

export function fetchRoomBlocks(start: string, end: string): Promise<RoomBlock[]> {
  return get(`/room-blocks?start=${start}&end=${end}`).catch((err) => {
    // In test environments or public pages we may be unauthenticated; return empty list instead of throwing
    if (err && (err.message === 'Unauthenticated.' || err.message === 'Unauthenticated')) {
      return [] as RoomBlock[];
    }
    throw err;
  });
}

export function createRoomBlock(body: Partial<RoomBlock>): Promise<RoomBlock> {
  return post(`/room-blocks`, body);
}

export function updateRoomBlock(id: string, body: Partial<RoomBlock>): Promise<RoomBlock> {
  return put(`/room-blocks/${id}`, body);
}

export function deleteRoomBlock(id: string): Promise<void> {
  return del(`/room-blocks/${id}`);
}
