'use client'

import { useAuthStore } from '@/store/auth.store'
import type { RoleName } from '@/types'

// ─────────────────────────────────────────
// ROLE GUARD
// Render children hanya jika user punya role
// yang sesuai. Untuk proteksi UI — proteksi
// route sesungguhnya ada di middleware.ts
// ─────────────────────────────────────────

interface RoleGuardProps {
  roles: RoleName | RoleName[]
  children: React.ReactNode
  fallback?: React.ReactNode
}

export const RoleGuard = ({ roles, children, fallback = null }: RoleGuardProps) => {
  const hasRole = useAuthStore((s) => s.hasRole)
  return hasRole(roles) ? <>{children}</> : <>{fallback}</>
}

// ── Convenience wrappers ──────────────────

export const AdminOnly = ({ children, fallback }: Omit<RoleGuardProps, 'roles'>) => (
  <RoleGuard roles="ADMIN" fallback={fallback}>{children}</RoleGuard>
)

export const DriverOnly = ({ children, fallback }: Omit<RoleGuardProps, 'roles'>) => (
  <RoleGuard roles="DRIVER" fallback={fallback}>{children}</RoleGuard>
)

export const EmployeeOnly = ({ children, fallback }: Omit<RoleGuardProps, 'roles'>) => (
  <RoleGuard roles={['EMPLOYEE', 'ADMIN']} fallback={fallback}>{children}</RoleGuard>
)

export const RoomKeeperOnly = ({ children, fallback }: Omit<RoleGuardProps, 'roles'>) => (
  <RoleGuard roles="ROOM_KEEPER" fallback={fallback}>{children}</RoleGuard>
)