'use client'

import { useState } from 'react'
import { cn } from '@/lib'
import { useDriver } from '../hooks/useDrivers'
import { DriverDetailModal } from './DriverDetailModal'

// ─────────────────────────────────────────
// DRIVER PROFILE BUTTON
// Sama seperti <UserProfileButton/> tapi untuk driver - reuse
// <DriverDetailModal/> yang sudah ada (info driver + rating), tinggal
// fetch driver-nya sendiri lewat driverId (dulu cuma dipakai di tempat yang
// sudah punya objek Driver utuh di tangan, mis. tabel driver).
// ─────────────────────────────────────────

interface DriverProfileButtonProps {
  driverId: number
  children: React.ReactNode
  className?: string
}

export const DriverProfileButton = ({ driverId, children, className }: DriverProfileButtonProps) => {
  const [open, setOpen] = useState(false)
  const { data: driver } = useDriver(driverId, { enabled: open })

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          setOpen(true)
        }}
        className={cn('text-left', className)}
      >
        {children}
      </button>
      {driver && <DriverDetailModal driver={driver} open={open} onOpenChange={setOpen} />}
    </>
  )
}
