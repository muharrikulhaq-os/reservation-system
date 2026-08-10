'use client'

import { useState } from 'react'
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Upload,
  XCircle,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { AppButton, InputFile } from '@/components/ui-custom'
import { getErrorMessage } from '@/lib'
import type { BulkImportResult } from '@/types'
import {
  useBulkImportUsers,
  useDownloadUserBulkTemplate,
} from '../hooks/useUsers'

// ─────────────────────────────────────────
// USER BULK IMPORT DIALOG
// 1. Unduh template .xlsx (berisi sheet Referensi: role & departemen valid)
// 2. Unggah file terisi → backend memproses per baris
// 3. Tampilkan ringkasan + baris yang gagal beserta alasannya
// ─────────────────────────────────────────

export interface UserBulkImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const UserBulkImportDialog = ({
  open,
  onOpenChange,
}: UserBulkImportDialogProps) => {
  const [file, setFile] = useState<File | null>(null)
  // InputFile menyimpan state internal — ganti key untuk mereset pilihan file.
  const [fileInputKey, setFileInputKey] = useState(0)
  const [result, setResult] = useState<BulkImportResult | null>(null)

  const template = useDownloadUserBulkTemplate()
  const importer = useBulkImportUsers()

  const reset = () => {
    setFile(null)
    setResult(null)
    setFileInputKey((k) => k + 1)
    template.reset()
    importer.reset()
  }

  const handleClose = (next: boolean) => {
    if (!next) reset()
    onOpenChange(next)
  }

  const handleImport = () => {
    if (!file) return
    importer.mutate(file, {
      onSuccess: (data) => {
        setResult(data)
        setFile(null)
        setFileInputKey((k) => k + 1)
      },
    })
  }

  const failedRows = result?.results.filter((r) => !r.success) ?? []

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[85vh] overflow-y-auto rounded-2xl p-6 shadow-[var(--shadow-modal)] sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle
            className="text-lg font-bold text-[var(--text-primary)]"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Import Pengguna dari Excel
          </DialogTitle>
        </DialogHeader>

        <div className="mt-2 space-y-5">
          {/* Langkah 1 — template */}
          <div className="rounded-xl border border-[var(--border-card)] bg-[var(--bg-subtle)] p-4">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--primary-light)]">
                <FileSpreadsheet className="h-4 w-4 text-[var(--primary)]" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  1. Unduh template
                </p>
                <p className="mt-1 text-xs text-[var(--text-secondary)]">
                  Template berisi kolom wajib{' '}
                  <span className="font-medium text-[var(--text-primary)]">
                    employeeId, name, email, role, department
                  </span>{' '}
                  (kolom <span className="font-medium">password</span> opsional),
                  serta sheet <span className="font-medium">Referensi</span> berisi
                  daftar role &amp; departemen yang valid. Hapus baris contoh sebelum
                  mengunggah.
                </p>
              </div>
              <AppButton
                variant="secondary"
                size="sm"
                leftIcon={<Download className="h-4 w-4" />}
                loading={template.isPending}
                onClick={() => template.mutate()}
              >
                Template
              </AppButton>
            </div>

            {template.error && (
              <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{getErrorMessage(template.error)}</span>
              </div>
            )}
          </div>

          {/* Langkah 2 — unggah */}
          <div>
            <p className="mb-2 text-sm font-semibold text-[var(--text-primary)]">
              2. Unggah file terisi
            </p>
            <InputFile
              key={fileInputKey}
              accept=".xlsx,.xlsm"
              maxSizeMb={5}
              hint="Format .xlsx atau .xlsm, maksimal 5MB."
              onChange={(files) => setFile(files[0] ?? null)}
            />
          </div>

          {importer.error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{getErrorMessage(importer.error)}</span>
            </div>
          )}

          {/* Hasil import */}
          {result && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] p-3 text-center">
                  <p className="text-xs text-[var(--text-secondary)]">Total baris</p>
                  <p className="mt-1 text-xl font-bold text-[var(--text-primary)]">
                    {result.total}
                  </p>
                </div>
                <div className="rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] p-3 text-center">
                  <p className="text-xs text-[var(--text-secondary)]">Berhasil</p>
                  <p className="mt-1 text-xl font-bold text-[var(--success)]">
                    {result.successCount}
                  </p>
                </div>
                <div className="rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] p-3 text-center">
                  <p className="text-xs text-[var(--text-secondary)]">Gagal</p>
                  <p className="mt-1 text-xl font-bold text-[var(--danger)]">
                    {result.failedCount}
                  </p>
                </div>
              </div>

              {failedRows.length === 0 ? (
                <div className="flex items-start gap-2.5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-[var(--success)]">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>Semua baris berhasil diimport.</span>
                </div>
              ) : (
                <div className="overflow-hidden rounded-xl border border-[var(--border-card)]">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[var(--bg-subtle)]">
                      <tr className="text-[10px] font-semibold uppercase tracking-[0.07em] text-[var(--text-secondary)]">
                        <th className="px-3 py-2">Baris</th>
                        <th className="px-3 py-2">Nama</th>
                        <th className="px-3 py-2">Email</th>
                        <th className="px-3 py-2">Alasan gagal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-divider)]">
                      {failedRows.map((row) => (
                        <tr key={row.row} className="align-top">
                          <td className="px-3 py-2 text-[var(--text-secondary)]">
                            {row.row}
                          </td>
                          <td className="px-3 py-2 text-[var(--text-primary)]">
                            {row.name || '—'}
                          </td>
                          <td className="px-3 py-2 text-[var(--text-secondary)]">
                            {row.email || '—'}
                          </td>
                          <td className="px-3 py-2">
                            <span className="flex items-start gap-1.5 text-[var(--danger)]">
                              <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                              {row.error}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {failedRows.length > 0 && (
                <p className="text-xs text-[var(--text-secondary)]">
                  Perbaiki baris yang gagal di file Excel, lalu unggah ulang. Baris
                  yang sudah berhasil tidak perlu diikutkan lagi.
                </p>
              )}
            </div>
          )}

          {/* Aksi */}
          <div className="flex gap-3 pt-1">
            <AppButton
              variant="secondary"
              fullWidth
              disabled={importer.isPending}
              onClick={() => handleClose(false)}
            >
              {result ? 'Tutup' : 'Batal'}
            </AppButton>
            <AppButton
              variant="primary"
              fullWidth
              leftIcon={<Upload className="h-4 w-4" />}
              loading={importer.isPending}
              disabled={!file}
              onClick={handleImport}
            >
              Import
            </AppButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
