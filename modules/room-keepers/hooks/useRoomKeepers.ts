// ─────────────────────────────────────────
// ROOM KEEPER HOOKS
// ─────────────────────────────────────────

import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants'
import { roomKeeperService } from '../api/roomKeeper.api'
import type { RoomKeeperQueryParams } from '@/types'

export const useRoomKeepers = (params?: RoomKeeperQueryParams) =>
  useQuery({
    queryKey: [...QUERY_KEYS.ROOM_KEEPERS, params],
    queryFn:  () => roomKeeperService.getAll(params).then((r) => r.data),
  })

export const useRoomKeeper = (id: number, options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: [...QUERY_KEYS.ROOM_KEEPERS, id],
    queryFn:  () => roomKeeperService.getById(id).then((r) => r.data),
    enabled:  !!id && (options?.enabled ?? true),
  })
