// ─────────────────────────────────────────
// USER HOOKS
// ─────────────────────────────────────────

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants'
import { userService } from '@/services'
import type { CreateUserPayload, UpdateUserPayload, UserQueryParams } from '@/types'

// ── Queries ──────────────────────────────

export const useUsers = (params?: UserQueryParams) =>
  useQuery({
    queryKey: [...QUERY_KEYS.USERS, params],
    queryFn:  () => userService.getAll(params).then((r) => r.data),
  })

export const useUser = (id: number) =>
  useQuery({
    queryKey: [...QUERY_KEYS.USERS, id],
    queryFn:  () => userService.getById(id).then((r) => r.data),
    enabled:  !!id,
  })

export const useUserRoles = () =>
  useQuery({
    queryKey: QUERY_KEYS.USER_ROLES,
    queryFn:  () => userService.getRoles().then((r) => r.data),
    staleTime: Infinity, // roles jarang berubah
  })

export const useUserDepartments = () =>
  useQuery({
    queryKey: QUERY_KEYS.USER_DEPARTMENTS,
    queryFn:  () => userService.getDepartments().then((r) => r.data),
    staleTime: Infinity,
  })

// ── Mutations ────────────────────────────

export const useCreateUser = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateUserPayload) => userService.create(payload),
    onSuccess:  () => qc.invalidateQueries({ queryKey: QUERY_KEYS.USERS }),
  })
}

export const useUpdateUser = (id: number) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateUserPayload) => userService.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.USERS })
      qc.invalidateQueries({ queryKey: [...QUERY_KEYS.USERS, id] })
    },
  })
}

export const useToggleUserActive = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => userService.toggleActive(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: QUERY_KEYS.USERS }),
  })
}

export const useDeleteUser = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => userService.delete(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: QUERY_KEYS.USERS }),
  })
}

export const useUpdateUserPhoto = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) =>
      userService.updatePhotoById(id, file),
    onSuccess: (_data, { id }) =>
      qc.invalidateQueries({ queryKey: [...QUERY_KEYS.USERS, id] }),
  })
}
