'use client'

import { useEffect } from 'react'
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { AppButton } from '@/components/ui-custom/Appbutton'
import { PAGINATION } from '@/constants'
import { cn } from '@/lib/utils'
import type { PaginationMeta } from '@/types'

// ─────────────────────────────────────────
// PAGE ITEMS
// Deret nomor halaman dengan jendela geser:
// halaman pertama & terakhir selalu tampil,
// sisanya mengikuti halaman aktif, gap diisi '…'
// ─────────────────────────────────────────

const MAX_VISIBLE_PAGES = 7

export const getPageItems = (
  page: number,
  totalPages: number,
): Array<number | 'ellipsis'> => {
  if (totalPages <= 0) return []
  if (totalPages <= MAX_VISIBLE_PAGES) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  const pages = new Set<number>([1, totalPages, page, page - 1, page + 1])

  // Jaga jumlah nomor tetap stabil saat berada di ujung deret.
  if (page <= 3)                pages.add(2).add(3).add(4)
  if (page >= totalPages - 2)   pages.add(totalPages - 1).add(totalPages - 2).add(totalPages - 3)

  const sorted = [...pages]
    .filter((p) => p >= 1 && p <= totalPages)
    .sort((a, b) => a - b)

  const items: Array<number | 'ellipsis'> = []
  let prev = 0
  for (const p of sorted) {
    if (prev && p - prev > 1) items.push('ellipsis')
    items.push(p)
    prev = p
  }
  return items
}

// ─────────────────────────────────────────
// PAGINATION
// Pager bersama untuk <DataTable/> (mode baris)
// dan <CardGrid/> (mode kartu) — supaya kedua
// mode tampil identik.
// ─────────────────────────────────────────

interface PaginationProps {
  pagination:     PaginationMeta
  onPageChange:   (page: number) => void
  // Dropdown jumlah data per halaman hanya muncul kalau handler ini diberikan.
  onLimitChange?: (limit: number) => void
  className?:     string
}

export const Pagination = ({
  pagination,
  onPageChange,
  onLimitChange,
  className,
}: PaginationProps) => {
  const currentPage = pagination.page ?? 1
  const totalPages  = pagination.totalPages ?? 0

  // Limit yang sedang aktif belum tentu ada di daftar pilihan
  // (mis. picker yang memakai limit 6) — sisipkan agar select tidak kosong.
  const limitOptions = PAGINATION.LIMIT_OPTIONS.includes(pagination.limit)
    ? PAGINATION.LIMIT_OPTIONS
    : [...PAGINATION.LIMIT_OPTIONS, pagination.limit].sort((a, b) => a - b)

  // Halaman aktif bisa melewati totalPages saat data menyusut
  // (mis. filter dipersempit atau baris terakhir dihapus) — tarik kembali
  // ke halaman terakhir yang valid agar tabel tidak tampil kosong.
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) onPageChange(totalPages)
  }, [onPageChange, currentPage, totalPages])

  return (
    <nav
      aria-label="Pagination"
      className={cn('flex items-center justify-between pt-3', className)}
    >
      <div className="flex items-center gap-3">
        {onLimitChange && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--text-secondary)]">Per halaman</span>
            <div className="relative">
              <select
                value={pagination.limit}
                onChange={(e) => onLimitChange(Number(e.target.value))}
                aria-label="Jumlah data per halaman"
                className="h-8 cursor-pointer appearance-none rounded-lg border border-[var(--border-input)] bg-[var(--bg-card)] pl-2.5 pr-7 text-xs font-medium text-[var(--text-primary)] transition-all duration-150 focus-visible:border-[1.5px] focus-visible:border-[var(--primary)] focus-visible:outline-none focus-visible:ring-0"
              >
                {limitOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute inset-y-0 right-2 my-auto h-3.5 w-3.5 text-[var(--text-secondary)]" />
            </div>
          </div>
        )}

        <p className="text-xs text-[var(--text-secondary)]">
          Menampilkan{' '}
          <span className="font-medium text-[var(--text-primary)]">
            {pagination.total === 0
              ? 0
              : `${(currentPage - 1) * pagination.limit + 1}–${Math.min(
                  currentPage * pagination.limit,
                  pagination.total,
                )}`}
          </span>
          {' '}dari{' '}
          <span className="font-medium text-[var(--text-primary)]">
            {pagination.total}
          </span>
          {' '}data
        </p>
      </div>

      <div className="flex items-center gap-1">
        <AppButton
          variant="secondary"
          size="icon-sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Halaman sebelumnya"
        >
          <ChevronLeft className="h-4 w-4" />
        </AppButton>

        {getPageItems(currentPage, totalPages).map((item, i) =>
          item === 'ellipsis' ? (
            <span
              key={`ellipsis-${i}`}
              className="flex h-7 min-w-7 items-center justify-center px-1 text-xs text-[var(--text-disabled)]"
            >
              …
            </span>
          ) : (
            <button
              key={item}
              onClick={() => onPageChange(item)}
              aria-current={item === currentPage ? 'page' : undefined}
              className={cn(
                'flex h-7 min-w-7 items-center justify-center rounded-lg px-2 text-xs font-medium transition-colors',
                item === currentPage
                  ? 'bg-[var(--primary)] text-white'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]',
              )}
            >
              {item}
            </button>
          ),
        )}

        <AppButton
          variant="secondary"
          size="icon-sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Halaman berikutnya"
        >
          <ChevronRight className="h-4 w-4" />
        </AppButton>
      </div>
    </nav>
  )
}
