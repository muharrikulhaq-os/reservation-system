'use client'

import { useState } from 'react'
import { Plus, UserRound, X } from 'lucide-react'
import { AppButton, AppLabel, InputText } from '@/components/ui-custom'
import type { GuestPassenger } from '@/types'

// ─────────────────────────────────────────
// TAMU TANPA AKUN (penumpang booking kendaraan)
// Nama wajib; nomor HP & keterangan (instansi/jabatan) opsional. Tamu tidak
// mendapat notifikasi dan tidak bisa membuka booking.
// ─────────────────────────────────────────

interface Props {
  value: GuestPassenger[]
  onChange: (v: GuestPassenger[]) => void
  /** Sisa kursi untuk tamu; 0 = penuh. undefined = tanpa batas. */
  remaining?: number
}

export const GuestPassengersInput = ({ value, onChange, remaining }: Props) => {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [note, setNote] = useState('')
  const full = remaining != null && remaining <= 0

  const add = () => {
    if (!name.trim() || full) return
    onChange([...value, { name: name.trim(), phoneNumber: phone.trim() || undefined, note: note.trim() || undefined }])
    setName('')
    setPhone('')
    setNote('')
    setOpen(false)
  }

  return (
    <div>
      <AppLabel>Tamu (tanpa akun)</AppLabel>
      {value.length > 0 && (
        <ul className="mb-2 flex flex-wrap gap-2">
          {value.map((g, i) => (
            <li
              key={`${g.name}-${i}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-card)] bg-[var(--bg-subtle)] py-1 pl-2 pr-2 text-xs text-[var(--text-primary)]"
            >
              <UserRound className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
              <span className="font-medium">{g.name}</span>
              {(g.note || g.phoneNumber) && (
                <span className="text-[var(--text-secondary)]">· {[g.note, g.phoneNumber].filter(Boolean).join(' · ')}</span>
              )}
              <button
                type="button"
                onClick={() => onChange(value.filter((_, j) => j !== i))}
                className="ml-0.5 rounded-full p-0.5 text-[var(--text-secondary)] hover:bg-red-50 hover:text-[var(--danger)]"
                aria-label={`Hapus ${g.name}`}
              >
                <X className="h-3 w-3" />
              </button>
            </li>
          ))}
        </ul>
      )}
      {open ? (
        <div className="space-y-3 rounded-xl bg-[var(--bg-subtle)] p-3">
          <InputText label="Nama" required value={name} onChange={(e) => setName(e.target.value)} placeholder="mis. Pak Joko" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <InputText label="Nomor HP" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="opsional" />
            <InputText label="Keterangan" value={note} onChange={(e) => setNote(e.target.value)} placeholder="mis. Dinas PU / vendor" />
          </div>
          <div className="flex justify-end gap-2">
            <AppButton size="sm" variant="ghost" onClick={() => setOpen(false)}>
              Batal
            </AppButton>
            <AppButton size="sm" disabled={!name.trim()} onClick={add}>
              Tambahkan
            </AppButton>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={full}
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1 text-sm font-medium text-[var(--primary)] hover:underline disabled:cursor-not-allowed disabled:text-[var(--text-disabled)] disabled:no-underline"
        >
          <Plus className="h-4 w-4" /> {full ? 'Kapasitas kendaraan sudah penuh' : 'Tambah tamu'}
        </button>
      )}
    </div>
  )
}
