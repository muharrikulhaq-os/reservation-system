// ─────────────────────────────────────────
// USER HOOKS
// ─────────────────────────────────────────

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants'
import { userApi } from '../api/user.api'
import type {
  CreateUserPayload,
  UpdateUserPayload,
  UserQueryParams,
} from '@/types'

// ── Queries ──────────────────────────────

// Mengembalikan PaginatedResponse penuh (data + pagination)
// agar halaman list bisa pakai meta pagination.
export const useUsers = (params?: UserQueryParams) =>
  useQuery({
    queryKey: [...QUERY_KEYS.USERS, params],
    queryFn:  () => userApi.getAll(params),
  })

export const useUser = (id: number) =>
  useQuery({
    queryKey: [...QUERY_KEYS.USERS, id],
    queryFn:  () => userApi.getById(id).then((r) => r.data),
    enabled:  !!id,
  })

export const useUserRoles = () =>
  useQuery({
    queryKey: QUERY_KEYS.USER_ROLES,
    queryFn:  () => userApi.getRoles().then((r) => r.data),
    staleTime: Infinity, // roles jarang berubah
  })

export const useUserDepartments = () =>
  useQuery({
    queryKey: QUERY_KEYS.USER_DEPARTMENTS,
    queryFn:  () => userApi.getDepartments().then((r) => r.data),
    staleTime: Infinity,
  })

// ── Mutations ────────────────────────────

export const useCreateUser = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateUserPayload) => userApi.create(payload),
    onSuccess:  () => qc.invalidateQueries({ queryKey: QUERY_KEYS.USERS }),
  })
}

export const useUpdateUser = (id: number) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateUserPayload) => userApi.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.USERS })
      qc.invalidateQueries({ queryKey: [...QUERY_KEYS.USERS, id] })
    },
  })
}

export const useToggleUserActive = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => userApi.toggleActive(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: QUERY_KEYS.USERS }),
  })
}

export const useDeleteUser = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => userApi.delete(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: QUERY_KEYS.USERS }),
  })
}

export const useUpdateUserPhoto = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) =>
      userApi.updatePhoto(id, file),
    onSuccess: (_data, { id }) =>
      qc.invalidateQueries({ queryKey: [...QUERY_KEYS.USERS, id] }),
  })
}
