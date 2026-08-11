'use client'

import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  createColumnHelper,
  type ColumnDef,
  type TableOptions,
  type SortingState,
} from '@tanstack/react-table'
import { useState } from 'react'
import { ChevronsUpDown, ChevronUp, ChevronDown } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton }   from '@/components/ui/skeleton'
import { Pagination } from '../pagination/Pagination'
import { cn }         from '@/lib/utils'
import type { PaginationMeta } from '@/types'

// ─────────────────────────────────────────
// RE-EXPORT createColumnHelper
// Semua modul import dari sini, bukan dari
// @tanstack/react-table langsung
//
// Usage:
//   import { createColumnHelper } from '@/components/shared'
//   const ch = createColumnHelper<Booking>()
//   const columns = [
//     ch.accessor('user', { header: 'User', cell: ... }),
//     ch.display({ id: 'actions', cell: ... }),
//   ]
// ─────────────────────────────────────────

export { createColumnHelper }
export type { ColumnDef }

// ─────────────────────────────────────────
// SORT ICON
// ─────────────────────────────────────────

const SortIcon = ({ sorted }: { sorted: false | 'asc' | 'desc' }) => {
  if (sorted === 'asc')  return <ChevronUp className="ml-1 inline h-3.5 w-3.5 text-[var(--primary)]" />
  if (sorted === 'desc') return <ChevronDown className="ml-1 inline h-3.5 w-3.5 text-[var(--primary)]" />
  return <ChevronsUpDown className="ml-1 inline h-3.5 w-3.5 text-[var(--text-disabled)]" />
}

// ─────────────────────────────────────────
// DATA TABLE PROPS
// ─────────────────────────────────────────

interface DataTableProps<TData> {
  data:           TData[]
  columns:        ColumnDef<TData, unknown>[]
  isLoading?:     boolean
  pagination?:    PaginationMeta
  onPageChange?:  (page: number) => void
  onLimitChange?: (limit: number) => void
  emptyMessage?:  string
  enableSorting?: boolean
  className?:     string
  tableOptions?:  Partial<TableOptions<TData>>
}

// ─────────────────────────────────────────
// DATA TABLE
// ─────────────────────────────────────────

export const DataTable = <TData,>({
  data,
  columns,
  isLoading,
  pagination,
  onPageChange,
  onLimitChange,
  emptyMessage   = 'Tidak ada data',
  enableSorting  = false,
  className,
  tableOptions,
}: DataTableProps<TData>) => {
  const [sorting, setSorting] = useState<SortingState>([])

  const table = useReactTable({
    data,
    columns,
    state:               { sorting },
    onSortingChange:     setSorting,
    getCoreRowModel:     getCoreRowModel(),
    getSortedRowModel:   enableSorting ? getSortedRowModel() : undefined,
    manualPagination:    !!pagination,
    ...tableOptions,
  })

  return (
    <div className={cn('flex flex-col gap-0', className)}>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-[var(--border-card)]">
        <Table>

          {/* Header */}
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow
                key={hg.id}
                className="border-b border-[var(--border-card)] hover:bg-transparent"
              >
                {hg.headers.map((header) => {
                  const canSort = header.column.getCanSort()
                  const sorted  = header.column.getIsSorted()

                  return (
                    <TableHead
                      key={header.id}
                      className="h-auto bg-[var(--bg-card)] px-4 py-3"
                      style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                    >
                      {header.isPlaceholder ? null : canSort ? (
                        <button
                          onClick={header.column.getToggleSortingHandler()}
                          className="inline-flex items-center text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          <SortIcon sorted={sorted} />
                        </button>
                      ) : (
                        <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--text-secondary)]">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </span>
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>

          {/* Body */}
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-b border-[var(--border-divider)]">
                  {columns.map((_, j) => (
                    <TableCell key={j} className="px-4 py-3.5">
                      <Skeleton className="h-4 w-full rounded-md bg-[var(--bg-subtle)]" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-2 text-[var(--text-secondary)]">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--bg-subtle)] text-xl">
                      📋
                    </div>
                    <p className="text-sm">{emptyMessage}</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="border-b border-[var(--border-divider)] bg-[var(--bg-card)] last:border-0 transition-colors hover:bg-[var(--bg-subtle)]"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-4 py-3.5">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>

        </Table>
      </div>

      {/* Pagination */}
      {pagination && onPageChange && (
        <Pagination
          pagination={pagination}
          onPageChange={onPageChange}
          onLimitChange={onLimitChange}
        />
      )}
    </div>
  )
}