'use client'

// ─────────────────────────────────────────
// useMutation dengan penjaga kirim-ganda
// Pengganti langsung `useMutation` TanStack untuk mutasi TULIS.
// ─────────────────────────────────────────
//
// Masalah: `isPending` baru menonaktifkan tombol setelah React render ulang,
// dan `handleSubmit` react-hook-form menunggu validasi (async) dulu — dua klik
// cepat sama-sama lolos dan mengirim DUA request (mis. booking ganda). Setelah
// berhasil, halaman masih terlihat selama router.push memuat rute tujuan, jadi
// klik di sela itu juga mengirim ulang.
//
// Penjaga (per instance hook, dipasang SINKRON saat mutate dipanggil):
// - request IDENTIK (variabel sama) yang sedang berjalan → diabaikan;
// - request identik yang BERHASIL < RECENT_MS lalu → diabaikan.
// Request berbeda (mis. menyetujui baris lain) tetap jalan.
// Panggilan yang diabaikan: `mutate` tidak melakukan apa-apa; `mutateAsync`
// mengembalikan promise yang tidak pernah selesai, sehingga kode setelah
// `await` (toast, tutup modal, navigasi) tidak dijalankan dua kali.
//
// Jangan dipakai untuk "mutasi" baca seperti pratinjau hitungan — pakai
// `useMutation` dari @tanstack/react-query langsung.

import { useCallback, useState } from 'react'
import {
  useMutation as useTanstackMutation,
  type DefaultError,
  type MutateOptions,
  type QueryClient,
  type UseMutationOptions,
  type UseMutationResult,
} from '@tanstack/react-query'

/** Jendela setelah berhasil di mana request identik dianggap klik ganda. */
const RECENT_MS = 2000

/** Kunci stabil dari variabel mutasi (FormData & File ikut dibedakan). */
export function mutationKey(value: unknown): string {
  const seen = new WeakSet<object>()
  const norm = (v: unknown): unknown => {
    if (typeof File !== 'undefined' && v instanceof File) {
      return { file: v.name, size: v.size, modified: v.lastModified }
    }
    if (typeof Blob !== 'undefined' && v instanceof Blob) {
      return { blob: v.type, size: v.size }
    }
    if (typeof FormData !== 'undefined' && v instanceof FormData) {
      return { formData: Array.from(v.entries()).map(([k, x]) => [k, norm(x)]) }
    }
    if (v instanceof Date) return { date: v.toISOString() }
    if (v && typeof v === 'object') {
      if (seen.has(v)) return '[circular]'
      seen.add(v)
      if (Array.isArray(v)) return v.map(norm)
      return Object.fromEntries(
        Object.keys(v as Record<string, unknown>)
          .sort()
          .map((k) => [k, norm((v as Record<string, unknown>)[k])]),
      )
    }
    return v
  }
  return JSON.stringify(norm(value) ?? null)
}

/** Status penjaga satu instance hook — terpisah agar bisa diuji tanpa React. */
export class SubmitGuard {
  private inFlight = new Set<string>()
  private recent = new Map<string, number>()

  constructor(private readonly now: () => number = Date.now) {}

  /** `true` bila boleh dikirim (lalu ditandai sedang berjalan). */
  begin(key: string): boolean {
    if (this.inFlight.has(key)) return false
    const at = this.recent.get(key)
    if (at !== undefined && this.now() - at < RECENT_MS) return false
    this.inFlight.add(key)
    return true
  }

  end(key: string, success: boolean): void {
    this.inFlight.delete(key)
    if (success) this.recent.set(key, this.now())
    else this.recent.delete(key)
  }
}

export function useMutation<
  TData = unknown,
  TError = DefaultError,
  TVariables = void,
  TContext = unknown,
>(
  options: UseMutationOptions<TData, TError, TVariables, TContext>,
  queryClient?: QueryClient,
): UseMutationResult<TData, TError, TVariables, TContext> {
  const result = useTanstackMutation(options, queryClient)
  const [guard] = useState(() => new SubmitGuard())
  const { mutateAsync: rawMutateAsync } = result

  const mutateAsync = useCallback(
    (variables: TVariables, opts?: MutateOptions<TData, TError, TVariables, TContext>) => {
      const key = mutationKey(variables)
      if (!guard.begin(key)) return new Promise<TData>(() => {})
      return rawMutateAsync(variables, opts).then(
        (data) => {
          guard.end(key, true)
          return data
        },
        (err: unknown) => {
          guard.end(key, false)
          throw err
        },
      )
    },
    [guard, rawMutateAsync],
  )

  const mutate = useCallback(
    (variables: TVariables, opts?: MutateOptions<TData, TError, TVariables, TContext>) => {
      // Error sudah diteruskan ke onError / state `error`; jangan jadi
      // unhandled rejection (perilaku sama dengan mutate bawaan).
      mutateAsync(variables, opts).catch(() => {})
    },
    [mutateAsync],
  )

  return { ...result, mutate, mutateAsync } as UseMutationResult<TData, TError, TVariables, TContext>
}
