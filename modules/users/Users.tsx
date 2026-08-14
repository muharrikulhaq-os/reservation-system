'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Search,
  UserPlus,
  Users as UsersIcon,
  ShieldCheck,
  Car,
  FileSpreadsheet,
  DoorOpen,
  Building2,
} from 'lucide-react'
import { DataTable, PageHeader, StatCard } from '@/components/shared'
import { AppButton, InputSelect } from '@/components/ui-custom'
import { AdminOnly } from '@/components/common'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { useTableFilter } from '@/hooks'
import { ROLE } from '@/constants'
import type { RoleName, SelectOption, User } from '@/types'
import {
  useUsers,
  useUserSummary,
  useUserRoles,
  useUserDepartments,
  useToggleUserActive,
} from './hooks/useUsers'
import { userColumns } from './utils/columns'
import { UserBulkImportDialog } from './components/UserBulkImportDialog'
import { DepartmentManageModal } from './components/DepartmentManageModal'

// ─────────────────────────────────────────
// USERS PAGE - daftar pengguna
// ─────────────────────────────────────────

export const Users = () => {
  const { search, setSearch, filters, setFilter, page, setPage, setLimit, params } =
    useTableFilter({
      roleId: undefined as number | undefined,
      departmentId: undefined as number | undefined,
      isActive: true as boolean | undefined, // default sembunyikan nonaktif
    })

  const { data, isLoading } = useUsers(params)
  const { data: summary } = useUserSummary()
  const { data: roles } = useUserRoles()
  const { data: departments } = useUserDepartments()
  const toggle = useToggleUserActive()

  const [pendingToggleUser, setPendingToggleUser] = useState<User | null>(null)
  const [bulkImportOpen, setBulkImportOpen] = useState(false)
  const [deptModalOpen, setDeptModalOpen] = useState(false)

  const columns = useMemo(
    () => userColumns({ onToggleActive: setPendingToggleUser }),
    [],
  )

  const roleOptions: SelectOption<number>[] = (roles ?? []).map((r) => ({
    value: r.id,
    label: r.name,
  }))
  const deptOptions: SelectOption<number>[] = (departments ?? []).map((d) => ({
    value: d.id,
    label: d.name,
  }))

  const list = data?.data ?? []

  // Stat dihitung backend atas seluruh data (GET /users/summary),
  // jadi tidak ikut berubah saat filter atau halaman berganti.
  // Role yang belum punya user sama sekali tidak muncul di roleCount.
  const countByRole = (role: RoleName) => summary?.roleCount[role] ?? 0

  const showInactive = filters.isActive === undefined

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pengguna"
        description="Kelola akun pengguna sistem"
        actions={
          <AdminOnly>
            <div className="flex flex-wrap items-center gap-3">
              <AppButton
                variant="secondary"
                leftIcon={<Building2 className="h-4 w-4" />}
                onClick={() => setDeptModalOpen(true)}
              >
                Kelola Departemen
              </AppButton>
              <AppButton
                variant="secondary"
                leftIcon={<FileSpreadsheet className="h-4 w-4" />}
                onClick={() => setBulkImportOpen(true)}
              >
                Import Excel
              </AppButton>
              <Link href="/users/new">
                <AppButton variant="primary" leftIcon={<UserPlus className="h-4 w-4" />}>
                  Tambah Pengguna
                </AppButton>
              </Link>
            </div>
          </AdminOnly>
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          label="Total"
          value={summary?.totals.total ?? 0}
          icon={<UsersIcon className="h-5 w-5 text-[#2563EB]" />}
          iconBg="#DBEAFE"
        />
        <StatCard
          label="Admin"
          value={countByRole(ROLE.ADMIN)}
          icon={<ShieldCheck className="h-5 w-5 text-[#7C3AED]" />}
          iconBg="#EDE9FE"
        />
        <StatCard
          label="Driver"
          value={countByRole(ROLE.DRIVER)}
          icon={<Car className="h-5 w-5 text-[#16A34A]" />}
          iconBg="#DCFCE7"
        />
        <StatCard
          label="Room Keeper"
          value={countByRole(ROLE.ROOM_KEEPER)}
          icon={<DoorOpen className="h-5 w-5 text-[#EAB308]" />}
          iconBg="#FEF9C3"
        />
        <StatCard
          label="Employee"
          value={countByRole(ROLE.EMPLOYEE)}
          icon={<UsersIcon className="h-5 w-5 text-[var(--text-secondary)]" />}
        />
      </div>

      {/* Filter row */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute inset-y-0 left-3 my-auto h-4 w-4 text-[var(--text-disabled)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama atau email..."
            className="h-10 w-full rounded-lg border border-[var(--border-input)] bg-[var(--bg-card)] pl-9 pr-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-disabled)] focus-visible:border-[1.5px] focus-visible:border-[var(--primary)] focus-visible:outline-none"
          />
        </div>

        <div className="w-40">
          <InputSelect
            placeholder="Semua Role"
            options={roleOptions}
            value={filters.roleId ?? ''}
            onChange={(e) =>
              setFilter('roleId', e.target.value ? Number(e.target.value) : undefined)
            }
          />
        </div>

        <div className="w-52">
          <InputSelect
            placeholder="Semua Departemen"
            options={deptOptions}
            value={filters.departmentId ?? ''}
            onChange={(e) =>
              setFilter(
                'departmentId',
                e.target.value ? Number(e.target.value) : undefined,
              )
            }
          />
        </div>

        <label className="ml-auto flex cursor-pointer items-center gap-2 text-sm text-[var(--text-secondary)]">
          <Switch
            checked={showInactive}
            onCheckedChange={(checked) =>
              setFilter('isActive', checked ? undefined : true)
            }
          />
          Tampilkan nonaktif
        </label>
      </div>

      <DataTable
        data={list}
        columns={columns}
        isLoading={isLoading}
        pagination={data?.pagination}
        onPageChange={setPage}
        onLimitChange={setLimit}
        enableSorting
        emptyMessage="Belum ada pengguna"
      />

      {/* Bulk import Excel */}
      <UserBulkImportDialog
        open={bulkImportOpen}
        onOpenChange={setBulkImportOpen}
      />

      {/* Kelola Departemen */}
      <DepartmentManageModal
        open={deptModalOpen}
        onOpenChange={setDeptModalOpen}
      />

      {/* Confirm toggle active */}
      <Dialog
        open={!!pendingToggleUser}
        onOpenChange={(open) => !open && setPendingToggleUser(null)}
      >
        <DialogContent className="rounded-2xl p-6 shadow-[var(--shadow-modal)] sm:max-w-md">
          <DialogHeader>
            <DialogTitle
              className="text-lg font-bold text-[var(--text-primary)]"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              {pendingToggleUser?.isActive ? 'Nonaktifkan' : 'Aktifkan'}{' '}
              {pendingToggleUser?.name}?
            </DialogTitle>
            <DialogDescription className="text-sm text-[var(--text-secondary)]">
              {pendingToggleUser?.isActive
                ? 'User tidak akan bisa login. Booking aktif tidak terpengaruh.'
                : 'User akan dapat login kembali ke sistem.'}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-2 space-y-4">

            <div className="flex gap-3 pt-1">
              <AppButton
                variant="secondary"
                fullWidth
                disabled={toggle.isPending}
                onClick={() => setPendingToggleUser(null)}
              >
                Batal
              </AppButton>
              <AppButton
                variant={pendingToggleUser?.isActive ? 'danger' : 'primary'}
                fullWidth
                loading={toggle.isPending}
                onClick={() =>
                  pendingToggleUser &&
                  toggle.mutate(pendingToggleUser.id, {
                    onSuccess: () => setPendingToggleUser(null),
                  })
                }
              >
                {pendingToggleUser?.isActive ? 'Nonaktifkan' : 'Aktifkan'}
              </AppButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
