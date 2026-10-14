'use client'

import { useEffect, useRef, useState } from 'react'
import { AlertCircle, Receipt } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AppButton, AppLabel, InputFile, InputRupiah, InputText, InputTextArea } from '@/components/ui-custom'
import { cn, getErrorMessage } from '@/lib'
import { useDebounce } from '@/hooks'
import type {
  TripExpenseCategory,
  TripExpenseMode,
  TripPaymentMethod,
  TripTollPoint,
} from '@/types'
import { useCreateTripExpense, useTollGateSuggestions } from '../hooks/useTripExpenses'

// ─────────────────────────────────────────
// CATAT BIAYA PERJALANAN
// SIMPLE: tol masuk/keluar + nominal + foto struk.
// FULL  : tol/parkir/lainnya, gerbang (dengan saran), cara bayar.
// ─────────────────────────────────────────

interface Props {
  bookingId: number
  mode: TripExpenseMode
  open: boolean
  onOpenChange: (open: boolean) => void
}

const Segmented = <T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: T | undefined
  onChange: (v: T) => void
  options: { value: T; label: string }[]
}) => (
  <div>
    <AppLabel required>{label}</AppLabel>
    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          aria-pressed={value === o.value}
          className={cn(
            'h-10 rounded-lg border text-sm font-medium transition-colors',
            value === o.value
              ? 'border-[var(--primary)] bg-[var(--primary-light)] text-[var(--primary)]'
              : 'border-[var(--border-input)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  </div>
)

/** Isian nama gerbang + saran gerbang yang pernah dipakai. */
const GateInput = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => {
  const [focused, setFocused] = useState(false)
  const q = useDebounce(value.trim(), 250)
  const { data: suggestions } = useTollGateSuggestions(q, focused)
  const list = (suggestions ?? []).filter((s) => s.toLowerCase() !== value.trim().toLowerCase())
  const blurTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  return (
    <div className="relative">
      <InputText
        label={label}
        placeholder="mis. Cikunir 1"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          blurTimer.current = setTimeout(() => setFocused(false), 150)
        }}
        autoComplete="off"
      />
      {focused && list.length > 0 && (
        <ul className="absolute z-50 mt-1 max-h-48 w-full overflow-auto rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] p-1 shadow-[0_4px_16px_rgba(0,0,0,0.10)]">
          {list.map((s) => (
            <li key={s}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  clearTimeout(blurTimer.current)
                  onChange(s)
                  setFocused(false)
                }}
                className="w-full rounded-lg px-3 py-2 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--primary-light)] hover:text-[var(--primary)]"
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export const TripExpenseModal = ({ bookingId, mode, open, onOpenChange }: Props) => {
  const create = useCreateTripExpense(bookingId)
  const full = mode === 'FULL'

  const [category, setCategory] = useState<TripExpenseCategory>('TOLL')
  const [tollPoint, setTollPoint] = useState<TripTollPoint>()
  const [entryGate, setEntryGate] = useState('')
  const [exitGate, setExitGate] = useState('')
  const [payment, setPayment] = useState<TripPaymentMethod>()
  const [amount, setAmount] = useState<number>()
  const [photo, setPhoto] = useState<File | null>(null)
  const [note, setNote] = useState('')
  const [fileKey, setFileKey] = useState(0)

  useEffect(() => {
    if (!open) return
    setCategory('TOLL')
    setTollPoint(undefined)
    setEntryGate('')
    setExitGate('')
    setPayment(undefined)
    setAmount(undefined)
    setPhoto(null)
    setNote('')
    setFileKey((k) => k + 1)
    create.reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const isToll = category === 'TOLL'
  const canSubmit =
    !!amount && amount > 0 && !!photo &&
    (full
      ? !!payment &&
        (!isToll || entryGate.trim() !== '' || exitGate.trim() !== '') &&
        (category !== 'OTHER' || note.trim() !== '')
      : !!tollPoint)

  const submit = async () => {
    if (!canSubmit || !photo || !amount) return
    try {
      await create.mutateAsync(
        full
          ? {
              amount,
              proofPhoto: photo,
              category,
              entryGate: isToll ? entryGate.trim() : undefined,
              exitGate: isToll ? exitGate.trim() : undefined,
              paymentMethod: payment,
              note: note.trim() || undefined,
            }
          : { amount, proofPhoto: photo, category: 'TOLL', tollPoint, note: note.trim() || undefined },
      )
      onOpenChange(false)
    } catch {
      // ditampilkan via create.error
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl p-6 shadow-[var(--shadow-modal)] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-[var(--text-primary)]">
            <Receipt className="h-5 w-5 text-[var(--primary)]" />
            {full ? 'Catat Biaya Perjalanan' : 'Catat Tol'}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-2 space-y-4">
          {create.error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{getErrorMessage(create.error)}</span>
            </div>
          )}

          {full ? (
            <>
              <Segmented
                label="Jenis Biaya"
                value={category}
                onChange={setCategory}
                options={[
                  { value: 'TOLL', label: 'Tol' },
                  { value: 'PARKING', label: 'Parkir' },
                  { value: 'OTHER', label: 'Lainnya' },
                ]}
              />
              {isToll && (
                <div className="grid grid-cols-2 gap-3">
                  <GateInput label="Gerbang Masuk" value={entryGate} onChange={setEntryGate} />
                  <GateInput label="Gerbang Keluar" value={exitGate} onChange={setExitGate} />
                </div>
              )}
              <Segmented
                label="Dibayar Dengan"
                value={payment}
                onChange={setPayment}
                options={[
                  { value: 'COMPANY_EMONEY', label: 'E-money Kantor' },
                  { value: 'PERSONAL', label: 'Uang Pribadi' },
                ]}
              />
              {payment === 'PERSONAL' && (
                <p className="-mt-2 text-xs text-[var(--text-secondary)]">
                  Akan masuk daftar reimburse supir.
                </p>
              )}
            </>
          ) : (
            <Segmented
              label="Titik Bayar"
              value={tollPoint}
              onChange={setTollPoint}
              options={[
                { value: 'ENTRY', label: 'Tol Masuk' },
                { value: 'EXIT', label: 'Tol Keluar' },
              ]}
            />
          )}

          <InputRupiah label="Nominal (Rp)" required value={amount} onChange={setAmount} placeholder="mis. 12.500" />

          <InputFile
            key={fileKey}
            label="Foto Struk / Bukti Bayar"
            required
            accept="image/jpeg,image/png"
            maxSizeMb={5}
            onChange={(files) => setPhoto(files[0] ?? null)}
          />

          <InputTextArea
            label={full && category === 'OTHER' ? 'Keterangan' : 'Catatan (opsional)'}
            required={full && category === 'OTHER'}
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />

          <div className="flex gap-3 pt-1">
            <AppButton variant="secondary" fullWidth onClick={() => onOpenChange(false)}>
              Batal
            </AppButton>
            <AppButton fullWidth loading={create.isPending} disabled={!canSubmit} onClick={submit}>
              Simpan
            </AppButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
