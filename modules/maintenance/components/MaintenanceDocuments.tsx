'use client'

import { useState } from 'react'
import { FileText, Paperclip, Trash2, Upload } from 'lucide-react'
import { Card, CardHeader } from '@/components/common'
import { AppButton, InputFile, InputSelect } from '@/components/ui-custom'
import { formatDateTime, resolveFileUrl } from '@/lib'
import { MAINTENANCE_DOC_KIND_OPTIONS, maintenanceDocKindLabel } from '@/constants'
import type { MaintenanceDocumentKind, MaintenanceRecord } from '@/types'
import { useDeleteMaintenanceDocument, useUploadMaintenanceDocuments } from '../hooks/useMaintenance'
import { ErrorAlert } from './shared'

// Dokumen pendukung: invoice vendor, scan surat/BA bertanda tangan, foto.
export const MaintenanceDocuments = ({ m }: { m: MaintenanceRecord }) => {
  const [kind, setKind] = useState<MaintenanceDocumentKind>('INVOICE')
  const [files, setFiles] = useState<File[]>([])
  const [inputKey, setInputKey] = useState(0)
  const upload = useUploadMaintenanceDocuments(m.id)
  const del = useDeleteMaintenanceDocument(m.id)
  const docs = m.documents ?? []

  const submit = () =>
    upload.mutate(
      { kind, files },
      {
        onSuccess: () => {
          setFiles([])
          setInputKey((k) => k + 1)
        },
      },
    )

  return (
    <Card>
      <CardHeader title="Dokumen" description="Invoice vendor, scan dokumen bertanda tangan, foto" />
      <ErrorAlert error={upload.error ?? del.error} />

      {docs.length === 0 ? (
        <p className="py-3 text-sm text-[var(--text-secondary)]">Belum ada dokumen.</p>
      ) : (
        <ul className="mb-4 divide-y divide-[var(--border-divider)]">
          {docs.map((d) => {
            const isPdf = d.fileName.toLowerCase().endsWith('.pdf')
            return (
              <li key={d.id} className="flex items-center gap-3 py-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--bg-subtle)] text-[var(--text-secondary)]">
                  {isPdf ? <FileText className="h-4 w-4" /> : <Paperclip className="h-4 w-4" />}
                </span>
                <div className="min-w-0 flex-1">
                  <a
                    href={resolveFileUrl(d.fileUrl) ?? '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="block truncate text-sm font-medium text-[var(--primary)] hover:underline"
                  >
                    {d.fileName}
                  </a>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {maintenanceDocKindLabel(d.kind)} · {d.uploadedBy} · {formatDateTime(d.createdAt)}
                  </p>
                </div>
                <AppButton
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Hapus ${d.fileName}`}
                  loading={del.isPending && del.variables === d.id}
                  onClick={() => {
                    if (window.confirm(`Hapus dokumen "${d.fileName}"?`)) del.mutate(d.id)
                  }}
                  className="text-[var(--danger)] hover:text-[var(--danger)]"
                >
                  <Trash2 className="h-4 w-4" />
                </AppButton>
              </li>
            )
          })}
        </ul>
      )}

      <div className="space-y-3 rounded-xl bg-[var(--bg-subtle)] p-4">
        <InputSelect
          label="Jenis Dokumen"
          options={MAINTENANCE_DOC_KIND_OPTIONS}
          value={kind}
          onChange={(e) => setKind(e.target.value as MaintenanceDocumentKind)}
        />
        <InputFile
          key={inputKey}
          multiple
          accept="image/*,application/pdf"
          hint="JPG, PNG, WEBP, atau PDF"
          onChange={setFiles}
        />
        <div className="flex justify-end">
          <AppButton
            size="sm"
            leftIcon={<Upload className="h-4 w-4" />}
            disabled={files.length === 0}
            loading={upload.isPending}
            onClick={submit}
          >
            Unggah
          </AppButton>
        </div>
      </div>
    </Card>
  )
}
