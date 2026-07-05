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
  InputFile,
  InputTextArea,
} from '@/components/ui-custom'
import { getErrorMessage, formatDate } from '@/lib'
import { MAINTENANCE_TYPE_CONFIG } from '@/constants'
import type { MaintenanceRecord } from '@/types'
import { useCompleteMaintenance } from '../hooks/useMaintenance'

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
  const [cost, setCost] = useState<number | undefined>(maintenance.cost || undefined)
  const [photos, setPhotos] = useState<File[]>([])
  const [note, setNote] = useState('')

  const complete = useCompleteMaintenance(maintenance.id)

  const canSubmit = !!endDate && !!cost && photos.length > 0

  const handleSubmit = async () => {
    if (!canSubmit || !cost) return
    try {
      await complete.mutateAsync({
        endDate: new Date(endDate).toISOString(),
        cost,
        proofPhotos: photos,
        note: note.trim() || undefined,
      })
      onOpenChange(false)
      onSuccess?.()
    } catch {
      // ditampilkan via complete.error
    }
  }

  const typeCfg = MAINTENANCE_TYPE_CONFIG[maintenance.type]

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
          {complete.error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{getErrorMessage(complete.error)}</span>
            </div>
          )}

          {/* Info read-only */}
          <div className="rounded-lg border border-[var(--border-divider)] bg-[var(--bg-subtle)] px-4 py-3">
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              {maintenance.resource?.name}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[var(--text-secondary)]">
              <span
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold"
                style={{ backgroundColor: 'var(--bg-card)', color: typeCfg?.color }}
              >
                {typeCfg?.label}
              </span>
              <span>Mulai {formatDate(maintenance.startDate)}</span>
            </div>
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

          <InputFile
            label="Bukti Pekerjaan"
            required
            accept="image/jpeg,image/png"
            multiple
            maxSizeMb={5}
            hint="Foto hasil perbaikan, invoice bengkel, dll (min. 1)"
            onChange={setPhotos}
          />

          <InputTextArea
            label="Catatan"
            rows={3}
            placeholder="Ringkasan pekerjaan yang dilakukan… (opsional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />

          <div className="flex gap-3 pt-1">
            <AppButton
              variant="secondary"
              fullWidth
              disabled={complete.isPending}
              onClick={() => onOpenChange(false)}
            >
              Batal
            </AppButton>
            <AppButton
              fullWidth
              loading={complete.isPending}
              disabled={!canSubmit || complete.isPending}
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
