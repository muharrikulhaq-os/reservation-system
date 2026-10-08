// ─────────────────────────────────────────
// REVERSE GEOCODING - koordinat "lat, long" → alamat yang bisa dibaca
// Lokasi dari HP supir (laporan pengembalian, lokasi berangkat, laporan
// kendala) tersimpan sebagai koordinat. Ditampilkan sebagai alamat lewat
// OpenStreetMap Nominatim (tanpa API key). Kebijakan Nominatim: maks. 1
// request/detik + hasil di-cache - jadi request diantrikan berjeda dan
// hasilnya disimpan (memori + localStorage) per koordinat.
// Hanya untuk TAMPILAN; nilai asli di server tidak diubah.
// ─────────────────────────────────────────

export interface LatLong {
  lat: number
  lng: number
}

const LAT_LONG_RE = /^\s*(-?\d{1,3}(?:\.\d+)?)\s*,\s*(-?\d{1,3}(?:\.\d+)?)\s*$/

/** `"-6.2088, 106.8456"` → `{lat, lng}`; null bila bukan koordinat valid. */
export const parseLatLong = (value?: string | null): LatLong | null => {
  if (!value) return null
  const m = LAT_LONG_RE.exec(value)
  if (!m) return null
  const lat = Number(m[1])
  const lng = Number(m[2])
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null
  return { lat, lng }
}

const STORAGE_PREFIX = 'geo:v1:'
const NOMINATIM_GAP_MS = 1100

// ~1 m presisi - koordinat yang sama persis berbagi satu hasil.
const keyOf = ({ lat, lng }: LatLong) => `${lat.toFixed(5)},${lng.toFixed(5)}`

const memory = new Map<string, Promise<string | null>>()
let queue: Promise<unknown> = Promise.resolve()

const readStored = (key: string): string | null => {
  try {
    return localStorage.getItem(STORAGE_PREFIX + key)
  } catch {
    return null
  }
}

const writeStored = (key: string, value: string) => {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, value)
  } catch {
    // penyimpanan penuh / diblokir - cukup cache memori
  }
}

interface NominatimAddress {
  road?: string
  house_number?: string
  neighbourhood?: string
  suburb?: string
  village?: string
  city_district?: string
  city?: string
  town?: string
  county?: string
  state?: string
}

/** Rangkai alamat ringkas: jalan + nomor, kelurahan, kecamatan, kota, provinsi. */
const formatAddress = (a: NominatimAddress, fallback?: string): string | null => {
  const road = a.road ? [a.road, a.house_number].filter(Boolean).join(' No. ') : undefined
  const raw = [
    road,
    a.neighbourhood ?? a.suburb ?? a.village,
    a.city_district,
    a.city ?? a.town ?? a.county,
    a.state,
  ]
  const parts: string[] = []
  for (const s of raw) {
    const v = s?.trim()
    if (!v) continue
    const lower = v.toLowerCase()
    if (parts.some((p) => p.toLowerCase().includes(lower) || lower.includes(p.toLowerCase()))) continue
    parts.push(v)
  }
  return parts.length ? parts.join(', ') : (fallback?.trim() || null)
}

const fetchAddress = async ({ lat, lng }: LatLong): Promise<string | null> => {
  const url =
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=18&addressdetails=1` +
    `&accept-language=id&lat=${lat}&lon=${lng}`
  const res = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!res.ok) return null
  const body = (await res.json()) as { address?: NominatimAddress; display_name?: string }
  return body.address ? formatAddress(body.address, body.display_name) : (body.display_name ?? null)
}

/**
 * Alamat untuk koordinat [point] (best-effort): null bila gagal. Hasil
 * sukses di-cache permanen di browser; kegagalan tidak di-cache sehingga
 * dicoba lagi saat halaman dibuka berikutnya.
 */
export const reverseGeocode = (point: LatLong): Promise<string | null> => {
  const key = keyOf(point)
  const cached = memory.get(key)
  if (cached) return cached

  const stored = readStored(key)
  if (stored) {
    const p = Promise.resolve(stored)
    memory.set(key, p)
    return p
  }

  // Antre berjeda supaya tidak melebihi 1 request/detik.
  const job = queue.then(async () => {
    try {
      const address = await fetchAddress(point)
      if (address) writeStored(key, address)
      else memory.delete(key)
      return address
    } catch {
      memory.delete(key)
      return null
    } finally {
      await new Promise((r) => setTimeout(r, NOMINATIM_GAP_MS))
    }
  })
  queue = job.catch(() => undefined)
  memory.set(key, job)
  return job
}
