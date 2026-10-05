'use client'

import { useEffect, useState } from 'react'
import { Timer } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardHeader } from '@/components/common'
import { AppButton, InputNumber } from '@/components/ui-custom'
import { getErrorMessage } from '@/lib'
import { useSetting, useUpsertSetting } from '@/hooks'

// ─────────────────────────────────────────
// PENGATURAN: WAKTU MULAI LEBIH AWAL
// Berapa menit sebelum jadwal sebuah booking yang sudah disetujui boleh
// dimulai - dibedakan SPD / Non-SPD (kendaraan) dan ruangan. Backend yang
// menegakkan batasnya (0 - 1440 menit).
// ─────────────────────────────────────────

const MAX_MINUTES = 24 * 60

const FIELDS = [
  { key: 'booking_start_early_minutes_spd', label: 'Kendaraan SPD' },
  { key: 'booking_start_early_minutes_non_spd', label: 'Kendaraan Non-SPD' },
  { key: 'booking_start_early_minutes_room', label: 'Ruangan' },
] as const

const formatMinutes = (m?: number) => {
  if (m == null) return ''
  if (m === 0) return 'tepat di jam mulai'
  const h = Math.floor(m / 60)
  const rest = m % 60
  return [h ? `${h} jam` : '', rest ? `${rest} menit` : ''].filter(Boolean).join(' ') + ' lebih awal'
}

const clamp = (v?: number) => (v == null || Number.isNaN(v) ? undefined : Math.min(MAX_MINUTES, Math.max(0, Math.round(v))))

const EarlyStartField = ({
  settingKey,
  label,
  value,
  onChange,
}: {
  settingKey: string
  label: string
  value?: number
  onChange: (v?: number) => void
}) => {
  const { data } = useSetting(settingKey)
  useEffect(() => {
    if (data?.value != null) onChange(clamp(Number(data.value)))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  return (
    <div>
      <InputNumber label={`${label} (menit)`} min={0} max={MAX_MINUTES} value={value ?? ''} onChange={onChange} />
      <p className="mt-1 text-xs text-[var(--text-secondary)]">{formatMinutes(value)}</p>
    </div>
  )
}

export const BookingStartSettings = () => {
  const upsert = useUpsertSetting()
  const [values, setValues] = useState<Record<string, number | undefined>>({})

  const complete = FIELDS.every((f) => values[f.key] != null)

  const save = async () => {
    if (!complete) return
    try {
      for (const f of FIELDS) {
        await upsert.mutateAsync({ key: f.key, value: String(clamp(values[f.key])) })
      }
      toast.success('Waktu mulai lebih awal disimpan')
    } catch (e) {
      toast.error(getErrorMessage(e))
    }
  }

  return (
    <Card>
      <CardHeader
        title="Waktu Mulai Lebih Awal"
        description="Berapa menit sebelum jadwal booking yang sudah disetujui boleh dimulai"
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {FIELDS.map((f) => (
          <EarlyStartField
            key={f.key}
            settingKey={f.key}
            label={f.label}
            value={values[f.key]}
            onChange={(v) => setValues((s) => ({ ...s, [f.key]: v }))}
          />
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <AppButton
          leftIcon={<Timer className="h-4 w-4" />}
          loading={upsert.isPending}
          disabled={!complete || upsert.isPending}
          onClick={save}
        >
          Simpan
        </AppButton>
        <p className="text-xs text-[var(--text-secondary)]">
          0 = baru bisa dimulai tepat di jam mulai. Maksimal {MAX_MINUTES} menit (24 jam).
        </p>
      </div>
    </Card>
  )
}
