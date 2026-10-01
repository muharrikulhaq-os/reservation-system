'use client'

import { useMemo, useState } from 'react'
import { Ban, CheckCircle2, Download, Eye, FileCheck2, Printer, Search } from 'lucide-react'
import { toast } from 'sonner'
import { AppButton, InputDate, InputSelect, InputText } from '@/components/ui-custom'
import { formatDateTime, getErrorMessage } from '@/lib'
import { useDebounce } from '@/hooks'
import { useAuthStore } from '@/store/auth.store'
import type { FuelVoucher, FuelVoucherParams, FuelVoucherStatus, SelectOption } from '@/types'
import { fuelVoucherApi } from '../api/fuelVoucher.api'
import { useFuelStations, useFuelVouchers } from '../hooks/useFuelVoucher'
import { VOUCHER_STATUS_CONFIG, formatQty, formatRupiahExact } from '../utils/format'
import {
  ReconcileModal,
  VoucherCancelModal,
  VoucherDetailModal,
  VoucherStatusBadge,
  VoucherUseModal,
} from './VoucherActions'
import { openVoucherPrint } from './VoucherPrint'

// ─────────────────────────────────────────
// TAB VOUCHER
// Admin: semua voucher, filter per SPBU/periode, rekonsiliasi & ekspor.
// Driver: voucher miliknya + "Sudah Diisi".
// ─────────────────────────────────────────

type Action = 'detail' | 'use' | 'cancel'

// Batas hari WIB → RFC3339 UTC (backend memfilter createdAt).
const wibDayStart = (d: string) => new Date(`${d}T00:00:00+07:00`).toISOString()
const wibNextDay = (d: string) => new Date(new Date(`${d}T00:00:00+07:00`).getTime() + 86400000).toISOString()

const csvCell = (v: unknown) => {
  const s = v == null ? '' : String(v)
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export const VoucherTab = () => {
  const isAdmin = useAuthStore((s) => s.user?.role === 'ADMIN')
  const { data: stations } = useFuelStations()
  const [status, setStatus] = useState<FuelVoucherStatus | ''>('')
  const [stationId, setStationId] = useState<number | ''>('')
  const [reconciled, setReconciled] = useState<'' | 'true' | 'false'>('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<Record<number, FuelVoucher>>({})
  const [active, setActive] = useState<{ kind: Action; v: FuelVoucher } | null>(null)
  const [reconcileOpen, setReconcileOpen] = useState(false)
  const [exporting, setExporting] = useState(false)
  const debouncedSearch = useDebounce(search, 400)

  const params: FuelVoucherParams = useMemo(
    () => ({
      page,
      limit: 20,
      status: status || undefined,
      stationId: stationId || undefined,
      reconciled: reconciled === '' ? undefined : reconciled === 'true',
      from: from ? wibDayStart(from) : undefined,
      to: to ? wibNextDay(to) : undefined,
      search: debouncedSearch.trim() || undefined,
    }),
    [page, status, stationId, reconciled, from, to, debouncedSearch],
  )
  const { data, isLoading } = useFuelVouchers(params)
  const items = data?.data ?? []
  const pagination = data?.pagination
  const summary = data?.summary ?? []

  const reconcilable = (v: FuelVoucher) => v.status === 'USED' && !v.reconciledAt
  const selectedList = Object.values(selected)
  const toggle = (v: FuelVoucher) =>
    setSelected((s) => {
      const next = { ...s }
      if (next[v.id]) delete next[v.id]
      else next[v.id] = v
      return next
    })
  const setFilter = <T,>(fn: (v: T) => void) => (v: T) => {
    fn(v)
    setPage(1)
  }

  const exportCsv = async () => {
    setExporting(true)
    try {
      const all: FuelVoucher[] = []
      for (let p = 1; p <= 50; p++) {
        const r = await fuelVoucherApi.getAll({ ...params, page: p, limit: 100 })
        all.push(...r.data)
        if (p >= (r.pagination?.totalPages ?? 1)) break
      }
      const header = ['Kode', 'Tanggal Terbit', 'Status', 'SPBU', 'Kendaraan', 'Plat', 'Driver', 'Jenis BBM', 'Liter',
        'Harga/L', 'Nominal', 'Odometer', 'Berlaku s.d.', 'Diisi', 'No. Tagihan', 'Rekonsiliasi']
      const lines = all.map((v) => [
        v.code, formatDateTime(v.createdAt), VOUCHER_STATUS_CONFIG[v.status].label, v.stationName, v.vehicleName,
        v.plateNumber, v.driverName ?? '', v.fuelTypeName, String(v.liter).replace('.', ','),
        String(v.pricePerLiter).replace('.', ','), String(v.amount).replace('.', ','), v.odometer,
        formatDateTime(v.validUntil), v.usedAt ? formatDateTime(v.usedAt) : '', v.invoiceNumber ?? '',
        v.reconciledAt ? formatDateTime(v.reconciledAt) : '',
      ].map(csvCell).join(';'))
      // BOM + ';' supaya Excel (locale Indonesia) membuka kolom dengan benar.
      const blob = new Blob(['﻿' + [header.join(';'), ...lines].join('\r\n')], { type: 'text/csv;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `voucher-bbm-${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      toast.error(getErrorMessage(e))
    } finally {
      setExporting(false)
    }
  }

  const statusOptions: SelectOption[] = (Object.keys(VOUCHER_STATUS_CONFIG) as FuelVoucherStatus[]).map((s) => ({
    value: s,
    label: VOUCHER_STATUS_CONFIG[s].label,
  }))

  return (
    <div className="flex flex-col gap-4">
      {/* Ringkasan */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {(Object.keys(VOUCHER_STATUS_CONFIG) as FuelVoucherStatus[]).map((s) => {
          const row = summary.find((x) => x.status === s)
          const cfg = VOUCHER_STATUS_CONFIG[s]
          return (
            <button
              key={s}
              type="button"
              onClick={() => setFilter(setStatus)(status === s ? '' : s)}
              className="rounded-xl border bg-[var(--bg-card)] p-3 text-left shadow-[0_1px_4px_rgba(0,0,0,0.06)] transition-all"
              style={{ borderColor: status === s ? cfg.color : 'var(--border-card)' }}
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.07em]" style={{ color: cfg.color }}>
                {cfg.label}
              </p>
              <p className="text-lg font-bold text-[var(--text-primary)]">{row?.count ?? 0}</p>
              <p className="text-xs text-[var(--text-secondary)]">
                {formatQty(row?.liter ?? 0)} L · {formatRupiahExact(row?.amount ?? 0)}
              </p>
            </button>
          )
        })}
      </div>

      {/* Filter */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-full max-w-[220px]">
          <InputText
            placeholder="Kode / plat…"
            leftIcon={<Search className="h-4 w-4" />}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
          />
        </div>
        <div className="w-full max-w-[160px]">
          <InputSelect placeholder="Semua Status" options={statusOptions} value={status}
            onChange={(e) => setFilter(setStatus)(e.target.value as FuelVoucherStatus | '')} />
        </div>
        {isAdmin && (
          <>
            <div className="w-full max-w-[200px]">
              <InputSelect
                placeholder="Semua SPBU"
                options={(stations ?? []).map((s) => ({ value: s.id, label: s.name }))}
                value={stationId}
                onChange={(e) => setFilter(setStationId)(e.target.value ? Number(e.target.value) : '')}
              />
            </div>
            <div className="w-full max-w-[170px]">
              <InputSelect
                placeholder="Rekonsiliasi: semua"
                options={[
                  { value: 'false', label: 'Belum direkonsiliasi' },
                  { value: 'true', label: 'Sudah direkonsiliasi' },
                ]}
                value={reconciled}
                onChange={(e) => setFilter(setReconciled)(e.target.value as '' | 'true' | 'false')}
              />
            </div>
          </>
        )}
        <div className="w-[150px]">
          <InputDate label="Dari" value={from} onChange={(e) => setFilter(setFrom)(e.target.value)} />
        </div>
        <div className="w-[150px]">
          <InputDate label="Sampai" value={to} onChange={(e) => setFilter(setTo)(e.target.value)} />
        </div>
        {isAdmin && (
          <div className="ml-auto flex gap-2">
            <AppButton
              variant="secondary"
              leftIcon={<Download className="h-4 w-4" />}
              loading={exporting}
              onClick={exportCsv}
            >
              Ekspor
            </AppButton>
            <AppButton
              leftIcon={<FileCheck2 className="h-4 w-4" />}
              disabled={selectedList.length === 0}
              onClick={() => setReconcileOpen(true)}
            >
              Rekonsiliasi{selectedList.length ? ` (${selectedList.length})` : ''}
            </AppButton>
          </div>
        )}
      </div>

      {/* Tabel */}
      <div className="overflow-x-auto rounded-2xl border border-[var(--border-card)] bg-[var(--bg-card)] shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
        {isLoading ? (
          <p className="py-10 text-center text-sm text-[var(--text-secondary)]">Memuat…</p>
        ) : items.length === 0 ? (
          <p className="py-10 text-center text-sm text-[var(--text-secondary)]">Belum ada voucher.</p>
        ) : (
          <table className="w-full min-w-[860px] text-sm">
            <thead>
              <tr className="border-b border-[var(--border-divider)] text-left text-[10px] uppercase tracking-[0.06em] text-[var(--text-secondary)]">
                {isAdmin && (
                  <th className="w-10 px-3 py-3">
                    <input
                      type="checkbox"
                      aria-label="Pilih semua yang bisa direkonsiliasi"
                      checked={items.filter(reconcilable).length > 0 && items.filter(reconcilable).every((v) => selected[v.id])}
                      onChange={(e) =>
                        setSelected((s) => {
                          const next = { ...s }
                          for (const v of items.filter(reconcilable)) {
                            if (e.target.checked) next[v.id] = v
                            else delete next[v.id]
                          }
                          return next
                        })
                      }
                    />
                  </th>
                )}
                <th className="px-3 py-3">Voucher</th>
                <th className="px-3 py-3">Kendaraan</th>
                <th className="px-3 py-3">SPBU</th>
                <th className="px-3 py-3 text-right">Liter</th>
                <th className="px-3 py-3 text-right">Nominal</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-divider)]">
              {items.map((v) => (
                <tr key={v.id} className="align-top">
                  {isAdmin && (
                    <td className="px-3 py-3">
                      <input
                        type="checkbox"
                        disabled={!reconcilable(v)}
                        checked={!!selected[v.id]}
                        onChange={() => toggle(v)}
                        aria-label={`Pilih ${v.code}`}
                      />
                    </td>
                  )}
                  <td className="px-3 py-3">
                    <p className="font-mono text-xs font-semibold text-[var(--text-primary)]">{v.code}</p>
                    <p className="text-[11px] text-[var(--text-secondary)]">{formatDateTime(v.createdAt)}</p>
                  </td>
                  <td className="px-3 py-3">
                    <p className="text-[var(--text-primary)]">{v.plateNumber}</p>
                    <p className="text-[11px] text-[var(--text-secondary)]">{v.driverName ?? 'tanpa driver'}</p>
                  </td>
                  <td className="px-3 py-3 text-[var(--text-primary)]">{v.stationName}</td>
                  <td className="px-3 py-3 text-right">{formatQty(v.liter)} L</td>
                  <td className="px-3 py-3 text-right font-medium">{formatRupiahExact(v.amount)}</td>
                  <td className="px-3 py-3">
                    <VoucherStatusBadge v={v} />
                    {v.status === 'ISSUED' && (
                      <p className="mt-0.5 text-[10px] text-[var(--text-secondary)]">s.d. {formatDateTime(v.validUntil)}</p>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex justify-end gap-1">
                      <AppButton size="icon-sm" variant="ghost" title="Detail" aria-label="Detail" onClick={() => setActive({ kind: 'detail', v })}>
                        <Eye className="h-4 w-4" />
                      </AppButton>
                      <AppButton size="icon-sm" variant="ghost" title="Cetak" aria-label="Cetak" onClick={() => openVoucherPrint(v.id)}>
                        <Printer className="h-4 w-4" />
                      </AppButton>
                      {(v.status === 'ISSUED' || (isAdmin && v.status === 'EXPIRED')) && (
                        <AppButton
                          size="icon-sm"
                          variant="ghost"
                          title={v.status === 'EXPIRED' ? 'Tandai terpakai' : 'Sudah diisi'}
                          aria-label="Sudah diisi"
                          className="text-[var(--success)]"
                          onClick={() => setActive({ kind: 'use', v })}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </AppButton>
                      )}
                      {isAdmin && v.status !== 'CANCELLED' && (
                        <AppButton
                          size="icon-sm"
                          variant="ghost"
                          title="Batalkan"
                          aria-label="Batalkan"
                          className="text-[var(--danger)]"
                          onClick={() => setActive({ kind: 'cancel', v })}
                        >
                          <Ban className="h-4 w-4" />
                        </AppButton>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-end gap-2">
          <AppButton size="sm" variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Sebelumnya
          </AppButton>
          <span className="text-xs text-[var(--text-secondary)]">
            {page} / {pagination.totalPages} · {pagination.total} voucher
          </span>
          <AppButton size="sm" variant="secondary" disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)}>
            Berikutnya
          </AppButton>
        </div>
      )}

      {active?.kind === 'detail' && (
        <VoucherDetailModal voucher={active.v} open onOpenChange={(o) => !o && setActive(null)} />
      )}
      {active?.kind === 'use' && (
        <VoucherUseModal voucher={active.v} isAdmin={isAdmin} open onOpenChange={(o) => !o && setActive(null)} />
      )}
      {active?.kind === 'cancel' && (
        <VoucherCancelModal voucher={active.v} open onOpenChange={(o) => !o && setActive(null)} />
      )}
      <ReconcileModal
        vouchers={selectedList}
        open={reconcileOpen}
        onOpenChange={setReconcileOpen}
        onDone={() => setSelected({})}
      />
    </div>
  )
}
