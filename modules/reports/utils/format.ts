// ─────────────────────────────────────────
// REPORT FORMAT HELPERS
// ─────────────────────────────────────────

const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
]

// "2025-06" → "Jun", "2025-W22" → "W22", lainnya → apa adanya
export const formatPeriodShort = (period: string): string => {
  if (/^\d{4}-\d{2}$/.test(period)) {
    const month = Number(period.slice(5, 7))
    return MONTH_SHORT[month - 1] ?? period
  }
  if (/^\d{4}-W\d{1,2}$/.test(period)) {
    return period.slice(5)
  }
  return period
}

// Bintang rating: "★★★★☆"
export const ratingStars = (rating: number): string => {
  const full = Math.round(rating)
  return '★'.repeat(full) + '☆'.repeat(Math.max(0, 5 - full))
}
