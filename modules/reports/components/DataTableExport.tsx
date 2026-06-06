'use client'

import { Download } from 'lucide-react'
import { AppButton } from '@/components/ui-custom'
import { cn } from '@/lib/utils'

// ─────────────────────────────────────────
// DATA TABLE EXPORT
// Unduh data tabel sebagai CSV di sisi klien.
// ─────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface DataTableExportProps<T extends Record<string, any>> {
  data: T[]
  columns: Array<{ key: keyof T & string; label: string }>
  filename: string
  className?: string
}

// Escape nilai sel agar aman untuk CSV.
const escapeCell = (value: unknown): string => {
  const str = value === null || value === undefined ? '' : String(value)
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const DataTableExport = <T extends Record<string, any>>({
  data,
  columns,
  filename,
  className,
}: DataTableExportProps<T>) => {
  const handleExport = () => {
    const header = columns.map((c) => escapeCell(c.label)).join(',')
    const rows = data.map((row) =>
      columns.map((c) => escapeCell(row[c.key])).join(','),
    )
    const csv = [header, ...rows].join('\n')

    // BOM agar Excel membaca UTF-8 dengan benar.
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <AppButton
      variant="secondary"
      size="sm"
      leftIcon={<Download className="h-4 w-4" />}
      onClick={handleExport}
      disabled={data.length === 0}
      className={cn(className)}
    >
      Export CSV
    </AppButton>
  )
}
