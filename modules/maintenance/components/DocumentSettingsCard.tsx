'use client'

import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FileSignature, ImageOff, Trash2, Upload } from 'lucide-react'
import { Card, CardHeader } from '@/components/common'
import { SafeImage } from '@/components/shared/media/SafeImage'
import { AppButton, InputText, InputTextArea } from '@/components/ui-custom'
import { resolveFileUrl } from '@/lib'
import { documentSettingsSchema, type DocumentSettingsFormData } from '@/schemas/maintenance.schema'
import { useDocumentLogo, useDocumentSettings, useUpdateDocumentSettings } from '../hooks/useMaintenance'
import { ErrorAlert } from './shared'

// Kop surat & penandatangan untuk PDF maintenance (surat pengajuan & berita acara).
export const DocumentSettingsCard = () => {
  const { data, isLoading } = useDocumentSettings()
  const save = useUpdateDocumentSettings()
  const { upload, remove } = useDocumentLogo()
  const fileRef = useRef<HTMLInputElement>(null)

  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<DocumentSettingsFormData>({
    resolver: zodResolver(documentSettingsSchema),
  })

  useEffect(() => {
    if (data)
      reset({
        companyName: data.companyName,
        companyAddress: data.companyAddress,
        companyPhone: data.companyPhone,
        companyEmail: data.companyEmail,
        signerName: data.signerName,
        signerTitle: data.signerTitle,
        letterCode: data.letterCode || 'KCE-MNT',
      })
  }, [data, reset])

  const year = new Date().getFullYear()

  return (
    <Card>
      <CardHeader
        title="Kop Surat & Penandatangan"
        description="Dipakai di PDF Surat Pengajuan Maintenance & Berita Acara"
        action={<FileSignature className="h-5 w-5 text-[var(--primary)]" />}
      />
      {isLoading ? (
        <p className="py-6 text-center text-sm text-[var(--text-secondary)]">Memuat…</p>
      ) : (
        <form onSubmit={handleSubmit((d) => save.mutate(d))} className="space-y-5">
          <ErrorAlert error={save.error ?? upload.error ?? remove.error} />

          {/* Logo */}
          <div className="flex flex-wrap items-center gap-4 rounded-xl bg-[var(--bg-subtle)] p-4">
            <span className="flex h-16 w-40 items-center justify-center overflow-hidden rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)]">
              {data?.logoUrl ? (
                <SafeImage
                  src={resolveFileUrl(data.logoUrl)}
                  alt="Logo kop surat"
                  className="max-h-full max-w-full object-contain"
                  fallback={<ImageOff className="h-5 w-5 text-[var(--text-disabled)]" />}
                />
              ) : (
                <span className="text-xs text-[var(--text-disabled)]">Belum ada logo</span>
              )}
            </span>
            <div className="flex flex-wrap gap-2">
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) upload.mutate(f)
                  e.target.value = ''
                }}
              />
              <AppButton
                type="button"
                size="sm"
                variant="secondary"
                leftIcon={<Upload className="h-4 w-4" />}
                loading={upload.isPending}
                onClick={() => fileRef.current?.click()}
              >
                {data?.logoUrl ? 'Ganti Logo' : 'Unggah Logo'}
              </AppButton>
              {data?.logoUrl && (
                <AppButton
                  type="button"
                  size="sm"
                  variant="ghost"
                  leftIcon={<Trash2 className="h-4 w-4" />}
                  loading={remove.isPending}
                  onClick={() => remove.mutate()}
                >
                  Hapus
                </AppButton>
              )}
            </div>
            <p className="w-full text-xs text-[var(--text-secondary)]">PNG atau JPG; logo melebar tetap proporsional di kop surat.</p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <InputText label="Nama Perusahaan" required error={errors.companyName?.message} {...register('companyName')} />
            </div>
            <div className="sm:col-span-2">
              <InputTextArea label="Alamat" rows={2} {...register('companyAddress')} />
            </div>
            <InputText label="Telepon" {...register('companyPhone')} />
            <InputText label="Email" error={errors.companyEmail?.message} {...register('companyEmail')} />
            <InputText label="Nama Penandatangan" hint="Tampil di bawah tanda tangan surat" {...register('signerName')} />
            <InputText label="Jabatan Penandatangan" {...register('signerTitle')} />
            <InputText
              label="Kode Surat"
              required
              error={errors.letterCode?.message}
              hint={`Contoh nomor: 001/<kode>/X/${year}`}
              {...register('letterCode')}
            />
          </div>

          <div className="flex justify-end">
            <AppButton type="submit" loading={save.isPending} disabled={!isDirty}>
              Simpan Pengaturan
            </AppButton>
          </div>
        </form>
      )}
    </Card>
  )
}
