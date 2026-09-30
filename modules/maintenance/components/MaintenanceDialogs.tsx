'use client'

import { useEffect, useState } from 'react'
import { CalendarClock, Coins, KeyRound, PackageCheck, XCircle } from 'lucide-react'
import {
  AppButton,
  InputDateTime,
  InputNumber,
  InputRupiah,
  InputSelect,
  InputText,
  InputTextArea,
} from '@/components/ui-custom'
import { formatNumber } from '@/lib'
import { COST_BEARER_OPTIONS, FUEL_LEVEL_OPTIONS, HANDOVER_CHECKLIST } from '@/constants'
import type {
  FuelLevel,
  HandoverChecklist,
  MaintenanceCostBearer,
  MaintenanceRecord,
} from '@/types'
import {
  useCancelMaintenance,
  useHandoverMaintenance,
  useReturnMaintenance,
  useScheduleMaintenance,
  useUpdateMaintenanceCost,
} from '../hooks/useMaintenance'
import { fromWibInput, nowWibInput, toWibInput } from '../utils/helpers'
import { ErrorAlert, FormDialog, WarningAlert } from './shared'

interface DialogProps {
  m: MaintenanceRecord
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Peringatan backend (mis. bentrok dengan booking disetujui). */
  onWarning?: (w: string) => void
}

// ─────────────────────────────────────────
// Jadwal dari vendor (SUBMITTED/SCHEDULED → SCHEDULED)
// ─────────────────────────────────────────

export const ScheduleDialog = ({ m, open, onOpenChange, onWarning }: DialogProps) => {
  const [date, setDate] = useState('')
  const [days, setDays] = useState<number | undefined>(1)
  const [note, setNote] = useState('')
  const mut = useScheduleMaintenance(m.id)

  useEffect(() => {
    if (!open) return
    setDate(toWibInput(m.scheduledDate ?? m.plannedDate))
    setDays(m.estimatedDays ?? 1)
    setNote(m.scheduleNote ?? '')
    mut.reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const submit = () =>
    mut.mutate(
      { scheduledDate: fromWibInput(date)!, estimatedDays: days, note: note.trim() || undefined },
      {
        onSuccess: (r) => {
          if (r.warning) onWarning?.(r.warning)
          onOpenChange(false)
        },
      },
    )

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Catat Jadwal dari Vendor"
      icon={<CalendarClock className="h-5 w-5 text-[var(--primary)]" />}
      footer={
        <>
          <AppButton variant="secondary" onClick={() => onOpenChange(false)}>Batal</AppButton>
          <AppButton loading={mut.isPending} disabled={!date || !days} onClick={submit}>
            Simpan Jadwal
          </AppButton>
        </>
      }
    >
      <ErrorAlert error={mut.error} />
      <p className="text-sm text-[var(--text-secondary)]">
        Tanggal jadwal menggantikan rencana & memblokir booking kendaraan pada rentang tersebut.
      </p>
      <InputDateTime label="Tanggal & Jam Jadwal" required value={date} onChange={(e) => setDate(e.target.value)} />
      <InputNumber label="Estimasi Lama (hari)" required min={1} max={365} value={days ?? ''} onChange={setDays} />
      <InputTextArea label="Catatan (opsional)" rows={2} placeholder="mis. Dikonfirmasi via telepon oleh Pak Hendra" value={note} onChange={(e) => setNote(e.target.value)} />
    </FormDialog>
  )
}

// ─────────────────────────────────────────
// Checklist kelengkapan (dipakai serah terima & pengembalian)
// ─────────────────────────────────────────

const ChecklistField = ({
  value,
  onChange,
}: {
  value: HandoverChecklist
  onChange: (v: HandoverChecklist) => void
}) => (
  <div>
    <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.07em] text-[var(--text-secondary)]">
      Kelengkapan Kendaraan
    </p>
    <div className="grid grid-cols-1 gap-2 rounded-xl bg-[var(--bg-subtle)] p-3 sm:grid-cols-2">
      {HANDOVER_CHECKLIST.map((it) => (
        <label key={it.key} className="flex cursor-pointer items-center gap-2 text-sm text-[var(--text-primary)]">
          <input
            type="checkbox"
            className="h-4 w-4 accent-[var(--primary)]"
            checked={!!value[it.key]}
            onChange={(e) => onChange({ ...value, [it.key]: e.target.checked })}
          />
          {it.label}
        </label>
      ))}
    </div>
  </div>
)

// ─────────────────────────────────────────
// Serah terima ke vendor (→ IN_PROGRESS)
// ─────────────────────────────────────────

export const HandoverDialog = ({ m, open, onOpenChange, onWarning }: DialogProps) => {
  const [at, setAt] = useState('')
  const [odo, setOdo] = useState<number | undefined>()
  const [fuel, setFuel] = useState<FuelLevel | ''>('')
  const [receiver, setReceiver] = useState('')
  const [checklist, setChecklist] = useState<HandoverChecklist>({})
  const [note, setNote] = useState('')
  const mut = useHandoverMaintenance(m.id)

  useEffect(() => {
    if (!open) return
    setAt(nowWibInput())
    setOdo(m.vehicle.currentOdometer || undefined)
    setFuel('')
    setReceiver(m.vendor?.picName ?? '')
    setChecklist({ stnk: true, mainKey: true })
    setNote('')
    mut.reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const submit = () =>
    mut.mutate(
      {
        handoverAt: fromWibInput(at),
        odometer: odo,
        fuelLevel: fuel || undefined,
        receiverName: receiver.trim(),
        checklist,
        note: note.trim() || undefined,
      },
      {
        onSuccess: (r) => {
          if (r.warning) onWarning?.(r.warning)
          onOpenChange(false)
        },
      },
    )

  return (
    <FormDialog
      wide
      open={open}
      onOpenChange={onOpenChange}
      title="Serah Terima ke Vendor"
      icon={<KeyRound className="h-5 w-5 text-[var(--primary)]" />}
      footer={
        <>
          <AppButton variant="secondary" onClick={() => onOpenChange(false)}>Batal</AppButton>
          <AppButton loading={mut.isPending} disabled={!receiver.trim()} onClick={submit}>
            Catat Serah Terima
          </AppButton>
        </>
      }
    >
      <ErrorAlert error={mut.error} />
      <WarningAlert>
        Setelah diserahkan, kendaraan berstatus <b>MAINTENANCE</b> dan tidak bisa dibooking sampai
        diterima kembali.
      </WarningAlert>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InputDateTime label="Waktu Serah Terima" required value={at} onChange={(e) => setAt(e.target.value)} />
        <InputText label="Diterima oleh (pihak vendor)" required value={receiver} onChange={(e) => setReceiver(e.target.value)} />
        <InputNumber
          label="Odometer (km)"
          min={0}
          value={odo ?? ''}
          onChange={setOdo}
          hint={`Tercatat: ${formatNumber(m.vehicle.currentOdometer)} km`}
        />
        <InputSelect
          label="Level BBM"
          placeholder="Pilih level"
          options={FUEL_LEVEL_OPTIONS}
          value={fuel}
          onChange={(e) => setFuel(e.target.value as FuelLevel | '')}
        />
      </div>
      <ChecklistField value={checklist} onChange={setChecklist} />
      <InputTextArea label="Catatan Kondisi (opsional)" rows={2} placeholder="mis. Baret halus bumper belakang" value={note} onChange={(e) => setNote(e.target.value)} />
    </FormDialog>
  )
}

// ─────────────────────────────────────────
// Kendaraan kembali dari vendor (→ COMPLETED)
// ─────────────────────────────────────────

export const ReturnDialog = ({ m, open, onOpenChange }: DialogProps) => {
  const [at, setAt] = useState('')
  const [odo, setOdo] = useState<number | undefined>()
  const [fuel, setFuel] = useState<FuelLevel | ''>('')
  const [handler, setHandler] = useState('')
  const [checklist, setChecklist] = useState<HandoverChecklist>({})
  const [workDone, setWorkDone] = useState('')
  const [parts, setParts] = useState('')
  const [note, setNote] = useState('')
  const [cost, setCost] = useState<number | undefined>()
  const [bearer, setBearer] = useState<MaintenanceCostBearer | ''>('')
  const mut = useReturnMaintenance(m.id)

  useEffect(() => {
    if (!open) return
    setAt(nowWibInput())
    setOdo(m.handover?.odometer ?? (m.vehicle.currentOdometer || undefined))
    setFuel('')
    setHandler(m.handover?.receiverName ?? '')
    setChecklist(m.handover?.checklist ?? {})
    setWorkDone('')
    setParts('')
    setNote('')
    setCost(m.actualCost ?? undefined)
    setBearer(m.costBearer ?? '')
    mut.reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const submit = () =>
    mut.mutate(
      {
        returnedAt: fromWibInput(at),
        odometer: odo,
        fuelLevel: fuel || undefined,
        handlerName: handler.trim() || undefined,
        checklist,
        workDone: workDone.trim(),
        partsReplaced: parts.trim() || undefined,
        note: note.trim() || undefined,
        actualCost: cost,
        costBearer: bearer || undefined,
      },
      { onSuccess: () => onOpenChange(false) },
    )

  return (
    <FormDialog
      wide
      open={open}
      onOpenChange={onOpenChange}
      title="Terima Kembali dari Vendor"
      icon={<PackageCheck className="h-5 w-5 text-[var(--success)]" />}
      footer={
        <>
          <AppButton variant="secondary" onClick={() => onOpenChange(false)}>Batal</AppButton>
          <AppButton loading={mut.isPending} disabled={!workDone.trim()} onClick={submit}>
            Selesaikan Maintenance
          </AppButton>
        </>
      }
    >
      <ErrorAlert error={mut.error} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InputDateTime label="Waktu Kembali" required value={at} onChange={(e) => setAt(e.target.value)} />
        <InputText label="Diserahkan oleh (pihak vendor)" value={handler} onChange={(e) => setHandler(e.target.value)} />
        <InputNumber
          label="Odometer Kembali (km)"
          min={0}
          value={odo ?? ''}
          onChange={setOdo}
          hint={m.handover?.odometer ? `Saat diserahkan: ${formatNumber(m.handover.odometer)} km` : undefined}
        />
        <InputSelect
          label="Level BBM"
          placeholder="Pilih level"
          options={FUEL_LEVEL_OPTIONS}
          value={fuel}
          onChange={(e) => setFuel(e.target.value as FuelLevel | '')}
        />
      </div>
      <InputTextArea label="Pekerjaan yang Dilakukan" required rows={3} value={workDone} onChange={(e) => setWorkDone(e.target.value)} />
      <InputTextArea label="Part yang Diganti (opsional)" rows={2} value={parts} onChange={(e) => setParts(e.target.value)} />
      <ChecklistField value={checklist} onChange={setChecklist} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InputRupiah label="Biaya Aktual (opsional)" value={cost} onChange={setCost} hint="Boleh diisi nanti" />
        <InputSelect
          label="Biaya Ditanggung"
          placeholder="Belum diisi"
          options={COST_BEARER_OPTIONS}
          value={bearer}
          onChange={(e) => setBearer(e.target.value as MaintenanceCostBearer | '')}
        />
      </div>
      <InputTextArea label="Catatan (opsional)" rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
    </FormDialog>
  )
}

// ─────────────────────────────────────────
// Batalkan pengajuan (sebelum diserahkan)
// ─────────────────────────────────────────

export const CancelDialog = ({ m, open, onOpenChange }: DialogProps) => {
  const [reason, setReason] = useState('')
  const mut = useCancelMaintenance(m.id)
  const needReason = m.status !== 'DRAFT'

  useEffect(() => {
    if (open) {
      setReason('')
      mut.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Batalkan Pengajuan"
      icon={<XCircle className="h-5 w-5 text-[var(--danger)]" />}
      footer={
        <>
          <AppButton variant="secondary" onClick={() => onOpenChange(false)}>Kembali</AppButton>
          <AppButton
            variant="danger"
            loading={mut.isPending}
            disabled={needReason && !reason.trim()}
            onClick={() => mut.mutate(reason.trim(), { onSuccess: () => onOpenChange(false) })}
          >
            Batalkan
          </AppButton>
        </>
      }
    >
      <ErrorAlert error={mut.error} />
      <p className="text-sm text-[var(--text-secondary)]">
        Tanggal yang diblokir untuk maintenance ini akan dibuka kembali untuk booking.
      </p>
      <InputTextArea
        label="Alasan Pembatalan"
        required={needReason}
        rows={3}
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      />
    </FormDialog>
  )
}

// ─────────────────────────────────────────
// Biaya (bebas diisi kapan saja)
// ─────────────────────────────────────────

export const CostDialog = ({ m, open, onOpenChange }: DialogProps) => {
  const [est, setEst] = useState<number | undefined>()
  const [actual, setActual] = useState<number | undefined>()
  const [bearer, setBearer] = useState<MaintenanceCostBearer | ''>('')
  const mut = useUpdateMaintenanceCost(m.id)

  useEffect(() => {
    if (!open) return
    setEst(m.estimatedCost ?? undefined)
    setActual(m.actualCost ?? undefined)
    setBearer(m.costBearer ?? '')
    mut.reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Ubah Biaya"
      icon={<Coins className="h-5 w-5 text-[var(--primary)]" />}
      footer={
        <>
          <AppButton variant="secondary" onClick={() => onOpenChange(false)}>Batal</AppButton>
          <AppButton
            loading={mut.isPending}
            onClick={() =>
              mut.mutate(
                { estimatedCost: est, actualCost: actual, costBearer: bearer || undefined },
                { onSuccess: () => onOpenChange(false) },
              )
            }
          >
            Simpan
          </AppButton>
        </>
      }
    >
      <ErrorAlert error={mut.error} />
      <InputRupiah label="Estimasi Biaya" value={est} onChange={setEst} />
      <InputRupiah label="Biaya Aktual" value={actual} onChange={setActual} />
      <InputSelect
        label="Biaya Ditanggung"
        placeholder="Belum diisi"
        options={COST_BEARER_OPTIONS}
        value={bearer}
        onChange={(e) => setBearer(e.target.value as MaintenanceCostBearer | '')}
      />
    </FormDialog>
  )
}
