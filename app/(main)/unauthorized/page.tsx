'use client'

import Link from 'next/link'
import { ShieldAlert } from 'lucide-react'
import { AppButton } from '@/components/ui-custom'

// ─────────────────────────────────────────
// UNAUTHORIZED - tujuan redirect proxy.ts saat role tidak diizinkan
// akses suatu route. Statis, tidak perlu metadata dinamis/data fetching.
// ─────────────────────────────────────────

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="flex max-w-sm flex-col items-center rounded-2xl border border-[var(--border-card)] bg-[var(--bg-card)] p-8 text-center shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
        <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-[var(--danger)]">
          <ShieldAlert className="h-7 w-7" />
        </span>
        <h1
          className="text-lg font-bold text-[var(--text-primary)]"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Akses Ditolak
        </h1>
        <p className="mt-1.5 text-sm text-[var(--text-secondary)]">
          Anda tidak memiliki izin untuk mengakses halaman ini.
        </p>
        <Link href="/dashboard" className="mt-6">
          <AppButton variant="primary">Kembali ke Dashboard</AppButton>
        </Link>
      </div>
    </div>
  )
}
