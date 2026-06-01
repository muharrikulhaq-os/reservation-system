'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail } from 'lucide-react'
import { loginSchema, type LoginFormData } from '@/schemas/auth.schema'
import { useLogin } from '@/hooks'
import { getErrorMessage } from '@/lib'
import { InputField, PasswordInput, Button } from '@/components/common'

export const LoginForm = () => {
  const { mutate: login, isPending, error } = useLogin()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = (data: LoginFormData) => login(data)

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">

      {/* Server error */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-[var(--danger)]">
          {getErrorMessage(error)}
        </div>
      )}

      <InputField
        label="Email"
        type="email"
        placeholder="nama@perusahaan.com"
        autoComplete="email"
        leftIcon={<Mail className="h-4 w-4" />}
        error={errors.email?.message}
        {...register('email')}
      />

      <PasswordInput
        label="Password"
        placeholder="Masukkan password"
        autoComplete="current-password"
        error={errors.password?.message}
        {...register('password')}
      />

      <Button
        type="submit"
        fullWidth
        loading={isPending}
        className="mt-2"
      >
        Masuk
      </Button>

    </form>
  )
}