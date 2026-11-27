import { formatDate, formatTime } from '@/lib'

// ─────────────────────────────────────────
// DATE TIME CELL
// Tanggal di baris atas + jam (WIB) di bawahnya, satu sel - pola yang sama
// dengan kolom Resource (nama + keterangan). Dipakai kolom tanggal di
// daftar booking.
// ─────────────────────────────────────────

export const DateTimeCell = ({ value }: { value: string | null | undefined }) => (
  <div className="whitespace-nowrap">
    <p className="text-sm text-[var(--text-primary)]">{formatDate(value)}</p>
    {value && <p className="text-xs text-[var(--text-secondary)]">{formatTime(value)}</p>}
  </div>
)
