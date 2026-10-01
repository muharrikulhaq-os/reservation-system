'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Building2, Pencil, Plus, Power, Trash2 } from 'lucide-react'
import { Card } from '@/components/common'
import { PageHeader } from '@/components/shared'
import { AppButton, InputSelect, InputText, InputTextArea } from '@/components/ui-custom'
import { cn } from '@/lib/utils'
import { useDebounce } from '@/hooks'
import { VENDOR_TYPE_OPTIONS } from '@/constants'
import type { Vendor } from '@/types'
import { vendorSchema, type VendorFormData } from '@/schemas/maintenance.schema'
import { useDeleteVendor, useSaveVendor, useToggleVendor, useVendors } from '../hooks/useMaintenance'
import { MaintenanceNav } from './MaintenanceNav'
import { ErrorAlert, FormDialog } from './shared'

// Master vendor: bengkel rekanan & pemilik kendaraan sewa.
export const Vendors = () => {
  const [search, setSearch] = useState('')
  const q = useDebounce(search)
  const { data, isLoading } = useVendors(q ? { search: q } : undefined)
  const toggle = useToggleVendor()
  const del = useDeleteVendor()
  const [editing, setEditing] = useState<Vendor | 'new' | null>(null)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Pemeliharaan"
        description="Vendor & bengkel tujuan maintenance, serta pemilik kendaraan sewa"
        actions={
          <AppButton leftIcon={<Plus className="h-4 w-4" />} onClick={() => setEditing('new')}>
            Tambah Vendor
          </AppButton>
        }
      />
      <MaintenanceNav />

      <div className="w-full max-w-[280px]">
        <InputText placeholder="Cari nama / PIC…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <ErrorAlert error={toggle.error ?? del.error} />

      <Card>
        {isLoading ? (
          <p className="py-8 text-center text-sm text-[var(--text-secondary)]">Memuat…</p>
        ) : (data ?? []).length === 0 ? (
          <p className="py-8 text-center text-sm text-[var(--text-secondary)]">
            Belum ada vendor. Tambahkan bengkel rekanan atau pemilik kendaraan sewa.
          </p>
        ) : (
          <ul className="divide-y divide-[var(--border-divider)]">
            {(data ?? []).map((v) => (
              <li key={v.id} className={cn('flex flex-wrap items-center gap-3 py-3 first:pt-0', !v.isActive && 'opacity-60')}>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--primary-light)] text-[var(--primary)]">
                  <Building2 className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2 font-semibold text-[var(--text-primary)]">
                    {v.name}
                    <span className="rounded-full bg-[var(--bg-subtle)] px-2 py-0.5 text-xs font-medium text-[var(--text-secondary)]">
                      {v.typeLabel}
                    </span>
                    {!v.isActive && (
                      <span className="rounded-full bg-[#F3F4F6] px-2 py-0.5 text-xs font-medium text-[#374151]">Nonaktif</span>
                    )}
                  </p>
                  <p className="truncate text-xs text-[var(--text-secondary)]">
                    {[v.picName, v.phone, v.email].filter(Boolean).join(' · ') || 'Kontak belum diisi'}
                  </p>
                  <p className="text-xs text-[var(--text-disabled)]">
                    {v.vehicleCount} kendaraan sewa · {v.maintenanceCount} maintenance
                  </p>
                </div>
                <div className="flex gap-1">
                  <AppButton variant="ghost" size="icon-sm" aria-label="Ubah" onClick={() => setEditing(v)}>
                    <Pencil className="h-4 w-4" />
                  </AppButton>
                  <AppButton
                    variant="ghost"
                    size="icon-sm"
                    aria-label={v.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                    loading={toggle.isPending && toggle.variables === v.id}
                    onClick={() => toggle.mutate(v.id)}
                  >
                    <Power className="h-4 w-4" />
                  </AppButton>
                  <AppButton
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Hapus"
                    className="text-[var(--danger)] hover:text-[var(--danger)]"
                    onClick={() => {
                      if (window.confirm(`Hapus vendor "${v.name}"?`)) del.mutate(v.id)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </AppButton>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <VendorFormDialog vendor={editing} onClose={() => setEditing(null)} />
    </div>
  )
}

const VendorFormDialog = ({ vendor, onClose }: { vendor: Vendor | 'new' | null; onClose: () => void }) => {
  const save = useSaveVendor()
  const isEdit = vendor !== null && vendor !== 'new'
  const { register, handleSubmit, reset, formState: { errors } } = useForm<VendorFormData>({
    resolver: zodResolver(vendorSchema),
  })

  useEffect(() => {
    if (!vendor) return
    save.reset()
    reset(
      vendor === 'new'
        ? { name: '', type: 'WORKSHOP', address: '', picName: '', phone: '', email: '', note: '' }
        : {
            name: vendor.name,
            type: vendor.type,
            address: vendor.address ?? '',
            picName: vendor.picName ?? '',
            phone: vendor.phone ?? '',
            email: vendor.email ?? '',
            note: vendor.note ?? '',
          },
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vendor])

  const onSubmit = (d: VendorFormData) =>
    save.mutate(
      { id: isEdit ? (vendor as Vendor).id : undefined, payload: d },
      { onSuccess: onClose },
    )

  return (
    <FormDialog
      open={!!vendor}
      onOpenChange={(o) => !o && onClose()}
      title={isEdit ? 'Ubah Vendor' : 'Tambah Vendor'}
      icon={<Building2 className="h-5 w-5 text-[var(--primary)]" />}
      footer={
        <>
          <AppButton variant="secondary" onClick={onClose}>Batal</AppButton>
          <AppButton loading={save.isPending} onClick={handleSubmit(onSubmit)}>Simpan</AppButton>
        </>
      }
    >
      <ErrorAlert error={save.error} />
      <InputText label="Nama Vendor" required error={errors.name?.message} {...register('name')} />
      <InputSelect label="Jenis" required options={VENDOR_TYPE_OPTIONS} error={errors.type?.message} {...register('type')} />
      <InputTextArea label="Alamat" rows={2} hint="Tampil di surat pengajuan" {...register('address')} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InputText label="Nama PIC" {...register('picName')} />
        <InputText label="Telepon" {...register('phone')} />
      </div>
      <InputText label="Email" error={errors.email?.message} {...register('email')} />
      <InputTextArea label="Catatan" rows={2} {...register('note')} />
    </FormDialog>
  )
}
