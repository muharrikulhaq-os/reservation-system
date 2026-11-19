'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AlertCircle, Pencil, Phone, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { AppButton, InputText } from '@/components/ui-custom'
import { getErrorMessage } from '@/lib'
import { useUpdateMyPhone } from '@/hooks'

// ─────────────────────────────────────────
// NOMOR HP SENDIRI - semua role bisa mengisi (bila belum ada) atau mengubah.
// Backend: PUT /users/me/phone (aturan format sama: 8-15 digit, boleh +, spasi, -).
// ─────────────────────────────────────────

const schema = z.object({
  phoneNumber: z
    .string()
    .trim()
    .min(1, 'Nomor HP wajib diisi')
    .regex(/^\+?[0-9 ().-]+$/, 'Hanya angka, +, spasi, atau -')
    .refine((v) => {
      const digits = v.replace(/\D/g, '').length
      return digits >= 8 && digits <= 15
    }, 'Nomor HP harus 8-15 digit'),
})
type FormData = z.infer<typeof schema>

export const PhoneNumberField = ({ phoneNumber }: { phoneNumber?: string | null }) => {
  const [editing, setEditing] = useState(false)
  const update = useUpdateMyPhone()
  const current = phoneNumber?.trim() ?? ''

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { phoneNumber: current } })

  const open = () => {
    reset({ phoneNumber: current })
    update.reset()
    setEditing(true)
  }

  const onSubmit = (data: FormData) =>
    update.mutate(data.phoneNumber, {
      onSuccess: () => {
        toast.success(current ? 'Nomor HP diperbarui.' : 'Nomor HP tersimpan.')
        setEditing(false)
      },
    })

  return (
    <div className="flex items-start gap-3 py-2.5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--bg-subtle)] text-[var(--text-secondary)]">
        <Phone className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.07em] text-[var(--text-secondary)]">No. HP</p>
        {editing ? (
          <form noValidate onSubmit={handleSubmit(onSubmit)} className="mt-1.5 space-y-3">
            {update.error && (
              <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{getErrorMessage(update.error)}</span>
              </div>
            )}
            <InputText
              type="tel"
              inputMode="tel"
              placeholder="mis. 0812 3456 7890"
              autoFocus
              error={errors.phoneNumber?.message}
              {...register('phoneNumber')}
            />
            <div className="flex gap-2">
              <AppButton type="submit" size="sm" loading={update.isPending} disabled={update.isPending}>
                Simpan
              </AppButton>
              <AppButton type="button" size="sm" variant="secondary" disabled={update.isPending} onClick={() => setEditing(false)}>
                Batal
              </AppButton>
            </div>
          </form>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <p className={current ? 'truncate text-sm font-medium text-[var(--text-primary)]' : 'text-sm text-[var(--text-disabled)]'}>
              {current || 'Belum diisi'}
            </p>
            <AppButton
              size="sm"
              variant={current ? 'ghost' : 'secondary'}
              leftIcon={current ? <Pencil className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
              onClick={open}
            >
              {current ? 'Ubah' : 'Tambah'}
            </AppButton>
          </div>
        )}
      </div>
    </div>
  )
}
