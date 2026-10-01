'use client'

import { useMemo, useState } from 'react'
import { AlertTriangle, History, Printer, Scale, Search, Settings2, Ticket, Zap } from 'lucide-react'
import { AppButton, InputText } from '@/components/ui-custom'
import { cn, formatDateTime, formatNumber } from '@/lib'
import type { FuelBalance, FuelVoucher, VehicleFuelBalance } from '@/types'
import { useFuelBalances } from '../hooks/useFuelVoucher'
import { formatQty, formatRupiahExact } from '../utils/format'
import { FuelProfileModal } from './FuelProfileModal'
import { FuelAdjustModal, FuelLedgerModal } from './FuelLedgerModal'
import { VoucherIssueModal } from './VoucherIssueModal'
import { openVoucherPrint } from './VoucherPrint'

// ─────────────────────────────────────────
// TAB SALDO KENDARAAN (admin)
// Saldo = saldo tercatat + hak dari jarak sejak isi/voucher terakhir.
// ─────────────────────────────────────────

type ModalKind = 'issue' | 'profile' | 'adjust' | 'ledger'

const BalanceBlock = ({ b }: { b: FuelBalance }) => {
  const negative = b.available < 0
  return (
    <div className="min-w-0">
      <p className={cn('text-lg font-bold', negative ? 'text-red-600' : 'text-[var(--text-primary)]')}>
        {formatQty(b.available)} {b.unit}
      </p>
      <p className="text-xs text-[var(--text-secondary)]">
        {b.kmPerUnit ? (
          <>
            saldo {formatQty(b.recordedBalance)} + {formatNumber(b.pendingKm)} km ÷ {formatQty(b.kmPerUnit)}
          </>
        ) : (
          'km per unit belum diatur'
        )}
      </p>
      <p className="text-[11px] text-[var(--text-disabled)]">
        isi terakhir {formatNumber(b.checkpointOdometer)} km · sekarang {formatNumber(b.currentOdometer)} km
      </p>
    </div>
  )
}

export const FuelBalanceTab = () => {
  const { data, isLoading } = useFuelBalances()
  const [search, setSearch] = useState('')
  const [active, setActive] = useState<{ kind: ModalKind; vehicle: VehicleFuelBalance } | null>(null)

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase()
    return (data ?? []).filter(
      (v) => !q || v.vehicleName.toLowerCase().includes(q) || v.plateNumber.toLowerCase().includes(q),
    )
  }, [data, search])

  const open = (kind: ModalKind, vehicle: VehicleFuelBalance) => setActive({ kind, vehicle })
  const close = (o: boolean) => !o && setActive(null)
  const onIssued = (v: FuelVoucher) => openVoucherPrint(v.id)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="w-full max-w-xs">
          <InputText
            placeholder="Cari kendaraan / plat…"
            leftIcon={<Search className="h-4 w-4" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <p className="text-xs text-[var(--text-secondary)]">
          Hak liter = jarak sejak isi terakhir ÷ konsumsi km/L. Voucher maksimal sebesar kapasitas tangki.
        </p>
      </div>

      <div className="rounded-2xl border border-[var(--border-card)] bg-[var(--bg-card)] shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
        {isLoading ? (
          <p className="py-10 text-center text-sm text-[var(--text-secondary)]">Memuat…</p>
        ) : rows.length === 0 ? (
          <p className="py-10 text-center text-sm text-[var(--text-secondary)]">Tidak ada kendaraan.</p>
        ) : (
          <ul className="divide-y divide-[var(--border-divider)]">
            {rows.map((v) => {
              const bbm = v.balances.BBM
              const ev = v.balances.LISTRIK
              const warnings = [...(bbm?.warnings ?? []), ...(ev?.warnings ?? [])]
              return (
                <li key={v.vehicleId} className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
                  <div className="min-w-0 lg:w-56">
                    <p className="truncate text-sm font-semibold text-[var(--text-primary)]">{v.vehicleName}</p>
                    <p className="text-xs text-[var(--text-secondary)]">
                      {v.plateNumber} · {v.energyType}
                    </p>
                    <p className="text-[11px] text-[var(--text-disabled)]">
                      {v.profile.kmPerLiter != null && `${formatQty(v.profile.kmPerLiter)} km/L`}
                      {v.profile.tankCapacityLiter != null && ` · tangki ${formatQty(v.profile.tankCapacityLiter)} L`}
                      {v.profile.kmPerKwh != null && ` · ${formatQty(v.profile.kmPerKwh)} km/kWh`}
                    </p>
                  </div>

                  <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
                    {bbm && <BalanceBlock b={bbm} />}
                    {ev && (
                      <div className="flex gap-2">
                        <Zap className="mt-1 h-4 w-4 shrink-0 text-[#0284C7]" />
                        <BalanceBlock b={ev} />
                      </div>
                    )}
                    {warnings.length > 0 && (
                      <div className="sm:col-span-2 flex items-start gap-1.5 text-xs text-amber-700">
                        <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
                        <span>{warnings.join(' · ')}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                    {v.activeVoucher ? (
                      <button
                        type="button"
                        onClick={() => openVoucherPrint(v.activeVoucher!.id)}
                        className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-left text-xs text-blue-800 hover:bg-blue-100"
                        title="Cetak ulang voucher aktif"
                      >
                        <span className="flex items-center gap-1 font-semibold">
                          <Printer className="h-3 w-3" /> {v.activeVoucher.code}
                        </span>
                        {formatQty(v.activeVoucher.liter)} L · {formatRupiahExact(v.activeVoucher.amount)}
                        <span className="block text-[10px]">s.d. {formatDateTime(v.activeVoucher.validUntil)}</span>
                      </button>
                    ) : (
                      bbm && (
                        <AppButton
                          size="sm"
                          leftIcon={<Ticket className="h-4 w-4" />}
                          disabled={!bbm.voucherable}
                          onClick={() => open('issue', v)}
                          title={bbm.voucherable ? `Voucher ±${formatQty(bbm.voucherable)} L` : 'Saldo belum cukup / profil belum lengkap'}
                        >
                          Voucher{bbm.voucherable ? ` ${formatQty(bbm.voucherable)} L` : ''}
                        </AppButton>
                      )
                    )}
                    <AppButton size="icon-sm" variant="ghost" title="Profil BBM" aria-label="Profil BBM" onClick={() => open('profile', v)}>
                      <Settings2 className="h-4 w-4" />
                    </AppButton>
                    <AppButton size="icon-sm" variant="ghost" title="Penyesuaian saldo" aria-label="Penyesuaian saldo" onClick={() => open('adjust', v)}>
                      <Scale className="h-4 w-4" />
                    </AppButton>
                    <AppButton size="icon-sm" variant="ghost" title="Mutasi saldo" aria-label="Mutasi saldo" onClick={() => open('ledger', v)}>
                      <History className="h-4 w-4" />
                    </AppButton>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {active?.kind === 'issue' && (
        <VoucherIssueModal vehicle={active.vehicle} open onOpenChange={close} onIssued={onIssued} />
      )}
      {active?.kind === 'profile' && <FuelProfileModal vehicle={active.vehicle} open onOpenChange={close} />}
      {active?.kind === 'adjust' && <FuelAdjustModal vehicle={active.vehicle} open onOpenChange={close} />}
      {active?.kind === 'ledger' && <FuelLedgerModal vehicle={active.vehicle} open onOpenChange={close} />}
    </div>
  )
}
