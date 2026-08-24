'use client'

import { Mail, Phone, IdCard, Building2 } from 'lucide-react'
import { Card, CardHeader, CardSection } from '@/components/common'
import { PageHeader } from '@/components/shared'
import { useMe } from '@/hooks'
import { ProfilePhotoUpload } from './components/ProfilePhotoUpload'
import { ChangePasswordForm } from './components/ChangePasswordForm'

// ─────────────────────────────────────────
// PROFILE - foto & password bisa diubah sendiri, field lain (nama, email,
// no. HP, no. SIM) read-only - hanya admin yang bisa mengubah lewat menu
// Pengguna (belum ada endpoint self-service untuk itu di backend).
// ─────────────────────────────────────────

const InfoRow = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: string
}) => (
  <div className="flex items-center gap-3 py-2.5">
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--bg-subtle)] text-[var(--text-secondary)]">
      <Icon className="h-4 w-4" />
    </span>
    <div className="min-w-0">
      <p className="text-[10px] font-semibold uppercase tracking-[0.07em] text-[var(--text-secondary)]">
        {label}
      </p>
      <p className="truncate text-sm font-medium text-[var(--text-primary)]">{value}</p>
    </div>
  </div>
)

export const ProfilePage = () => {
  const { data: user, isLoading } = useMe()

  if (isLoading || !user) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Profil Saya" description="Kelola informasi akun Anda" />
        <p className="text-sm text-[var(--text-secondary)]">Memuat...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Profil Saya" description="Kelola informasi akun Anda" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Kiri: foto + identitas ringkas */}
        <Card className="lg:col-span-1">
          <CardSection className="flex flex-col items-center gap-4 text-center">
            <ProfilePhotoUpload user={user} />
            <div>
              <p className="text-base font-bold text-[var(--text-primary)]">{user.name}</p>
              <p className="text-xs text-[var(--text-secondary)]">{user.employeeId}</p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              <span className="inline-flex items-center rounded-full border border-[var(--border-card)] bg-[var(--bg-subtle)] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                {user.role.name}
              </span>
              <span className="inline-flex items-center rounded-full border border-[var(--border-card)] bg-[var(--bg-subtle)] px-2.5 py-0.5 text-[10px] font-semibold text-[var(--text-secondary)]">
                {user.department.name}
              </span>
            </div>
          </CardSection>
        </Card>

        {/* Kanan: info akun + keamanan */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card>
            <CardHeader
              title="Informasi Akun"
              description="Hubungi admin untuk mengubah data di bawah ini"
            />
            <div className="divide-y divide-[var(--border-divider)]">
              <InfoRow icon={Mail} label="Email" value={user.email} />
              <InfoRow icon={Building2} label="Departemen" value={user.department.name} />
              {user.phoneNumber && (
                <InfoRow icon={Phone} label="No. HP" value={user.phoneNumber} />
              )}
              {user.licenseNumber && (
                <InfoRow icon={IdCard} label="No. SIM" value={user.licenseNumber} />
              )}
            </div>
          </Card>

          <Card>
            <CardHeader title="Keamanan" description="Ganti password akun Anda" />
            <ChangePasswordForm />
          </Card>
        </div>
      </div>
    </div>
  )
}
