// ─────────────────────────────────────────
// useFileUpload
// Validasi & preview file sebelum upload
// Dipakai di form foto kendaraan, ruangan,
// profil, dan lampiran dokumen
// ─────────────────────────────────────────

import { useState, useCallback } from 'react'
import { APP_CONFIG } from '@/constants'
import { isFileTooLarge, formatFileSize } from '@/lib'

interface FileUploadOptions {
  maxMb?: number
  acceptedTypes?: string[]
}

interface FileUploadReturn {
  file: File | null
  preview: string | null  // object URL untuk image preview
  error: string | null
  isDirty: boolean
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  reset: () => void
}

export const useFileUpload = (options: FileUploadOptions = {}): FileUploadReturn => {
  const {
    maxMb         = APP_CONFIG.MAX_FILE_SIZE_MB,
    acceptedTypes = APP_CONFIG.ACCEPTED_IMAGE_TYPES,
  } = options

  const [file,    setFile]    = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [error,   setError]   = useState<string | null>(null)
  const [isDirty, setIsDirty] = useState(false)

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = e.target.files?.[0]
      if (!selected) return

      setIsDirty(true)
      setError(null)

      if (!acceptedTypes.includes(selected.type)) {
        setError(`Format tidak didukung. Gunakan: ${acceptedTypes.join(', ')}`)
        return
      }

      if (isFileTooLarge(selected, maxMb)) {
        setError(`Ukuran file melebihi ${formatFileSize(maxMb * 1_048_576)}`)
        return
      }

      // Revoke URL lama untuk hindari memory leak
      if (preview) URL.revokeObjectURL(preview)

      setFile(selected)

      if (selected.type.startsWith('image/')) {
        setPreview(URL.createObjectURL(selected))
      } else {
        setPreview(null)
      }
    },
    [acceptedTypes, maxMb, preview],
  )

  const reset = useCallback(() => {
    if (preview) URL.revokeObjectURL(preview)
    setFile(null)
    setPreview(null)
    setError(null)
    setIsDirty(false)
  }, [preview])

  return { file, preview, error, isDirty, handleChange, reset }
}
