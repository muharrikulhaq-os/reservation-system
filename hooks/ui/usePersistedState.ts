'use client'

// ─────────────────────────────────────────
// usePersistedState
// State yang diingat antar kunjungan —
// untuk preferensi UI (mode tampilan, dsb),
// BUKAN untuk data server atau token.
//
// Nilai dibaca setelah mount (bukan saat
// inisialisasi state) supaya render pertama
// tetap sama dengan hasil SSR — kalau dibaca
// langsung di useState, hydration mismatch.
//
// Catatan mobile: saat porting ke React Native,
// ganti isi hook ini dengan AsyncStorage
// (API-nya async, jadi pola effect di bawah
// tetap berlaku).
// ─────────────────────────────────────────

import { useCallback, useEffect, useState } from 'react'

export const usePersistedState = <T,>(
  key: string,
  defaultValue: T,
): [T, (value: T) => void] => {
  const [value, setValue] = useState<T>(defaultValue)

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key)
      if (raw !== null) setValue(JSON.parse(raw) as T)
    } catch {
      // storage tidak tersedia / nilai korup — pakai default
    }
  }, [key])

  const set = useCallback(
    (next: T) => {
      setValue(next)
      try {
        window.localStorage.setItem(key, JSON.stringify(next))
      } catch {
        // storage penuh atau diblokir — state in-memory tetap jalan
      }
    },
    [key],
  )

  return [value, set]
}
