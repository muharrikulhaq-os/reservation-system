// ─────────────────────────────────────────
// ROOMS MODULE — public API
// import { RoomsPage, useRooms } from '@/modules/rooms'
// ─────────────────────────────────────────

export { RoomsPage } from './Rooms'
export { RoomForm } from './components/RoomForm'
export { RoomDetail } from './components/RoomDetail'
export { RoomCreate } from './components/RoomCreate'
export { RoomEdit } from './components/RoomEdit'
export { roomColumns } from './utils/columns'
export { roomService } from './api/room.api'
export * from './hooks/useRooms'
