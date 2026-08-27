'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageHeader } from '@/components/shared'
import type { ReportDateParams } from '@/types'
import { DateRangeFilter, DataTableExport } from './components'
import {
  OverviewSection,
  BookingSection,
  ResourceSection,
  FinanceSection,
  DriverSection,
  AuditSection,
} from './components/sections'
import { useDepartmentSummary } from './hooks/useReports'

// ─────────────────────────────────────────
// LAPORAN & ANALITIK - view utama (6 tab)
// DateRangeFilter persisten di semua tab.
// ─────────────────────────────────────────

type Preset = 'today' | '7d' | '30d' | '90d' | '12m'

const startOfMonth = () => {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString()
}
const endOfMonth = () => {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59).toISOString()
}

// Preset → rentang tanggal [start, end]
const presetRange = (preset: Preset): { start: string; end: string } => {
  const now = new Date()
  const end = now.toISOString()
  const start = new Date(now)
  switch (preset) {
    case 'today':
      start.setHours(0, 0, 0, 0)
      break
    case '7d':
      start.setDate(now.getDate() - 7)
      break
    case '30d':
      start.setDate(now.getDate() - 30)
      break
    case '90d':
      start.setDate(now.getDate() - 90)
      break
    case '12m':
      start.setMonth(now.getMonth() - 12)
      break
  }
  return { start: start.toISOString(), end }
}

const TABS = [
  { value: 'overview', label: 'Ringkasan' },
  { value: 'booking', label: 'Booking' },
  { value: 'resource', label: 'Resource' },
  { value: 'finance', label: 'Keuangan' },
  { value: 'driver', label: 'Driver' },
  { value: 'audit', label: 'Audit Log' },
]

const triggerClass =
  'rounded-lg px-4 py-2 text-sm font-medium text-[var(--text-secondary)] ' +
  'data-active:bg-[var(--primary-light)] data-active:text-[var(--primary)] ' +
  'data-active:shadow-none'

export const Reports = () => {
  const [startDate, setStartDate] = useState(startOfMonth)
  const [endDate, setEndDate] = useState(endOfMonth)
  const [activePreset, setActivePreset] = useState<Preset | undefined>(undefined)

  const range: ReportDateParams = { startDate, endDate }

  // Dataset untuk export di header (ringkasan per departemen).
  const { data: deptSummary } = useDepartmentSummary(range)

  const handlePreset = (preset: Preset) => {
    const { start, end } = presetRange(preset)
    setStartDate(start)
    setEndDate(end)
    setActivePreset(preset)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Laporan & Analitik"
        description="Ringkasan performa booking, resource, keuangan, dan driver"
        actions={
          <DataTableExport
            data={deptSummary ?? []}
            columns={[
              { key: 'departmentName', label: 'Departemen' },
              { key: 'bookingCount', label: 'Jumlah Booking' },
              { key: 'fuelCost', label: 'Biaya BBM' },
              { key: 'maintenanceCost', label: 'Biaya Maintenance' },
              { key: 'totalCost', label: 'Total Biaya' },
              { key: 'topResource', label: 'Resource Terbanyak' },
            ]}
            filename="ringkasan-departemen"
          />
        }
      />

      <DateRangeFilter
        startDate={startDate}
        endDate={endDate}
        onStartChange={(d) => {
          setStartDate(d)
          setActivePreset(undefined)
        }}
        onEndChange={(d) => {
          setEndDate(d)
          setActivePreset(undefined)
        }}
        onPresetClick={handlePreset}
        activePreset={activePreset}
      />

      <Tabs defaultValue="overview">
        <TabsList variant="line" className="h-auto flex-wrap gap-1 bg-transparent p-0">
          {TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value} className={triggerClass}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="mt-5">
          <OverviewSection range={range} />
        </TabsContent>
        <TabsContent value="booking" className="mt-5">
          <BookingSection range={range} />
        </TabsContent>
        <TabsContent value="resource" className="mt-5">
          <ResourceSection range={range} />
        </TabsContent>
        <TabsContent value="finance" className="mt-5">
          <FinanceSection range={range} />
        </TabsContent>
        <TabsContent value="driver" className="mt-5">
          <DriverSection range={range} />
        </TabsContent>
        <TabsContent value="audit" className="mt-5">
          <AuditSection range={range} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
