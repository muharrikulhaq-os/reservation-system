'use client'

import { MessageSquare, Star } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Card, CardHeader, AdminOnly } from '@/components/common'
import { StarRating, UserAvatar } from '@/components/shared'
import { Badge } from '@/components/shared/badge/StatusBadge'
import { InputSelect } from '@/components/ui-custom'
import { formatDateTime } from '@/lib'
// Impor langsung dari file hook (bukan barrel) untuk menghindari
// siklus impor drivers ⇄ booking / vehicles.
import { useDriverRatings } from '@/modules/booking/hooks/useBookings'
import { useVehicles } from '@/modules/vehicles/hooks/useVehicles'
import { useSetDriverFixedVehicle } from '../hooks/useDrivers'
import type { Driver, SelectOption } from '@/types'

// ─────────────────────────────────────────
// DRIVER DETAIL MODAL
// Info driver + daftar rating/ulasan dari penumpang.
// ─────────────────────────────────────────

const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex items-start justify-between gap-4 py-2">
    <span className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--text-secondary)]">
      {label}
    </span>
    <span className="text-right text-sm text-[var(--text-primary)]">{value}</span>
  </div>
)

interface Props {
  driver: Driver
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const DriverDetailModal = ({ driver, open, onOpenChange }: Props) => {
  const { data, isLoading } = useDriverRatings(open ? driver.id : 0)
  const ratings = data?.ratings ?? []
  const avg = data?.averageRating ?? null

  const { data: vehicles } = useVehicles(open ? { limit: 100 } : undefined)
  const setFixedVehicle = useSetDriverFixedVehicle()

  // Kendaraan yang belum punya supir tetap lain (atau memang sudah jadi
  // pasangan tetap supir ini) - selain itu tidak muncul di pilihan.
  const fixedVehicleOptions: SelectOption[] = (vehicles ?? [])
    .filter((v) => !v.fixedDriver || v.fixedDriver.id === driver.id)
    .map((v) => ({ value: v.id, label: `${v.name} (${v.plateNumber})` }))

  const handleFixedVehicleChange = (value: string) =>
    setFixedVehicle.mutate({ id: driver.id, vehicleId: value ? Number(value) : null })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto rounded-2xl p-6 shadow-[var(--shadow-modal)] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle
            className="text-lg font-bold text-[var(--text-primary)]"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Detail Driver
          </DialogTitle>
        </DialogHeader>

        <div className="mt-2">
          {/* Identitas */}
          <div className="mb-2 flex items-center gap-3">
            <UserAvatar name={driver.name} photo={driver.profilePhoto} size="md" />
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-[var(--text-primary)]">
                {driver.name}
              </p>
              <p className="truncate text-xs text-[var(--text-secondary)]">
                {driver.employeeId} · {driver.email}
              </p>
            </div>
            <div className="ml-auto shrink-0">
              {driver.isActive ? (
                <Badge variant="success">Aktif</Badge>
              ) : (
                <Badge variant="muted">Nonaktif</Badge>
              )}
            </div>
          </div>

          <div className="divide-y divide-[var(--border-divider)]">
            <Row label="Telepon" value={driver.phoneNumber || '-'} />
            <Row label="No. SIM" value={driver.licenseNumber || '-'} />
            <Row
              label="Kendaraan"
              value={
                driver.assignedPlate ? (
                  <span className="rounded-md bg-[var(--bg-subtle)] px-2 py-0.5 text-xs font-semibold">
                    {driver.assignedPlate}
                  </span>
                ) : (
                  '-'
                )
              }
            />
            <Row
              label="Kendaraan Tetap"
              value={
                driver.fixedVehicle ? (
                  <span className="rounded-md bg-[var(--primary-light)] px-2 py-0.5 text-xs font-semibold text-[var(--primary)]">
                    {driver.fixedVehicle.plateNumber}
                  </span>
                ) : (
                  '-'
                )
              }
            />
          </div>

          {/* Kendaraan tetap (admin) */}
          <AdminOnly>
            <Card className="mt-4">
              <CardHeader
                title="Atur Kendaraan Tetap"
                description="Supir ini otomatis dipilih saat kendaraan tetapnya dibooking - tidak ada pilihan supir lain"
              />
              <InputSelect
                placeholder="Tidak ada (bebas ditugaskan)"
                options={fixedVehicleOptions}
                value={driver.fixedVehicle?.id ?? ''}
                disabled={setFixedVehicle.isPending}
                onChange={(e) => handleFixedVehicleChange(e.target.value)}
              />
            </Card>
          </AdminOnly>

          {/* Ringkasan rating */}
          <div className="mt-5 flex items-center gap-3 rounded-xl border border-[var(--border-card)] bg-[var(--bg-subtle)] px-4 py-3">
            <Star className="h-5 w-5 fill-[#F59E0B] text-[#F59E0B]" />
            <div>
              <p className="text-lg font-bold leading-none text-[var(--text-primary)]">
                {avg != null ? avg.toFixed(1) : '-'}
              </p>
              <p className="mt-1 text-xs text-[var(--text-secondary)]">
                {data?.totalRatings ?? 0} ulasan
              </p>
            </div>
          </div>

          {/* Daftar ulasan */}
          <div className="mt-4">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.06em] text-[var(--text-secondary)]">
              <MessageSquare className="h-3.5 w-3.5" /> Ulasan
            </p>

            {isLoading ? (
              <p className="py-4 text-center text-sm text-[var(--text-disabled)]">
                Memuat…
              </p>
            ) : ratings.length === 0 ? (
              <p className="rounded-xl border border-dashed border-[var(--border-card)] bg-[var(--bg-subtle)] px-4 py-6 text-center text-sm text-[var(--text-disabled)]">
                Belum ada ulasan untuk driver ini.
              </p>
            ) : (
              <ul className="space-y-3">
                {ratings.map((r) => (
                  <li
                    key={r.id}
                    className="rounded-xl border border-[var(--border-card)] p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <StarRating value={r.rating} />
                      <span className="text-xs text-[var(--text-disabled)]">
                        {formatDateTime(r.createdAt)}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs font-medium text-[var(--text-secondary)]">
                      {r.ratedBy?.name ?? 'Anonim'}
                    </p>
                    {r.review && (
                      <p className="mt-1 text-sm text-[var(--text-primary)]">
                        “{r.review}”
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
