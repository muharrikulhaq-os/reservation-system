'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Car, ChevronRight } from 'lucide-react'
import { Card, CardHeader } from '@/components/common'
import { UserAvatar, Badge } from '@/components/shared'
import { useDrivers, DriverDetailModal } from '@/modules/drivers'
import type { Driver } from '@/types'

// ─────────────────────────────────────────
// DASHBOARD - DAFTAR SUPIR
// Menampilkan supir + kendaraan yang "dimiliki" (assignedPlate) atau
// belum. Klik → DriverDetailModal (info + rating).
// ─────────────────────────────────────────

export const DriverListCard = () => {
  const { data: drivers, isLoading } = useDrivers()
  const [selected, setSelected] = useState<Driver | null>(null)
  const list = drivers ?? []

  return (
    <Card>
      <CardHeader
        title="Supir"
        description="Kepemilikan kendaraan & status"
        action={
          <Link
            href="/drivers"
            className="inline-flex items-center gap-0.5 text-xs font-medium text-[var(--primary)] hover:underline"
          >
            Lihat semua <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        }
      />

      {isLoading ? (
        <p className="py-6 text-center text-sm text-[var(--text-disabled)]">Memuat…</p>
      ) : list.length === 0 ? (
        <p className="py-6 text-center text-sm text-[var(--text-disabled)]">
          Belum ada supir
        </p>
      ) : (
        <ul className="divide-y divide-[var(--border-divider)]">
          {list.slice(0, 6).map((d) => (
            <li key={d.id}>
              <button
                type="button"
                onClick={() => setSelected(d)}
                className="flex w-full items-center gap-3 rounded-lg px-1 py-2.5 text-left transition-colors hover:bg-[var(--bg-subtle)]"
              >
                <UserAvatar name={d.name} photo={d.profilePhoto} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                    {d.name}
                  </p>
                  <p className="truncate text-xs text-[var(--text-secondary)]">
                    {d.assignedPlate ? (
                      <span className="inline-flex items-center gap-1">
                        <Car className="h-3 w-3" /> {d.assignedPlate}
                      </span>
                    ) : (
                      'Belum punya kendaraan'
                    )}
                  </p>
                </div>
                {d.assignedPlate ? (
                  <Badge variant="info">Bertugas</Badge>
                ) : (
                  <Badge variant="muted">Kosong</Badge>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      {selected && (
        <DriverDetailModal
          driver={selected}
          open={!!selected}
          onOpenChange={(o) => !o && setSelected(null)}
        />
      )}
    </Card>
  )
}
