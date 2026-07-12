// ─────────────────────────────────────────
// MASTER SETTINGS HOOKS
// ─────────────────────────────────────────

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants'
import { settingService } from '@/services'

export const useSettings = () =>
  useQuery({
    queryKey: QUERY_KEYS.SETTINGS,
    queryFn:  () => settingService.getAll().then((r) => r.data),
    staleTime: Infinity, // settings jarang berubah
  })

export const useSetting = (key: string) =>
  useQuery({
    queryKey: [...QUERY_KEYS.SETTINGS, key],
    queryFn:  () => settingService.getByKey(key).then((r) => r.data),
    enabled:  !!key,
    staleTime: Infinity,
  })

export const useUpsertSetting = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) =>
      settingService.upsert(key, value),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.SETTINGS }),
  })
}
