// ─────────────────────────────────────────
// DIALOG - pengganti window.alert / confirm / prompt.
// Popup bawaan browser tidak bisa diberi tema, jadi pemanggilan
// diantrekan di sini lalu digambar oleh <AppDialogHost /> (app/layout).
//
//   await appAlert({ title: 'Tersimpan', description: res.warning })
//   if (await appConfirm({ title: 'Hapus vendor?', tone: 'danger' })) ...
//   const note = await appPrompt({ title: 'Tolak booking', label: 'Alasan' })
// ─────────────────────────────────────────

import type { ReactNode } from 'react'

export type DialogTone = 'primary' | 'danger' | 'warning' | 'success'

interface BaseOptions {
  title: string
  description?: ReactNode
  tone?: DialogTone
  /** Ganti ikon bawaan tone (danger = tempat sampah, cocok untuk hapus). */
  icon?: ReactNode
  /** Teks tombol utama. */
  confirmText?: string
}

export type AlertOptions = BaseOptions

export interface ConfirmOptions extends BaseOptions {
  cancelText?: string
}

export interface PromptOptions extends ConfirmOptions {
  label?: string
  placeholder?: string
  defaultValue?: string
  /** Tombol utama nonaktif selama isian kosong. Default true. */
  required?: boolean
  multiline?: boolean
}

export type DialogRequest =
  | { id: number; kind: 'alert'; options: AlertOptions; resolve: (v: void) => void }
  | { id: number; kind: 'confirm'; options: ConfirmOptions; resolve: (v: boolean) => void }
  | { id: number; kind: 'prompt'; options: PromptOptions; resolve: (v: string | null) => void }

type DistributiveOmit<T, K extends keyof T> = T extends unknown ? Omit<T, K> : never

let queue: DialogRequest[] = []
let nextId = 1
const listeners = new Set<() => void>()

const emit = () => listeners.forEach((l) => l())

const push = (req: DistributiveOmit<DialogRequest, 'id'>) => {
  queue = [...queue, { ...req, id: nextId++ } as DialogRequest]
  emit()
}

/** Dipakai AppDialogHost. */
export const dialogStore = {
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },
  /** Dialog yang sedang tampil (antrean terdepan). */
  current: (): DialogRequest | null => queue[0] ?? null,
  /** Tutup dialog `id` dan lanjut ke antrean berikutnya. */
  close(id: number) {
    queue = queue.filter((r) => r.id !== id)
    emit()
  },
}

const normalize = <T extends BaseOptions>(o: T | string): T =>
  (typeof o === 'string' ? { title: o } : o) as T

/** Popup informasi dengan satu tombol "Oke". */
export const appAlert = (options: AlertOptions | string) =>
  new Promise<void>((resolve) =>
    push({ kind: 'alert', options: normalize(options), resolve }),
  )

/** Popup konfirmasi; true bila tombol utama ditekan. */
export const appConfirm = (options: ConfirmOptions | string) =>
  new Promise<boolean>((resolve) =>
    push({ kind: 'confirm', options: normalize(options), resolve }),
  )

/** Popup isian teks; null bila dibatalkan. Nilai sudah di-trim. */
export const appPrompt = (options: PromptOptions | string) =>
  new Promise<string | null>((resolve) =>
    push({ kind: 'prompt', options: normalize(options), resolve }),
  )
