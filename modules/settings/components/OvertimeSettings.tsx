'use client'

import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardHeader } from '@/components/common'
import { AppButton, InputNumber } from '@/components/ui-custom'
import { Switch } from '@/components/ui/switch'
import { getErrorMessage } from '@/lib'
import { useSetting, useUpsertSetting } from '@/hooks'

// ─────────────────────────────────────────
// PENGATURAN: PERHITUNGAN LEMBUR SUPIR
// Jam akhir kerja = jadwal selesai booking. Lembur dicatat saat booking
// diselesaikan bila kendaraan kembali MELEBIHI ambang (jam) setelahnya —
// begitu terlewati, dihitung penuh sejak jadwal selesai. Backend yang
// menghitung & memvalidasi (ambang 0 - 24 jam, sakelar 0/1).
// ─────────────────────────────────────────

const KEYS = {
  thresholdNonSpd: 'overtime_threshold_hours_non_spd',
  spdEnabled: 'overtime_spd_enabled',
  spdSame: 'overtime_spd_same_as_non_spd',
  thresholdSpd: 'overtime_threshold_hours_spd',
} as const

const MAX_HOURS = 24

const clampHours = (v?: number) =>
  v == null || Number.isNaN(v) ? undefined : Math.min(MAX_HOURS, Math.max(0, Math.round(v * 100) / 100))

const describe = (h?: number) => {
  if (h == null) return ''
  if (h === 0) return 'Setiap keterlambatan dari jadwal selesai dihitung lembur.'
  const hours = Math.floor(h)
  const mins = Math.round((h - hours) * 60)
  const label = [hours ? `${hours} jam` : '', mins ? `${mins} menit` : ''].filter(Boolean).join(' ')
  return `Dihitung lembur bila kembali lebih dari ${label} setelah jadwal selesai (dihitung penuh sejak jadwal selesai).`
}

/** Nilai setting numerik; undefined selama belum termuat. */
const useNumberSetting = (key: string) => {
  const { data } = useSetting(key)
  return data?.value != null ? Number(data.value) : undefined
}

const ToggleRow = ({
  title,
  description,
  checked,
  onChange,
}: {
  title: string
  description: string
  checked: boolean
  onChange: (v: boolean) => void
}) => (
  <label className="flex cursor-pointer items-start justify-between gap-4 rounded-lg border border-[var(--border-divider)] bg-[var(--bg-subtle)] px-4 py-3">
    <span className="min-w-0">
      <span className="block text-sm font-medium text-[var(--text-primary)]">{title}</span>
      <span className="block text-xs text-[var(--text-secondary)]">{description}</span>
    </span>
    <Switch checked={checked} onCheckedChange={onChange} className="mt-0.5 shrink-0" />
  </label>
)

export const OvertimeSettings = () => {
  const upsert = useUpsertSetting()
  const savedNonSpd = useNumberSetting(KEYS.thresholdNonSpd)
  const savedSpdEnabled = useNumberSetting(KEYS.spdEnabled)
  const savedSpdSame = useNumberSetting(KEYS.spdSame)
  const savedSpd = useNumberSetting(KEYS.thresholdSpd)

  const [nonSpd, setNonSpd] = useState<number | undefined>()
  const [spdEnabled, setSpdEnabled] = useState(false)
  const [spdSame, setSpdSame] = useState(true)
  const [spd, setSpd] = useState<number | undefined>()

  // Isi form dari server (dan ulang saat data berubah lewat DataSync).
  useEffect(() => { if (savedNonSpd != null) setNonSpd(clampHours(savedNonSpd)) }, [savedNonSpd])
  useEffect(() => { if (savedSpdEnabled != null) setSpdEnabled(savedSpdEnabled >= 1) }, [savedSpdEnabled])
  useEffect(() => { if (savedSpdSame != null) setSpdSame(savedSpdSame >= 1) }, [savedSpdSame])
  useEffect(() => { if (savedSpd != null) setSpd(clampHours(savedSpd)) }, [savedSpd])

  const needsSpdThreshold = spdEnabled && !spdSame
  const complete = nonSpd != null && (!needsSpdThreshold || spd != null)

  const save = async () => {
    if (!complete) return
    const entries: [string, string][] = [
      [KEYS.thresholdNonSpd, String(clampHours(nonSpd))],
      [KEYS.spdEnabled, spdEnabled ? '1' : '0'],
      [KEYS.spdSame, spdSame ? '1' : '0'],
      [KEYS.thresholdSpd, String(clampHours(spd) ?? 0)],
    ]
    try {
      for (const [key, value] of entries) {
        await upsert.mutateAsync({ key, value })
      }
      toast.success('Pengaturan lembur disimpan')
    } catch (e) {
      toast.error(getErrorMessage(e))
    }
  }

  return (
    <Card>
      <CardHeader
        title="Perhitungan Lembur Supir"
        description="Jam akhir kerja mengikuti jadwal selesai booking kendaraan"
      />

      <div className="space-y-4">
        <div className="max-w-xs">
          <InputNumber
            label="Ambang lembur Non-SPD (jam)"
            min={0}
            max={MAX_HOURS}
            step={0.5}
            value={nonSpd ?? ''}
            onChange={setNonSpd}
          />
          <p className="mt-1 text-xs text-[var(--text-secondary)]">{describe(nonSpd)}</p>
        </div>

        <ToggleRow
          title="Hitung lembur untuk SPD"
          description="Nonaktif = perjalanan dinas (SPD) tidak pernah dihitung lembur."
          checked={spdEnabled}
          onChange={setSpdEnabled}
        />

        {spdEnabled && (
          <ToggleRow
            title="Lembur SPD sama dengan Non-SPD"
            description="Aktif = SPD memakai ambang Non-SPD di atas. Nonaktif = SPD punya ambang sendiri."
            checked={spdSame}
            onChange={setSpdSame}
          />
        )}

        {needsSpdThreshold && (
          <div className="max-w-xs">
            <InputNumber
              label="Ambang lembur SPD (jam)"
              min={0}
              max={MAX_HOURS}
              step={0.5}
              value={spd ?? ''}
              onChange={setSpd}
            />
            <p className="mt-1 text-xs text-[var(--text-secondary)]">{describe(spd)}</p>
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <AppButton
          leftIcon={<Clock className="h-4 w-4" />}
          loading={upsert.isPending}
          disabled={!complete || upsert.isPending}
          onClick={save}
        >
          Simpan
        </AppButton>
        <p className="text-xs text-[var(--text-secondary)]">
          Berlaku untuk booking yang diselesaikan setelah disimpan. Maksimal {MAX_HOURS} jam.
        </p>
      </div>
    </Card>
  )
}
