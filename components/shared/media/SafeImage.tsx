'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

// ─────────────────────────────────────────
// SAFE IMAGE
// <img> yang otomatis jatuh ke `fallback` kalau src kosong
// atau gagal dimuat (404, file kosong/corrupt, dll).
// ─────────────────────────────────────────

interface SafeImageProps {
  src?: string | null
  alt: string
  className?: string
  fallback: React.ReactNode
  fallbackClassName?: string
  onClick?: () => void
}

export const SafeImage = ({
  src,
  alt,
  className,
  fallback,
  fallbackClassName,
  onClick,
}: SafeImageProps) => {
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return (
      <div
        className={cn(
          'flex h-full w-full items-center justify-center',
          fallbackClassName ?? className,
        )}
      >
        {fallback}
      </div>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      onClick={onClick}
      onError={() => setFailed(true)}
    />
  )
}
