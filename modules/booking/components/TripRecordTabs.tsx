'use client'

import { useState } from 'react'
import { Fuel, FileCheck, Play, ImageOff, MapPin, Gauge, Zap } from 'lucide-react'
import { Card, CardHeader, CardSection } from '@/components/common'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { SafeImage } from '@/components/shared'
import { cn, formatDateTime, formatDate, formatCurrency, formatNumber, resolveFileUrl } from '@/lib'
import { ENERGY_TYPE } from '@/constants'
import type { Booking, FuelExpense } from '@/types'
import { useReturnReport } from '../hooks/useBookings'
import { useFuelExpensesForBookings, FuelDetailModal } from '@/modules/fuel'

// ─────────────────────────────────────────
// TRIP RECORD TABS
// Konsolidasi 3 catatan input selama perjalanan yang tadinya 3 card
// terpisah (bikin halaman panjang ke bawah) jadi satu card dengan tab:
// Keberangkatan (odometer + foto awal), Pengisian BBM, Laporan
// Pengembalian. Hanya untuk booking VEHICLE yang sudah ONGOING/OVERDUE/
// COMPLETED - sebelum itu belum ada apa pun untuk ditampilkan.
// ─────────────────────────────────────────

type TabKey = 'start' | 'fuel' | 'report'

const TAB_TRIGGER_CLASS =
  'flex-1 gap-1.5 rounded-md px-2 text-xs font-medium text-[var(--text-secondary)] data-[state=active]:bg-[var(--bg-card)] data-[state=active]:text-[var(--primary)] data-[state=active]:shadow-sm'

const EmptyState = ({ text }: { text: string }) => (
  <p className="py-8 text-center text-sm text-[var(--text-secondary)]">{text}</p>
)

const FieldBlock = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div>
    <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.07em] text-[var(--text-secondary)]">
      {label}
    </p>
    <div className="text-sm text-[var(--text-primary)]">{value}</div>
  </div>
)

interface TripRecordTabsProps {
  booking: Booking
  linkedBookingIds?: number[]
}

export const TripRecordTabs = ({ booking, linkedBookingIds = [] }: TripRecordTabsProps) => {
  const [tab, setTab] = useState<TabKey>('start')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedFuel, setSelectedFuel] = useState<FuelExpense | null>(null)

  const { data: report, isError: reportError } = useReturnReport(booking.id)
  const { items: fuelItems } = useFuelExpensesForBookings([booking.id, ...linkedBookingIds])

  const hasReport = !reportError && !!report
  const hasStart = booking.odometerStart != null || !!booking.startPhotoUrl
  const startPhotoUrl = resolveFileUrl(booking.startPhotoUrl)

  return (
    <Card>
      <CardHeader
        title="Catatan Perjalanan"
        description="Odometer keberangkatan, riwayat BBM, dan laporan pengembalian"
      />

      <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)}>
        <TabsList className="mb-4 flex w-full rounded-lg bg-[var(--bg-subtle)] p-1">
          <TabsTrigger value="start" className={TAB_TRIGGER_CLASS}>
            <Play className="h-3.5 w-3.5" /> Keberangkatan
          </TabsTrigger>
          <TabsTrigger value="fuel" className={TAB_TRIGGER_CLASS}>
            <Fuel className="h-3.5 w-3.5" /> BBM{fuelItems.length > 0 ? ` (${fuelItems.length})` : ''}
          </TabsTrigger>
          <TabsTrigger value="report" className={TAB_TRIGGER_CLASS}>
            <FileCheck className="h-3.5 w-3.5" /> Laporan
          </TabsTrigger>
        </TabsList>

        {/* ── Tab: Keberangkatan ── */}
        <TabsContent value="start">
          {hasStart ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FieldBlock
                  label="Odometer Awal"
                  value={
                    <span className="flex items-center gap-1.5">
                      <Gauge className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
                      {booking.odometerStart != null
                        ? `${formatNumber(booking.odometerStart)} km`
                        : '-'}
                    </span>
                  }
                />
                <FieldBlock
                  label="Lokasi"
                  value={
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
                      {booking.startLocation || '-'}
                    </span>
                  }
                />
              </div>

              {startPhotoUrl && (
                <div>
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.07em] text-[var(--text-secondary)]">
                    Foto Odometer
                  </p>
                  <button
                    type="button"
                    onClick={() => setPreviewUrl(startPhotoUrl)}
                    className="aspect-video w-full max-w-xs overflow-hidden rounded-lg border border-[var(--border-card)]"
                  >
                    <SafeImage
                      src={startPhotoUrl}
                      alt="Foto odometer awal"
                      className="h-full w-full object-cover"
                      fallbackClassName="bg-[var(--bg-subtle)] text-[var(--text-disabled)]"
                      fallback={<ImageOff className="h-5 w-5" />}
                    />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <EmptyState text="Perjalanan belum dimulai" />
          )}
        </TabsContent>

        {/* ── Tab: Pengisian BBM ── */}
        <TabsContent value="fuel">
          {fuelItems.length > 0 ? (
            <ul className="divide-y divide-[var(--border-divider)]">
              {fuelItems.map((f) => {
                const isBbm = f.fuelType === ENERGY_TYPE.BBM
                return (
                  <li key={f.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedFuel(f)}
                      className="flex w-full items-center gap-3 rounded-lg px-1 py-3 text-left transition-colors first:pt-0 hover:bg-[var(--bg-subtle)]"
                    >
                      <span
                        className={cn(
                          'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                          isBbm ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600',
                        )}
                      >
                        {isBbm ? <Fuel className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                          {isBbm ? `${formatNumber(f.liter ?? 0)} L` : `${formatNumber(f.kwh ?? 0)} kWh`}
                          {' · '}
                          {formatCurrency(f.totalCost)}
                        </p>
                        <p className="truncate text-xs text-[var(--text-secondary)]">
                          {f.driverName || '-'} · {formatDate(f.createdAt)}
                        </p>
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>
          ) : (
            <EmptyState text="Belum ada pengisian BBM" />
          )}
        </TabsContent>

        {/* ── Tab: Laporan Pengembalian ── */}
        <TabsContent value="report">
          {hasReport && report ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-[var(--text-primary)]">
                  Dikirim oleh <span className="font-semibold">{report.submittedBy.name}</span>
                </p>
                <p className="text-xs text-[var(--text-secondary)]">
                  {formatDateTime(report.submittedAt)}
                </p>
              </div>

              <FieldBlock
                label="Catatan"
                value={
                  <CardSection>
                    <p className="text-sm leading-relaxed text-[var(--text-primary)]">
                      {report.note}
                    </p>
                  </CardSection>
                }
              />

              <FieldBlock
                label="Lokasi"
                value={
                  <span className="flex items-start gap-1.5">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--text-secondary)]" />
                    {report.location}
                  </span>
                }
              />

              {report.photos.length > 0 && (
                <div>
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.07em] text-[var(--text-secondary)]">
                    Foto Kondisi
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {report.photos.map((photo) => (
                      <button
                        key={photo.id}
                        type="button"
                        onClick={() => setPreviewUrl(resolveFileUrl(photo.filePath))}
                        className="aspect-square overflow-hidden rounded-lg border border-[var(--border-card)]"
                      >
                        <SafeImage
                          src={resolveFileUrl(photo.filePath)}
                          alt={photo.fileName}
                          className="h-full w-full object-cover"
                          fallbackClassName="bg-[var(--bg-subtle)] text-[var(--text-disabled)]"
                          fallback={<ImageOff className="h-5 w-5" />}
                        />
                      </button>
                    ))}
                  </div>
                  <p className="mt-1.5 text-xs text-[var(--text-disabled)]">Klik untuk perbesar</p>
                </div>
              )}
            </div>
          ) : (
            <EmptyState text="Belum ada laporan pengembalian" />
          )}
        </TabsContent>
      </Tabs>

      {/* Preview foto full size - dipakai bareng oleh tab keberangkatan & laporan */}
      <Dialog open={!!previewUrl} onOpenChange={(open) => !open && setPreviewUrl(null)}>
        <DialogContent className="max-w-2xl rounded-2xl p-2 shadow-[var(--shadow-modal)]">
          {previewUrl && (
            <SafeImage
              src={previewUrl}
              alt="Preview foto"
              className="max-h-[80vh] w-full rounded-xl object-contain"
              fallbackClassName="h-64 w-full rounded-xl bg-[var(--bg-subtle)] text-[var(--text-disabled)]"
              fallback={<ImageOff className="h-10 w-10" />}
            />
          )}
        </DialogContent>
      </Dialog>

      {selectedFuel && (
        <FuelDetailModal
          fuel={selectedFuel}
          open={!!selectedFuel}
          onOpenChange={(o) => !o && setSelectedFuel(null)}
        />
      )}
    </Card>
  )
}
