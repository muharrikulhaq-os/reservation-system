// ─────────────────────────────────────────
// ROOM KEEPER TYPES
// ─────────────────────────────────────────

// Shape dari GET /room-keepers & GET /room-keepers/:id
export interface RoomKeeper {
  id: number
  userId: number
  name: string
  employeeId: string
  email: string
  profilePhoto?: string | null
  phoneNumber: string
  isActive: boolean
  // Ruangan yang jadi tanggung jawab room keeper ini - bisa lebih dari satu.
  rooms: { id: number; name: string; location: string }[]
}

export interface RoomKeeperQueryParams {
  page?: number
  limit?: number
  isActive?: boolean
}

export interface SetRoomKeeperPayload {
  roomKeeperId: number | null
}
