'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, CalendarClock, Fuel, Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardHeader } from '@/components/common'
import { AppButton, InputNumber, InputText, InputTextArea } from '@/components/ui-custom'
import { getErrorMessage } from '@/lib'
import { useSetting, useUpsertSetting } from '@/hooks'
import type { FuelStation } from '@/types'
import { useDeleteFuelStation, useFuelStations, useSaveFuelStation } from '@/modules/fuel'
import { appConfirm } from '@/lib/dialog'
import { AppCheckbox } from '@/components/ui-custom/AppCheckbox'

// ─────────────────────────────────────────
// PENGATURAN: SPBU MITRA + MASA BERLAKU VOUCHER BBM
// ─────────────────────────────────────────

const VALIDITY_KEY = 'fuel_voucher_validity_days'

const StationFormModal = ({
  open,
  onOpenChange,
  station,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  station: FuelStation | null
}) => {
  const save = useSaveFuelStation()
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [contactPerson, setContactPerson] = useState('')
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    if (!open) return
    setName(station?.name ?? '')
    setAddress(station?.address ?? '')
    setPhone(station?.phone ?? '')
    setContactPerson(station?.contactPerson ?? '')
    setIsActive(station?.isActive ?? true)
    save.reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, station])

  const submit = async () => {
    try {
      await save.mutateAsync({
        id: station?.id,
        payload: { name: name.trim(), address, phone, contactPerson, isActive },
      })
      onOpenChange(false)
    } catch {
      // ditampilkan via save.error
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl p-6 shadow-[var(--shadow-modal)] sm:max-w-md">
        <DialogHeader>
          <DialogTitle
            className="text-lg font-bold text-[var(--text-primary)]"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            {station ? 'Ubah SPBU Mitra' : 'Tambah SPBU Mitra'}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-2 space-y-4">
          {save.error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{getErrorMessage(save.error)}</span>
            </div>
          )}
          <InputText label="Nama SPBU" required placeholder="mis. SPBU 34-12345 Cikarang" value={name} onChange={(e) => setName(e.target.value)} />
          <InputTextArea label="Alamat" rows={2} value={address} onChange={(e) => setAddress(e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <InputText label="Telepon" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <InputText label="Kontak" value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} />
          </div>
          <label className="flex items-center gap-2 text-sm text-[var(--text-primary)]">
            <AppCheckbox checked={isActive} onCheckedChange={setIsActive} />
            Aktif (bisa dipilih saat menerbitkan voucher)
          </label>
          <div className="flex gap-3 pt-1">
            <AppButton variant="secondary" fullWidth onClick={() => onOpenChange(false)}>
              Batal
            </AppButton>
            <AppButton fullWidth loading={save.isPending} disabled={!name.trim() || save.isPending} onClick={submit}>
              Simpan
            </AppButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

const VoucherValiditySetting = () => {
  const { data } = useSetting(VALIDITY_KEY)
  const upsert = useUpsertSetting()
  const [days, setDays] = useState<number | undefined>()

  useEffect(() => {
    if (data?.value != null) setDays(Math.max(1, Math.round(Number(data.value))))
  }, [data])

  const save = () => {
    if (!days || days < 1) return
    upsert.mutate(
      { key: VALIDITY_KEY, value: String(Math.min(31, Math.round(days))) },
      {
        onSuccess: () => toast.success('Masa berlaku voucher disimpan'),
        onError: (e) => toast.error(getErrorMessage(e)),
      },
    )
  }

  return (
    <Card>
      <CardHeader title="Masa Berlaku Voucher BBM" />
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-40">
          <InputNumber label="Hari" min={1} max={31} value={days ?? ''} onChange={setDays} />
        </div>
        <AppButton leftIcon={<CalendarClock className="h-4 w-4" />} loading={upsert.isPending} disabled={!days} onClick={save}>
          Simpan
        </AppButton>
        <p className="w-full text-xs text-[var(--text-secondary)]">
          1 = hanya berlaku di hari terbit (s.d. 23:59 WIB). Voucher yang tidak dikonfirmasi sampai batas
          ini otomatis kedaluwarsa dan liternya kembali ke saldo kendaraan.
        </p>
      </div>
    </Card>
  )
}

export const FuelStationSettings = () => {
  const { data: stations, isLoading } = useFuelStations()
  const del = useDeleteFuelStation()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<FuelStation | null>(null)

  const handleDelete = async (s: FuelStation) => {
    const ok = await appConfirm({
      title: 'Hapus SPBU?',
      description: `SPBU "${s.name}" akan dihapus.`,
      tone: 'danger',
      confirmText: 'Ya, Hapus',
    })
    if (!ok) return
    del.mutate(s.id, { onError: (e) => toast.error(getErrorMessage(e)) })
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader
          title="SPBU Mitra"
          action={
            <AppButton
              size="sm"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => {
                setEditing(null)
                setModalOpen(true)
              }}
            >
              Tambah SPBU
            </AppButton>
          }
        />
        {isLoading ? (
          <p className="py-8 text-center text-sm text-[var(--text-secondary)]">Memuat…</p>
        ) : (stations ?? []).length === 0 ? (
          <p className="py-8 text-center text-sm text-[var(--text-secondary)]">
            Belum ada SPBU mitra. Voucher BBM hanya bisa diterbitkan untuk SPBU mitra.
          </p>
        ) : (
          <ul className="divide-y divide-[var(--border-divider)]">
            {(stations ?? []).map((s) => (
              <li key={s.id} className="flex items-center gap-3 py-3 first:pt-0">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--primary-light)] text-[var(--primary)]">
                  <Fuel className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold text-[var(--text-primary)]">{s.name}</p>
                    {!s.isActive && (
                      <span className="rounded-full bg-[var(--bg-subtle)] px-2 py-0.5 text-[10px] font-semibold text-[var(--text-secondary)]">
                        Nonaktif
                      </span>
                    )}
                  </div>
                  <p className="truncate text-xs text-[var(--text-secondary)]">
                    {[s.address, s.contactPerson, s.phone].filter(Boolean).join(' · ') || '-'}
                  </p>
                </div>
                <AppButton
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Ubah"
                  onClick={() => {
                    setEditing(s)
                    setModalOpen(true)
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </AppButton>
                <AppButton
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Hapus"
                  loading={del.isPending && del.variables === s.id}
                  onClick={() => handleDelete(s)}
                  className="text-[var(--danger)] hover:text-[var(--danger)]"
                >
                  <Trash2 className="h-4 w-4" />
                </AppButton>
              </li>
            ))}
          </ul>
        )}
      </Card>
      <VoucherValiditySetting />
      <StationFormModal open={modalOpen} onOpenChange={setModalOpen} station={editing} />
    </div>
  )
}
