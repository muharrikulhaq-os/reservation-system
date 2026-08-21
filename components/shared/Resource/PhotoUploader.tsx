'use client'

import { useRef } from 'react'
import { ImageIcon } from 'lucide-react'
import { AppButton, InputFile } from '@/components/ui-custom'
import { SafeImage } from '@/components/shared/media/SafeImage'
import { resolveFileUrl } from '@/lib/utils'
import { cn } from '@/lib/utils'

// ─────────────────────────────────────────
// PHOTO UPLOADER
// Upload/ganti foto utama resource.
// ─────────────────────────────────────────

interface PhotoUploaderProps {
  currentPhotoUrl?: string | null
  onUpload: (file: File) => void
  loading?: boolean
  /** false = read-only (sembunyikan kontrol upload) */
  canEdit?: boolean
  className?: string
}

export const PhotoUploader = ({
  currentPhotoUrl,
  onUpload,
  loading = false,
  canEdit = true,
  className,
}: PhotoUploaderProps) => {
  const resolved = resolveFileUrl(currentPhotoUrl)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = (files: File[]) => {
    if (files[0]) onUpload(files[0])
  }

  // ── Ada foto ──
  if (resolved) {
    return (
      <div className={cn('relative', className)}>
        <SafeImage
          src={resolved}
          alt="Foto resource"
          className="h-48 w-full rounded-xl object-cover"
          fallbackClassName="h-48 w-full rounded-xl bg-[var(--bg-subtle)] text-[var(--text-disabled)]"
          fallback={<ImageIcon className="h-10 w-10" />}
        />
        {canEdit && (
          <>
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png"
              className="hidden"
              disabled={loading}
              onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])}
            />
            <AppButton
              type="button"
              variant="secondary"
              size="sm"
              loading={loading}
              onClick={() => inputRef.current?.click()}
              className="absolute bottom-2 right-2"
            >
              Ganti Foto
            </AppButton>
          </>
        )}
      </div>
    )
  }

  // ── Belum ada foto ──
  if (!canEdit) {
    return (
      <div
        className={cn(
          'flex h-48 w-full items-center justify-center rounded-xl bg-[var(--bg-subtle)] text-[var(--text-disabled)]',
          className,
        )}
      >
        <ImageIcon className="h-10 w-10" />
      </div>
    )
  }

  return (
    <InputFile
      accept="image/jpeg,image/png"
      onChange={handleFiles}
      className={className}
      hint="Format JPG atau PNG"
    />
  )
}
