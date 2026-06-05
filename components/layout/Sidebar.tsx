'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  CalendarCheck,
  Car,
  Building2,
  UserRound,
  BarChart3,
  Users,
  Settings,
  LogOut,
  Grid2x2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/auth.store'
import { useLogout } from '@/hooks'
import { ROLE } from '@/constants'
import type { RoleName } from '@/types'
import { UserAvatar } from '@/components/shared/avatar/Avatar'

// ─────────────────────────────────────────
// NAV CONFIG
// ─────────────────────────────────────────

interface NavItem {
  label: string
  href:  string
  icon:  React.ElementType
  badge?: number
  /** Role yang boleh melihat menu ini. Kosong = semua role. */
  roles?: RoleName[]
}

const MENU_NAV: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard',      icon: LayoutDashboard },
  { label: 'Booking',   href: '/booking',    icon: CalendarCheck,  badge: 3 },
  { label: 'Vehicles',  href: '/vehicles',   icon: Car },
  { label: 'Meeting Rooms', href: '/rooms',  icon: Building2, roles: [ROLE.ADMIN, ROLE.USER] },
  { label: 'Driver',    href: '/drivers',    icon: UserRound, roles: [ROLE.ADMIN] },
]

const ADMIN_NAV: NavItem[] = [
  { label: 'Laporan',   href: '/reports',   icon: BarChart3 },
  { label: 'Pengguna',  href: '/users',     icon: Users },
]

// ─────────────────────────────────────────
// NAV ITEM
// ─────────────────────────────────────────

const NavLink = ({ item, isActive }: { item: NavItem; isActive: boolean }) => {
  const Icon = item.icon
  return (
    <Link
      href={item.href}
      className={cn(
        'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium',
        'transition-all duration-150',
        isActive
          ? 'bg-[var(--primary-light)] text-[var(--primary)]'
          : 'text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]',
      )}
    >
      {/* Active indicator bar */}
      {isActive && (
        <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-[var(--primary)]" />
      )}

      <Icon
        className={cn(
          'h-[18px] w-[18px] shrink-0',
          isActive ? 'text-[var(--primary)]' : 'text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]',
        )}
      />
      <span className="flex-1 truncate">{item.label}</span>

      {/* Badge */}
      {item.badge && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--primary)] px-1.5 text-[10px] font-semibold text-white">
          {item.badge}
        </span>
      )}
    </Link>
  )
}

// ─────────────────────────────────────────
// NAV SECTION
// ─────────────────────────────────────────

const NavSection = ({ label, items }: { label: string; items: NavItem[] }) => {
  const pathname = usePathname()

  return (
    <div>
      <p className="mb-2 p-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--text-disabled)]">
        {label}
      </p>
      <nav className="space-y-0.5">
        {items.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            isActive={
              item.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(item.href)
            }
          />
        ))}
      </nav>
    </div>
  )
}

// ─────────────────────────────────────────
// BOTTOM USER CARD
// ─────────────────────────────────────────

const BottomUser = () => {
  const user                      = useAuthStore((s) => s.user)
  const { mutate: logout, isPending } = useLogout()

  if (!user) return null

  return (
    <div className="border-t border-[var(--border-divider)] pt-3">
      {/* User info */}
      <div className="flex items-center gap-3 rounded-xl px-2 py-2">
        <UserAvatar name={user.name} size="md" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
            {user.name}
          </p>
          <span className="inline-flex items-center rounded-full bg-[var(--bg-subtle)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--text-secondary)] border border-[var(--border-card)]">
            {user.role}
          </span>
        </div>
      </div>

      {/* Action icons */}
      <div className="mt-1 flex gap-1 px-2">
        <Link
          href="/dashboard/settings"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
          aria-label="Pengaturan"
        >
          <Settings className="h-4 w-4" />
        </Link>
        <button
          onClick={() => logout()}
          disabled={isPending}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--text-secondary)] transition-colors hover:bg-red-50 hover:text-[var(--danger)]"
          aria-label="Keluar"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────
// SIDEBAR
// ─────────────────────────────────────────

export const Sidebar = () => {
  const isAdmin = useAuthStore((s) => s.isAdmin())
  const role = useAuthStore((s) => s.user?.role) as RoleName | undefined

  // Saring menu sesuai role pengguna
  const menuItems = MENU_NAV.filter(
    (item) => !item.roles || (role ? item.roles.includes(role) : false),
  )

  return (
    <aside className="flex h-full w-[220px] shrink-0 flex-col bg-[var(--bg-card)] border-r border-[var(--border-card)]">

      {/* Logo */}
      <div className="flex h-[56px] shrink-0 items-center gap-2.5 border-b border-[var(--border-divider)] px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary)]">
          <Grid2x2 className="h-4 w-4 text-white" />
        </div>
        <span
          className="text-[15px] font-bold text-[var(--text-primary)]"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          ReserveSystem
        </span>
      </div>

      {/* Nav scrollable area */}
      <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-3 py-4">
        <NavSection label="Menu" items={menuItems} />
        {isAdmin && <NavSection label="Admin" items={ADMIN_NAV} />}
      </div>

      {/* Bottom user section */}
      <div className="shrink-0 px-3 pb-4">
        <BottomUser />
      </div>
    </aside>
  )
}