// ─────────────────────────────────────────
// INFO KM TERAKHIR - teks hint seragam di bawah setiap input odometer
// (mulai perjalanan, laporan pengembalian, isi BBM, voucher, maintenance)
// supaya pengisi tahu angka terakhir yang tercatat sebelum mengetik.
// Baris pertama biasanya km terakhir kendaraan; baris lain sesuai konteks.
// ─────────────────────────────────────────

export type KmLine = [label: string, km: number | null | undefined]

const fmt = new Intl.NumberFormat('id-ID')

/** `10300` → `10.300 km`; kosong → `belum tercatat`. */
export const formatKm = (km?: number | null) =>
  km == null ? 'belum tercatat' : `${fmt.format(km)} km`

/** `[['Km terakhir kendaraan', 10300], ...]` → `Km terakhir kendaraan: 10.300 km · ...` */
export const kmHint = (...lines: KmLine[]) =>
  lines.map(([label, km]) => `${label}: ${formatKm(km)}`).join(' · ')
