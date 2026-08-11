'use client'

import type { ReactNode } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Pagination } from '../pagination/Pagination'
import { cn } from '@/lib/utils'
import type { PaginationMeta } from '@/types'

// ─────────────────────────────────────────
// CARD GRID
// Padanan <DataTable/> untuk mode kartu:
// menangani loading skeleton + empty state
// dengan visual yang sama, sisanya diserahkan
// ke renderItem milik masing-masing modul.
// ─────────────────────────────────────────

interface CardGridProps<TData> {
  data:           TData[]
  renderItem:     (item: TData) => ReactNode
  keyExtractor:   (item: TData) => string | number
  isLoading?:     boolean
  pagination?:    PaginationMeta
  onPageChange?:  (page: number) => void
  emptyMessage?:  string
  skeletonCount?: number
  className?:     string
}

const GRID_CLASS = 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'

export const CardGrid = <TData,>({
  data,
  renderItem,
  keyExtractor,
  isLoading,
  pagination,
  onPageChange,
  emptyMessage  = 'Tidak ada data',
  skeletonCount = 8,
  className,
}: CardGridProps<TData>) => {
  const content = isLoading ? (
    <div className={cn(GRID_CLASS, className)}>
      {Array.from({ length: skeletonCount }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-[var(--border-card)] bg-[var(--bg-card)] p-3 shadow-[0_1px_4px_rgba(0,0,0,0.06)]"
        >
          <Skeleton className="aspect-[4/3] w-full rounded-xl bg-[var(--bg-subtle)]" />
          <div className="space-y-2 px-2 pb-1 pt-4">
            <Skeleton className="h-4 w-2/3 rounded-md bg-[var(--bg-subtle)]" />
            <Skeleton className="h-3 w-1/2 rounded-md bg-[var(--bg-subtle)]" />
            <Skeleton className="h-3 w-full rounded-md bg-[var(--bg-subtle)]" />
          </div>
        </div>
      ))}
    </div>
  ) : data.length === 0 ? (
    <div className="rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] py-16">
      <div className="flex flex-col items-center gap-2 text-[var(--text-secondary)]">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--bg-subtle)] text-xl">
          📋
        </div>
        <p className="text-sm">{emptyMessage}</p>
      </div>
    </div>
  ) : (
    <div className={cn(GRID_CLASS, className)}>
      {data.map((item) => (
        <div key={keyExtractor(item)}>{renderItem(item)}</div>
      ))}
    </div>
  )

  return (
    <div className="flex flex-col gap-0">
      {content}
      {pagination && onPageChange && (
        <Pagination pagination={pagination} onPageChange={onPageChange} />
      )}
    </div>
  )
}
