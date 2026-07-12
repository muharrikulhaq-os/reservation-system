import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─────────────────────────────────────────
// STAR RATING (read-only)
// Menampilkan nilai 1–5 sebagai bintang terisi.
// ─────────────────────────────────────────

interface StarRatingProps {
  value: number
  /** Ukuran ikon tailwind, mis. 'h-4 w-4' */
  size?: string
  className?: string
}

export const StarRating = ({
  value,
  size = 'h-4 w-4',
  className,
}: StarRatingProps) => (
  <div className={cn('inline-flex items-center gap-0.5', className)}>
    {[1, 2, 3, 4, 5].map((n) => (
      <Star
        key={n}
        className={cn(
          size,
          n <= Math.round(value)
            ? 'fill-[#F59E0B] text-[#F59E0B]'
            : 'text-[var(--border-input)]',
        )}
      />
    ))}
  </div>
)
