'use client'

import { useRef, useState } from 'react'
import { Search, UserPlus, X } from 'lucide-react'
import { AppLabel } from '@/components/ui-custom'
import { UserAvatar } from '@/components/shared'
import { useDebounce } from '@/hooks'
import type { UserLookup } from '@/types'
import { useUserLookup } from '../hooks/useBookings'

// ─────────────────────────────────────────
// PILIH KARYAWAN YANG IKUT (booking kendaraan)
// Cari nama / ID karyawan → pilih beberapa. Pemesan tidak perlu dipilih.
// Pencarian tidak memuat nomor HP; nomor tampil di detail booking.
// docs backend: RANCANGAN_PARKIR_PENUMPANG.md §3.
// ─────────────────────────────────────────

interface Props {
  value: UserLookup[]
  onChange: (v: UserLookup[]) => void
  /** Maksimal karyawan yang ikut (kapasitas − 1). */
  max?: number
  /** Disembunyikan dari hasil cari (mis. pemesan). */
  excludeIds?: number[]
  label?: string
}

export const PassengerPicker = ({ value, onChange, max, excludeIds = [], label = 'Karyawan yang Ikut' }: Props) => {
  const [q, setQ] = useState('')
  const [focused, setFocused] = useState(false)
  const debounced = useDebounce(q.trim(), 250)
  const { data, isFetching } = useUserLookup(debounced, focused)
  const blurTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const chosen = new Set(value.map((v) => v.id))
  const hidden = new Set(excludeIds)
  const results = (data ?? []).filter((u) => !chosen.has(u.id) && !hidden.has(u.id))
  const full = max != null && value.length >= max

  const add = (u: UserLookup) => {
    if (full) return
    onChange([...value, u])
    setQ('')
  }

  return (
    <div>
      <AppLabel>{label}</AppLabel>
      {value.length > 0 && (
        <ul className="mb-2 flex flex-wrap gap-2">
          {value.map((u) => (
            <li
              key={u.id}
              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-card)] bg-[var(--bg-subtle)] py-1 pl-1 pr-2 text-xs text-[var(--text-primary)]"
            >
              <UserAvatar name={u.name} size="xs" />
              <span className="font-medium">{u.name}</span>
              <span className="text-[var(--text-secondary)]">· {u.department}</span>
              <button
                type="button"
                onClick={() => onChange(value.filter((v) => v.id !== u.id))}
                className="ml-0.5 rounded-full p-0.5 text-[var(--text-secondary)] hover:bg-red-50 hover:text-[var(--danger)]"
                aria-label={`Hapus ${u.name}`}
              >
                <X className="h-3 w-3" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[var(--text-secondary)]">
          <Search className="h-4 w-4" />
        </span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            blurTimer.current = setTimeout(() => setFocused(false), 150)
          }}
          disabled={full}
          placeholder={full ? 'Kapasitas kendaraan sudah penuh' : 'Cari nama atau ID karyawan'}
          className="h-10 w-full rounded-lg border border-[var(--border-input)] bg-[var(--bg-card)] pl-9 pr-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-disabled)] transition-all duration-150 focus:border-[1.5px] focus:border-[var(--primary)] focus:outline-none disabled:cursor-not-allowed disabled:bg-[var(--bg-subtle)]"
        />
        {focused && !full && (
          <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] p-1 shadow-[0_4px_16px_rgba(0,0,0,0.10)]">
            {results.length === 0 ? (
              <li className="px-3 py-2 text-sm text-[var(--text-disabled)]">
                {isFetching ? 'Mencari…' : 'Karyawan tidak ditemukan'}
              </li>
            ) : (
              results.map((u) => (
                <li key={u.id}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      clearTimeout(blurTimer.current)
                      add(u)
                    }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left hover:bg-[var(--primary-light)]"
                  >
                    <UserPlus className="h-4 w-4 shrink-0 text-[var(--primary)]" />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-[var(--text-primary)]">{u.name}</span>
                      <span className="block truncate text-xs text-[var(--text-secondary)]">
                        {u.employeeId} · {u.department}
                      </span>
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>
        )}
      </div>
      <p className="mt-1.5 text-xs text-[var(--text-secondary)]">
        Opsional. Booking tetap atas nama Anda; karyawan yang ikut mendapat notifikasi dan bisa melihat detail perjalanan.
        {max != null && ` Maksimal ${max} orang.`}
      </p>
    </div>
  )
}
