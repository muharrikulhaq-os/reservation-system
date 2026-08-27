'use client'

import { useState } from 'react'
import { cn } from '@/lib'
import { UserProfileModal } from './UserProfileModal'

// ─────────────────────────────────────────
// USER PROFILE BUTTON
// Bungkus konten apa pun (avatar+nama, dsb) supaya bisa diklik untuk buka
// <UserProfileModal/> - state buka/tutup dikelola sendiri di sini jadi
// pemanggil tinggal drop-in tanpa perlu state tambahan.
// ─────────────────────────────────────────

interface UserProfileButtonProps {
  userId: number
  children: React.ReactNode
  className?: string
}

export const UserProfileButton = ({ userId, children, className }: UserProfileButtonProps) => {
  const [open, setOpen] = useState(false)

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
      <UserProfileModal userId={userId} open={open} onOpenChange={setOpen} />
    </>
  )
}
