'use client'

import { useState } from 'react'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AppButton,
  InputDate,
  InputRupiah,
  InputTextArea,
  InputFile,
} from '@/components/ui-custom'
import { getErrorMessage, formatDate } from '@/lib'
import { MAINTENANCE_STATUS } from '@/constants'
import type { MaintenanceRecord } from '@/types'
import { useUpdateMaintenance, useCompleteMaintenance } from '../hooks/useMaintenance'

interface CompleteMaintenanceModalProps {
  maintenance: MaintenanceRecord
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

const todayYMD = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`
}

export const CompleteMaintenanceModal = ({
  maintenance,
  open,
  onOpenChange,
  onSuccess,
}: CompleteMaintenanceModalProps) => {
  const [endDate, setEndDate] = useState(todayYMD())
  const [cost, setCost] = useState<number | undefined>(
    maintenance.totalCost ? Number(maintenance.totalCost) : undefined,
  )
  const [description, setDescription] = useState('')
  const [photos, setPhotos] = useState<File[]>([])

  const update = useUpdateMaintenance(maintenance.id)
  const complete = useCompleteMaintenance(maintenance.id)

  const isPending = update.isPending || complete.isPending
  const error = update.error ?? complete.error
  const canSubmit = !!endDate && !!cost && photos.length > 0

  // endDate WAJIB > startDate (CHECK chk_maintenance_dates). Pakai tanggal terpilih
  // + jam sekarang; jika tetap <= startDate, dorong 1 menit setelah startDate.
  const buildEndIso = () => {
    const start = new Date(maintenance.startDate)
    const now = new Date()
    const [y, m, d] = endDate.split('-').map(Number)
    let end = new Date(y, m - 1, d, now.getHours(), now.getMinutes(), now.getSeconds())
    if (end.getTime() <= start.getTime()) {
      end = new Date(start.getTime() + 60_000)
    }
    return end.toISOString()
  }

  const handleSubmit = async () => {
    if (!canSubmit || !cost) return
    try {
      // 1. Set biaya final + endDate via PUT (status tetap pending agar /complete bisa jalan).
      //    PUT butuh semua field wajib → ambil dari record yang ada.
      await update.mutateAsync({
        vehicleId: maintenance.vehicleId,
        // Backend mengirim 0 saat NULL → jangan kirim balik (FK ke maintenance_types)
        maintenanceTypeId:
          maintenance.maintenanceTypeId && maintenance.maintenanceTypeId > 0
            ? maintenance.maintenanceTypeId
            : undefined,
        type: maintenance.type,
        status: MAINTENANCE_STATUS.PENDING,
        description: description.trim() || maintenance.description,
        odometer:
          maintenance.odometer && maintenance.odometer > 0
            ? maintenance.odometer
            : undefined,
        totalCost: cost,
        vendorName: maintenance.vendorName ?? undefined,
        location: maintenance.location,
        startDate: maintenance.startDate,
        endDate: buildEndIso(),
      })
      // 2. Upload foto bukti + tandai selesai (status → completed, resource AVAILABLE)
      await complete.mutateAsync({ photos })
      onOpenChange(false)
      onSuccess?.()
    } catch {
      // ditampilkan via error
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl p-6 shadow-[var(--shadow-modal)] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle
            className="flex items-center gap-2 text-lg font-bold text-[var(--text-primary)]"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            <CheckCircle2 className="h-5 w-5 text-[var(--success)]" /> Selesaikan
            Maintenance
          </DialogTitle>
        </DialogHeader>

        <div className="mt-2 space-y-4">
          {error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{getErrorMessage(error)}</span>
            </div>
          )}

          {/* Info read-only */}
          <div className="rounded-lg border border-[var(--border-divider)] bg-[var(--bg-subtle)] px-4 py-3">
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              {maintenance.vehicleName} · {maintenance.plateNumber}
            </p>
            <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
              Mulai {formatDate(maintenance.startDate)}
            </p>
            <p className="mt-1.5 text-xs text-[var(--text-secondary)]">
              {maintenance.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <InputDate
              label="Tanggal Selesai"
              required
              min={maintenance.startDate.slice(0, 10)}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            <InputRupiah
              label="Biaya Final"
              required
              value={cost}
              onChange={setCost}
            />
          </div>

          <InputTextArea
            label="Deskripsi Hasil"
            rows={3}
            placeholder="Ringkasan pekerjaan yang dilakukan… (opsional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <InputFile
            label="Bukti Pekerjaan"
            required
            accept="image/jpeg,image/png"
            multiple
            maxSizeMb={5}
            hint="Foto hasil perbaikan / invoice (min. 1)"
            onChange={setPhotos}
          />

          <div className="flex gap-3 pt-1">
            <AppButton
              variant="secondary"
              fullWidth
              disabled={isPending}
              onClick={() => onOpenChange(false)}
            >
              Batal
            </AppButton>
            <AppButton
              fullWidth
              loading={isPending}
              disabled={!canSubmit || isPending}
              onClick={handleSubmit}
            >
              Selesaikan
            </AppButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
