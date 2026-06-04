'use client'

import { CalendarCheck, Car, Building2, Users } from 'lucide-react'
import { StatCard } from './components/StatCard'
import { RecentBookings } from './components/RecentBookingTable'
import { useDashboardSummary } from './hooks/useDashboard'

// ─────────────────────────────────────────
// STAT CARDS ROW
// ─────────────────────────────────────────

const StatCards = () => {
  const { data } = useDashboardSummary()
  const sum = data?.data

  const stats = [
    {
      label: 'Total Booking',
      value: sum?.total_bookings ?? '—',
      icon: <CalendarCheck className="h-5 w-5 text-[var(--primary)]" />,
      iconBg: 'var(--primary-light)',
    },
    {
      label: 'Total Kendaraan',
      value: sum?.total_vehicles ?? '—',
      icon: <Car className="h-5 w-5 text-[#16A34A]" />,
      iconBg: '#DCFCE7',
    },
    {
      label: 'Total Ruangan',
      value: sum?.total_rooms ?? '—',
      icon: <Building2 className="h-5 w-5 text-[#0284C7]" />,
      iconBg: '#DBEAFE',
    },
    {
      label: 'Total Driver',
      value: sum?.total_drivers ?? '—',
      icon: <Users className="h-5 w-5 text-[#D97706]" />,
      iconBg: '#FEF9C3',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((s) => (
        <StatCard key={s.label} {...s} />
      ))}
    </div>
  )
}

export const DashboardPage = () => (
  <div className="flex flex-col gap-5">
    <StatCards />
    <RecentBookings />
  </div>
)
