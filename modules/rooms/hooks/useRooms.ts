// ─────────────────────────────────────────
// ROOM HOOKS
// ─────────────────────────────────────────

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants'
import { roomService } from '../api/room.api'
import type {
  RoomQueryParams,
  CreateRoomPayload,
  UpdateRoomPayload,
  UpdateRoomStatusPayload,
  CreateAttachmentPayload,
} from '@/types'

// ── Queries ──────────────────────────────

export const useRooms = (params?: RoomQueryParams) =>
  useQuery({
    queryKey: [...QUERY_KEYS.ROOMS, params],
    queryFn:  () => roomService.getAll(params).then((r) => r.data),
  })

// Varian dengan PaginatedResponse penuh (data + pagination) untuk picker/list
export const useRoomsPaginated = (
  params?: RoomQueryParams,
  options?: { enabled?: boolean },
) =>
  useQuery({
    queryKey: [...QUERY_KEYS.ROOMS, 'paginated', params],
    queryFn:  () => roomService.getAll(params),
    enabled:  options?.enabled ?? true,
    // Tahan data halaman sebelumnya saat pindah halaman -
    // tanpa ini pager ikut hilang tiap kali refetch.
    placeholderData: keepPreviousData,
  })

export const useRoom = (id: number) =>
  useQuery({
    queryKey: [...QUERY_KEYS.ROOMS, id],
    queryFn:  () => roomService.getById(id).then((r) => r.data),
    enabled:  !!id,
  })

export const useRoomAttachments = (roomId: number) =>
  useQuery({
    queryKey: [...QUERY_KEYS.ROOMS, roomId, 'attachments'],
    queryFn:  () => roomService.getAttachments(roomId).then((r) => r.data),
    enabled:  !!roomId,
  })

// ── Mutations ────────────────────────────

export const useCreateRoom = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateRoomPayload) => roomService.create(payload),
    onSuccess:  () => qc.invalidateQueries({ queryKey: QUERY_KEYS.ROOMS }),
  })
}

export const useUpdateRoom = (id: number) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateRoomPayload) => roomService.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.ROOMS })
      qc.invalidateQueries({ queryKey: [...QUERY_KEYS.ROOMS, id] })
    },
  })
}

export const useUpdateRoomStatus = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateRoomStatusPayload }) =>
      roomService.updateStatus(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.ROOMS }),
  })
}

export const useUpdateRoomPhoto = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) =>
      roomService.updatePhoto(id, file),
    onSuccess: (_data, { id }) =>
      qc.invalidateQueries({ queryKey: [...QUERY_KEYS.ROOMS, id] }),
  })
}

export const useDeleteRoom = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => roomService.delete(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: QUERY_KEYS.ROOMS }),
  })
}

export const useUploadRoomAttachment = (roomId: number) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateAttachmentPayload) =>
      roomService.uploadAttachment(roomId, payload),
    onSuccess: () =>
      qc.invalidateQueries({
        queryKey: [...QUERY_KEYS.ROOMS, roomId, 'attachments'],
      }),
  })
}
