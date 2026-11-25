// ─────────────────────────────────────────
// NOTIFICATION SOUND (web saja)
// Bunyi "ding" dua nada saat notifikasi baru masuk lewat WebSocket.
// - Dibangkitkan Web Audio (tanpa file suara → tidak ada aset/unduhan).
// - Browser melarang audio sebelum pengguna berinteraksi dengan halaman
//   (kebijakan autoplay): AudioContext dibuka/di-resume pada klik/ketikan
//   pertama lewat prime(). Sebelum itu bunyi dilewati diam-diam - lonceng &
//   daftar notifikasi tetap ter-update.
// - Beberapa tab terbuka → semua menerima pesan yang sama; Web Locks +
//   localStorage memastikan satu notifikasi hanya berbunyi SEKALI.
// - Aktif/nonaktif disimpan per browser (localStorage), default aktif.
// ─────────────────────────────────────────

const ENABLED_KEY = 'kce:notif-sound'
const LAST_PLAYED_KEY = 'kce:notif-sound-last'
const LOCK_NAME = 'kce-notif-sound'

let ctx: AudioContext | null = null
let primed = false
const listeners = new Set<() => void>()

const readStorage = (key: string): string | null => {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

const writeStorage = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value)
  } catch {
    // mode privat / penyimpanan penuh - abaikan
  }
}

const getContext = (): AudioContext | null => {
  if (typeof window === 'undefined') return null
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return null
  if (!ctx) ctx = new Ctor()
  return ctx
}

const unlock = () => {
  const c = getContext()
  if (c && c.state === 'suspended') void c.resume()
}

// Satu nada: sinus dengan serangan cepat lalu meluruh (tidak "klik").
const tone = (c: AudioContext, freq: number, start: number, duration: number) => {
  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(freq, start)
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.exponentialRampToValueAtTime(0.25, start + 0.015)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)
  osc.connect(gain).connect(c.destination)
  osc.start(start)
  osc.stop(start + duration + 0.02)
}

const playChime = () => {
  const c = getContext()
  if (!c || c.state !== 'running') return
  const t = c.currentTime
  tone(c, 880, t, 0.35) // A5
  tone(c, 1318.5, t + 0.13, 0.5) // E6
}

export const notificationSound = {
  /** Pasang sekali: buka kunci audio pada interaksi pertama pengguna. */
  prime() {
    if (primed || typeof window === 'undefined') return
    primed = true
    for (const evt of ['pointerdown', 'keydown', 'touchstart'] as const) {
      window.addEventListener(evt, unlock, { passive: true })
    }
  },

  isEnabled(): boolean {
    return readStorage(ENABLED_KEY) !== '0'
  },

  setEnabled(enabled: boolean) {
    writeStorage(ENABLED_KEY, enabled ? '1' : '0')
    listeners.forEach((l) => l())
    // Klik tombol aktifkan = interaksi → sekalian bunyikan sebagai contoh.
    if (enabled) {
      unlock()
      setTimeout(playChime, 50)
    }
  },

  /** Untuk useSyncExternalStore - ikut berubah bila diubah di tab lain. */
  subscribe(listener: () => void) {
    listeners.add(listener)
    const onStorage = (e: StorageEvent) => {
      if (e.key === ENABLED_KEY) listener()
    }
    window.addEventListener('storage', onStorage)
    return () => {
      listeners.delete(listener)
      window.removeEventListener('storage', onStorage)
    }
  },

  /** Bunyikan untuk notifikasi `id` - sekali saja walau banyak tab terbuka. */
  play(id: number | string) {
    if (!this.isEnabled()) return
    const key = String(id)
    const claimAndPlay = () => {
      if (readStorage(LAST_PLAYED_KEY) === key) return
      writeStorage(LAST_PLAYED_KEY, key)
      playChime()
    }
    // Kunci eksklusif lintas tab → cek-lalu-tulis di atas jadi atomik.
    if (typeof navigator !== 'undefined' && navigator.locks) {
      void navigator.locks.request(LOCK_NAME, async () => claimAndPlay()).catch(playChime)
    } else {
      claimAndPlay()
    }
  },
}
