'use client'

import { useEffect, useRef } from 'react'
import { Camera, Loader2, Trash2 } from 'lucide-react'
import { cn, getErrorMessage, resolveFileUrl, getInitials } from '@/lib'
import { SafeImage } from '@/components/shared'
import { useFileUpload, useUpdateProfilePhoto, useDeleteProfilePhoto } from '@/hooks'
import type { User } from '@/types'

interface ProfilePhotoUploadProps {
  user: User
}

// Warna & inisial senada dengan <UserAvatar/> tapi ukurannya jauh lebih
// besar (header profil) - tidak dipakai ulang komponennya karena butuh
// overlay tombol kamera + preview optimistik saat upload.
export const ProfilePhotoUpload = ({ user }: ProfilePhotoUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const { file, preview, error: validationError, handleChange, reset } = useFileUpload()

  const upload = useUpdateProfilePhoto()
  const remove = useDeleteProfilePhoto()

  // Pilih file valid → langsung upload, tanpa langkah konfirmasi terpisah.
  useEffect(() => {
    if (!file) return
    upload.mutate(file, { onSettled: reset })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file])

  const isBusy = upload.isPending || remove.isPending
  const photoUrl = preview ?? resolveFileUrl(user.profilePhoto)
  const error =
    validationError ??
    (upload.error ? getErrorMessage(upload.error) : null) ??
    (remove.error ? getErrorMessage(remove.error) : null)

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="group relative">
        <span className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--primary-light)] text-2xl font-semibold text-[var(--primary)]">
          {photoUrl ? (
            <SafeImage
              src={photoUrl}
              alt={user.name}
              className="h-full w-full object-cover"
              fallback={<span>{getInitials(user.name)}</span>}
            />
          ) : (
            getInitials(user.name)
          )}
        </span>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isBusy}
          aria-label="Ganti foto profil"
          className={cn(
            'absolute inset-0 flex items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity',
            'group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none disabled:cursor-not-allowed',
          )}
        >
          {isBusy ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Camera className="h-5 w-5" />
          )}
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleChange}
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isBusy}
          className="text-xs font-medium text-[var(--primary)] hover:underline disabled:opacity-50"
        >
          Ganti Foto
        </button>
        {resolveFileUrl(user.profilePhoto) && (
          <button
            type="button"
            onClick={() => remove.mutate()}
            disabled={isBusy}
            className="flex items-center gap-1 text-xs font-medium text-[var(--danger)] hover:underline disabled:opacity-50"
          >
            <Trash2 className="h-3 w-3" /> Hapus
          </button>
        )}
      </div>

      {error && <p className="max-w-[200px] text-center text-xs text-[var(--danger)]">{error}</p>}
    </div>
  )
}
