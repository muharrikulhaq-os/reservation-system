'use client'

import { useEffect, useState } from 'react'
import { Users } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardHeader } from '@/components/common'
import { AppButton } from '@/components/ui-custom'
import { getErrorMessage } from '@/lib'
import { useSetting, useUpsertSetting } from '@/hooks'
import { ToggleRow } from './OvertimeSettings'

// ─────────────────────────────────────────
// PENGATURAN: UBAH PENUMPANG SETELAH DISETUJUI
// Karyawan/tamu yang ikut booking kendaraan selalu bisa diubah selama
// booking menunggu persetujuan. Setelah disetujui: tergantung sakelar ini
// (0 = terkunci, 1 = boleh sampai perjalanan dimulai). Backend yang menegakkan.
// ─────────────────────────────────────────

const KEY = 'booking_passenger_edit_after_approval'

export const PassengerEditSettings = () => {
  const upsert = useUpsertSetting()
  const { data } = useSetting(KEY)
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    if (data?.value != null) setAllowed(Number(data.value) >= 1)
  }, [data])

  const save = async () => {
    try {
      await upsert.mutateAsync({ key: KEY, value: allowed ? '1' : '0' })
      toast.success('Pengaturan penumpang disimpan')
    } catch (e) {
      toast.error(getErrorMessage(e))
    }
  }

  return (
    <Card>
      <CardHeader
        title="Penumpang Booking"
        description="Karyawan & tamu yang ikut booking kendaraan"
      />
      <ToggleRow
        title="Boleh ubah penumpang setelah disetujui"
        description={
          allowed
            ? 'Aktif = pemesan & admin masih bisa mengubah penumpang setelah disetujui, sampai perjalanan dimulai.'
            : 'Nonaktif = penumpang hanya bisa diubah selama booking menunggu persetujuan.'
        }
        checked={allowed}
        onChange={setAllowed}
      />
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <AppButton
          leftIcon={<Users className="h-4 w-4" />}
          loading={upsert.isPending}
          disabled={data == null || upsert.isPending}
          onClick={save}
        >
          Simpan
        </AppButton>
        <p className="text-xs text-[var(--text-secondary)]">
          Total penumpang tetap dibatasi kapasitas kendaraan.
        </p>
      </div>
    </Card>
  )
}
