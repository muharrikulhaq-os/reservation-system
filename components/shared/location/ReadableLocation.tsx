'use client'

import { useEffect, useState } from 'react'
import { parseLatLong, reverseGeocode } from '@/lib'

// ─────────────────────────────────────────
// READABLE LOCATION
// Tampilkan lokasi sebagai ALAMAT. Bila nilainya koordinat "lat, long"
// (lokasi GPS dari HP supir), diubah lewat reverse geocoding; teks biasa
// (alamat yang diketik) ditampilkan apa adanya. Selama memuat / bila gagal,
// koordinat aslinya yang tampil supaya informasinya tidak hilang.
// ─────────────────────────────────────────

interface Props {
  value?: string | null
  fallback?: string
  /** Tampilkan koordinat kecil di bawah alamat (mis. di detail). */
  showCoordinates?: boolean
  className?: string
}

export const useReadableLocation = (value?: string | null) => {
  const point = parseLatLong(value)
  const [address, setAddress] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const lat = point?.lat
  const lng = point?.lng

  useEffect(() => {
    if (lat == null || lng == null) return
    let alive = true
    setLoading(true)
    reverseGeocode({ lat, lng }).then((a) => {
      if (!alive) return
      setAddress(a)
      setLoading(false)
    })
    return () => {
      alive = false
    }
  }, [lat, lng])

  return { isCoordinate: !!point, address, loading }
}

export const ReadableLocation = ({ value, fallback = '-', showCoordinates, className }: Props) => {
  const { isCoordinate, address, loading } = useReadableLocation(value)
  if (!value?.trim()) return <span className={className}>{fallback}</span>
  if (!isCoordinate) return <span className={className}>{value}</span>

  return (
    <span className={className}>
      {address ?? (loading ? 'Memuat alamat…' : value)}
      {showCoordinates && address && (
        <span className="block text-xs text-[var(--text-secondary)]">{value}</span>
      )}
    </span>
  )
}
