'use client'

import { usePathname } from 'next/navigation'
import { Search, Bell, HelpCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/auth.store'
import { UserAvatar } from '@/components/shared/avatar/Avatar'

// ─────────────────────────────────────────
// PAGE TITLE MAP
// Derive judul dari pathname
// ─────────────────────────────────────────

const PAGE_TITLES: Record<string, string> = {
  '/dashboard':               'Dashboard',
  '/dashboard/booking':       'Booking',
  '/dashboard/vehicles':      'Kendaraan',
  '/dashboard/rooms':         'Ruangan',
  '/dashboard/drivers':       'Driver',
  '/dashboard/reports':       'Laporan',
  '/dashboard/users':         'Pengguna',
  '/dashboard/settings':      'Pengaturan',
}

const usePageTitle = () => {
  const pathname = usePathname()
  // Cek exact match dulu, lalu prefix match
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname]
  const match = Object.entries(PAGE_TITLES)
    .filter(([k]) => k !== '/dashboard' && pathname.startsWith(k))
    .sort((a, b) => b[0].length - a[0].length)[0]
  return match ? match[1] : 'Dashboard'
}

// ─────────────────────────────────────────
// ICON BUTTON
// ─────────────────────────────────────────

const NavIconBtn = ({
  icon: Icon,
  label,
  badge,
  className,
}: {
  icon: React.ElementType
  label: string
  badge?: boolean
  className?: string
}) => (
  <button
    aria-label={label}
    className={cn(
      'relative flex h-9 w-9 items-center justify-center rounded-lg',
      'text-[var(--text-secondary)] transition-colors',
      'hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]',
      className,
    )}
  >
    <Icon className="h-[18px] w-[18px]" />
    {badge && (
      <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[var(--danger)]" />
    )}
  </button>
)

// ─────────────────────────────────────────
// NAVBAR
// ─────────────────────────────────────────

export const Navbar = () => {
  const title = usePageTitle()
  const user  = useAuthStore((s) => s.user)

  return (
    <header className="flex h-[56px] shrink-0 items-center justify-between gap-4 border-b border-[var(--border-card)] bg-[var(--bg-card)] px-5">

      {/* Page title */}
      <h1
        className="text-lg font-bold text-[var(--primary)] shrink-0"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        {title}
      </h1>

      {/* Search — center */}
      <div className="relative w-full max-w-xs">
        <Search className="pointer-events-none absolute inset-y-0 left-3 my-auto h-4 w-4 text-[var(--text-disabled)]" />
        <Input
          placeholder="Search reservations..."
          className="h-9 rounded-xl border-[var(--border-input)] bg-[var(--bg-subtle)] pl-9 text-sm placeholder:text-[var(--text-disabled)] focus-visible:ring-0 focus-visible:border-[var(--primary)]"
        />
      </div>

      {/* Right icons */}
      <div className="flex items-center gap-1 shrink-0">
        <NavIconBtn icon={Bell}        label="Notifikasi" badge />
        <NavIconBtn icon={HelpCircle}  label="Bantuan" />

        {/* Avatar */}
        {user && (
          <button className="ml-1 rounded-full" aria-label="Profil">
            <UserAvatar name={user.name} size="sm" />
          </button>
        )}
      </div>
    </header>
  )
}