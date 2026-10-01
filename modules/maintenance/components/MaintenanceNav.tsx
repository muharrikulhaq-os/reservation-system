'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AlertOctagon, Building2, Wrench } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useVehicleIssues } from '../hooks/useMaintenance'

// Sub-menu Pemeliharaan: pengajuan, laporan kendala supir, master vendor.
export const MaintenanceNav = () => {
  const path = usePathname()
  const { data: open } = useVehicleIssues({ status: 'OPEN', limit: 1 })
  const openCount = open?.pagination?.total ?? 0

  const items = [
    { href: '/maintenance', label: 'Pengajuan', icon: Wrench, active: path === '/maintenance' || /^\/maintenance\/(\d+|new)/.test(path) },
    { href: '/maintenance/issues', label: 'Laporan Kendala', icon: AlertOctagon, active: path.startsWith('/maintenance/issues'), badge: openCount },
    { href: '/maintenance/vendors', label: 'Vendor & Bengkel', icon: Building2, active: path.startsWith('/maintenance/vendors') },
  ]

  return (
    <nav className="flex flex-wrap gap-2">
      {items.map((it) => {
        const Icon = it.icon
        return (
          <Link
            key={it.href}
            href={it.href}
            className={cn(
              'inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
              it.active
                ? 'border-[var(--primary)] bg-[var(--primary-light)] text-[var(--primary)]'
                : 'border-[var(--border-card)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
            )}
          >
            <Icon className="h-4 w-4" />
            {it.label}
            {!!it.badge && (
              <span className="rounded-full bg-[var(--danger)] px-1.5 text-[10px] font-bold leading-4 text-white">
                {it.badge}
              </span>
            )}
          </Link>
        )
      })}
    </nav>
  )
}
