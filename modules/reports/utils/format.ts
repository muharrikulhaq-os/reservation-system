// ─────────────────────────────────────────
// REPORT FORMAT HELPERS
// ─────────────────────────────────────────

const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
]

// "2025-06" → "Jun", "2025-W22" → "W22", "2025-08-15" → "15 Agu", lainnya → apa adanya
export const formatPeriodShort = (period: string): string => {
  if (/^\d{4}-\d{2}-\d{2}$/.test(period)) {
    const [, m, d] = period.split('-')
    return `${Number(d)} ${MONTH_SHORT[Number(m) - 1] ?? m}`
  }
  if (/^\d{4}-\d{2}$/.test(period)) {
    const month = Number(period.slice(5, 7))
    return MONTH_SHORT[month - 1] ?? period
  }
  if (/^\d{4}-W\d{1,2}$/.test(period)) {
    return period.slice(5)
  }
  return period
}

// ─────────────────────────────────────────
// TREND GRANULARITY
// Grafik trend (Booking/Cost) dulu selalu jendela tetap (12/6 bulan
// terakhir), sekarang mengikuti rentang tanggal yang dipilih user - fungsi
// ini yang memilih groupBy (daily/weekly/monthly) berdasarkan lebar
// rentangnya, supaya grafik tetap terbaca (tidak 1 titik untuk "Hari Ini",
// atau ratusan titik harian untuk rentang 12 bulan).
// ─────────────────────────────────────────

export type TrendGroupBy = 'daily' | 'weekly' | 'monthly'

export const pickTrendGranularity = (startDate: string, endDate: string): TrendGroupBy => {
  const spanDays =
    (new Date(endDate).getTime() - new Date(startDate).getTime()) / 86_400_000
  if (spanDays <= 31) return 'daily'
  if (spanDays <= 180) return 'weekly'
  return 'monthly'
}

// Bintang rating: "★★★★☆"
export const ratingStars = (rating: number): string => {
  const full = Math.round(rating)
  return '★'.repeat(full) + '☆'.repeat(Math.max(0, 5 - full))
}
