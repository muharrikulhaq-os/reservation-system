'use client'

import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { AppButton, InputPassword } from '@/components/ui-custom'
import { getErrorMessage } from '@/lib'
import { useChangePassword } from '@/hooks'
import {
  changePasswordSchema,
  type ChangePasswordFormData,
} from '@/schemas/profile.schema'

export const ChangePasswordForm = () => {
  const { mutate, isPending, error, isSuccess, reset: resetMutation } = useChangePassword()

  const {
    register,
    handleSubmit,
    reset: resetForm,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  })

  const onSubmit = (data: ChangePasswordFormData) =>
    mutate(
      { currentPassword: data.currentPassword, newPassword: data.newPassword },
      { onSuccess: () => resetForm() },
    )

  return (
    <form
      onSubmit={handleSubmit((data) => {
        resetMutation()
        onSubmit(data)
      })}
      className="space-y-4"
    >
      {isSuccess && (
        <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-[var(--success)]">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Password berhasil diubah.
        </div>
      )}
      {error && (
        <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{getErrorMessage(error)}</span>
        </div>
      )}

      <InputPassword
        label="Password Saat Ini"
        required
        placeholder="Masukkan password saat ini"
        error={errors.currentPassword?.message}
        {...register('currentPassword')}
      />
      <InputPassword
        label="Password Baru"
        required
        placeholder="Minimal 8 karakter"
        error={errors.newPassword?.message}
        {...register('newPassword')}
      />
      <InputPassword
        label="Konfirmasi Password Baru"
        required
        placeholder="Ulangi password baru"
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />

      <div className="flex items-center justify-between pt-1">
        <Link
          href="/forgot-password"
          className="text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--primary)] hover:underline"
        >
          Lupa password saat ini?
        </Link>
        <AppButton type="submit" loading={isPending} disabled={isPending}>
          Simpan Password
        </AppButton>
      </div>
    </form>
  )
}
