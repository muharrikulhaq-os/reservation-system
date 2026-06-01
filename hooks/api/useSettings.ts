// ─────────────────────────────────────────
// MASTER SETTINGS HOOKS
// ─────────────────────────────────────────

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants'
import { settingService } from '@/services'
import type { UpdateSettingPayload } from '@/types'

export const useMasterSettings = () =>
  useQuery({
    queryKey: QUERY_KEYS.MASTER_SETTINGS,
    queryFn:  () => settingService.getAll().then((r) => r.data),
    staleTime: Infinity, // settings jarang berubah
  })

export const useMasterSetting = (key: string) =>
  useQuery({
    queryKey: [...QUERY_KEYS.MASTER_SETTINGS, key],
    queryFn:  () => settingService.getByKey(key).then((r) => r.data),
    enabled:  !!key,
    staleTime: Infinity,
  })

export const useUpsertSetting = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ key, payload }: { key: string; payload: UpdateSettingPayload }) =>
      settingService.upsert(key, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.MASTER_SETTINGS }),
  })
}
