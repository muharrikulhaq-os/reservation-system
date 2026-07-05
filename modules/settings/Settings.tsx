'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { Card, CardHeader } from '@/components/common'
import { PageHeader } from '@/components/shared'
import { AppButton, InputRupiah } from '@/components/ui-custom'
import { getErrorMessage } from '@/lib'
import { FUEL_GRADE_CONFIG, BBM_GRADES, EV_GRADES } from '@/constants'
import type { FuelGrade } from '@/types'
import { useFuelPrices, useUpsertFuelPrice } from '@/hooks'

const ALL_GRADES: FuelGrade[] = [...BBM_GRADES, ...EV_GRADES]

type PriceMap = Partial<Record<FuelGrade, number | undefined>>

export const Settings = () => {
  const { data: fuelPrices, isLoading } = useFuelPrices()
  const upsert = useUpsertFuelPrice()

  const [prices, setPrices] = useState<PriceMap>({})
  const [original, setOriginal] = useState<PriceMap>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Seed dari master setting saat data siap
  useEffect(() => {
    if (!fuelPrices) return
    const map: PriceMap = {}
    fuelPrices.forEach((p) => {
      map[p.grade] = p.pricePerUnit
    })
    setPrices(map)
    setOriginal(map)
  }, [fuelPrices])

  const updatePrice = (grade: FuelGrade, value: number | undefined) => {
    setPrices((prev) => ({ ...prev, [grade]: value }))
    setSaved(false)
  }

  const hasChanges = ALL_GRADES.some((g) => prices[g] !== original[g])

  const handleSaveAll = async () => {
    setSaving(true)
    setSaved(false)
    try {
      const changed = ALL_GRADES.filter(
        (g) => prices[g] !== original[g] && prices[g] != null,
      )
      await Promise.all(
        changed.map((g) => upsert.mutateAsync({ grade: g, price: prices[g]! })),
      )
      setOriginal({ ...prices })
      setSaved(true)
    } finally {
      setSaving(false)
    }
  }

  const PriceRow = ({ grade, unit }: { grade: FuelGrade; unit: string }) => {
    const cfg = FUEL_GRADE_CONFIG[grade]
    return (
      <div className="flex items-center gap-4">
        <div className="flex w-40 items-center gap-2">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: cfg.color }}
          />
          <span className="text-sm font-medium text-[var(--text-primary)]">
            {cfg.label}
          </span>
        </div>
        <div className="flex-1">
          <InputRupiah
            value={prices[grade]}
            onChange={(v) => updatePrice(grade, v)}
          />
        </div>
        <span className="w-16 text-xs text-[var(--text-secondary)]">/ {unit}</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Pengaturan Harga Bahan Bakar"
        description="Harga default yang muncul saat pencatatan pengisian"
      />

      <Card>
        <CardHeader
          title="Harga BBM & Listrik"
          description="Nilai ini otomatis mengisi form saat driver mencatat pengisian"
        />

        {isLoading ? (
          <p className="py-8 text-center text-sm text-[var(--text-secondary)]">
            Memuat…
          </p>
        ) : (
          <div className="space-y-3">
            {BBM_GRADES.map((grade) => (
              <PriceRow key={grade} grade={grade} unit="Liter" />
            ))}
            {EV_GRADES.map((grade) => (
              <PriceRow key={grade} grade={grade} unit="kWh" />
            ))}
          </div>
        )}

        {upsert.error && (
          <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{getErrorMessage(upsert.error)}</span>
          </div>
        )}

        {saved && !hasChanges && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>Perubahan tersimpan.</span>
          </div>
        )}

        <div className="mt-5">
          <AppButton
            onClick={handleSaveAll}
            loading={saving}
            disabled={!hasChanges || saving}
          >
            Simpan Perubahan
          </AppButton>
        </div>
      </Card>
    </div>
  )
}
