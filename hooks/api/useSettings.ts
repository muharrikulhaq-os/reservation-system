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

// ── Fuel prices ──────────────────────────

export const useFuelPrices = () =>
  useQuery({
    queryKey: QUERY_KEYS.FUEL_PRICES,
    queryFn:  () => settingService.getFuelPrices().then((r) => r.data),
    staleTime: Infinity, // harga jarang berubah
  })

export const useUpsertFuelPrice = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ grade, price }: { grade: string; price: number }) =>
      settingService.upsertFuelPrice(grade, price),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.FUEL_PRICES })
      qc.invalidateQueries({ queryKey: QUERY_KEYS.MASTER_SETTINGS })
    },
  })
}
