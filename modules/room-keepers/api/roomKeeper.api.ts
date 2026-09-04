// ─────────────────────────────────────────
// ROOM KEEPER SERVICE
// ─────────────────────────────────────────

import { apiClient } from '@/lib'
import { API_ENDPOINTS } from '@/constants'
import type {
  ApiResponse,
  PaginatedResponse,
  RoomKeeper,
  RoomKeeperQueryParams,
} from '@/types'

export const roomKeeperService = {
  getAll: (params?: RoomKeeperQueryParams) =>
    apiClient
      .get<PaginatedResponse<RoomKeeper>>(API_ENDPOINTS.ROOM_KEEPERS.BASE, { params })
      .then((r) => r.data),

  getById: (id: number) =>
    apiClient
      .get<ApiResponse<RoomKeeper>>(API_ENDPOINTS.ROOM_KEEPERS.BY_ID(id))
      .then((r) => r.data),
}
