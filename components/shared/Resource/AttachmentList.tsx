'use client'

import { Download, FileText, Trash2 } from 'lucide-react'
import { IconButton, InputFile } from '@/components/ui-custom'
import { formatFileSize, resolveFileUrl } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { Attachment, CreateAttachmentPayload } from '@/types'

// ─────────────────────────────────────────
// ATTACHMENT LIST
// Daftar lampiran + upload baru.
// ─────────────────────────────────────────

interface AttachmentListProps {
  attachments: Attachment[]
  onUpload: (payload: CreateAttachmentPayload) => void
  onDelete: (id: number) => void
  uploadLoading?: boolean
  /** false = hanya lihat (user biasa) */
  canEdit?: boolean
  className?: string
}

export const AttachmentList = ({
  attachments,
  onUpload,
  onDelete,
  uploadLoading = false,
  canEdit = false,
  className,
}: AttachmentListProps) => {
  const handleFiles = (files: File[]) => {
    if (files[0]) onUpload({ file: files[0] })
  }

  return (
    <div className={cn('space-y-3', className)}>
      {attachments.length === 0 ? (
        <p className="text-sm text-[var(--text-secondary)]">Belum ada lampiran</p>
      ) : (
        <ul className="space-y-2">
          {attachments.map((att) => {
            const url = resolveFileUrl(att.filePath)
            return (
              <li
                key={att.id}
                className="flex items-center gap-3 rounded-lg border border-[var(--border-card)] p-3"
              >
                <FileText className="h-4 w-4 shrink-0 text-[var(--text-secondary)]" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] text-[var(--text-primary)]">
                    {att.fileName}
                  </p>
                  {att.fileSize != null && (
                    <p className="text-xs text-[var(--text-secondary)]">
                      {formatFileSize(att.fileSize)}
                    </p>
                  )}
                </div>

                {url && (
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={att.fileName}
                  >
                    <IconButton
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Unduh ${att.fileName}`}
                      icon={<Download className="h-4 w-4" />}
                    />
                  </a>
                )}

                {canEdit && (
                  <IconButton
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Hapus ${att.fileName}`}
                    className="hover:text-[var(--danger)]"
                    onClick={() => onDelete(att.id)}
                    icon={<Trash2 className="h-4 w-4" />}
                  />
                )}
              </li>
            )
          })}
        </ul>
      )}

      {canEdit && (
        <InputFile
          onChange={handleFiles}
          hint={uploadLoading ? 'Mengunggah…' : undefined}
        />
      )}
    </div>
  )
}
