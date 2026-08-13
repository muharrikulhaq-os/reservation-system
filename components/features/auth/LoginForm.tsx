'use client'

import Image from 'next/image'
import Link from 'next/link'
import logoLogin from '@/img/kce-menu.png'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail } from 'lucide-react'
import { loginSchema, type LoginFormData } from '@/schemas/auth.schema'
import { useLogin } from '@/hooks'
import { getErrorMessage } from '@/lib'
import { Alert, Button, InputField, PasswordInput } from '@/components/common'

// ─────────────────────────────────────────
// LOGIN PAGE — self-contained
// Dipanggil di app/(auth)/login/page.tsx → <LoginPage />
// ─────────────────────────────────────────

// ── Form ──────────────────────────────────
const LoginForm = () => {
  const { mutate: login, isPending, error } = useLogin()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  return (
    <form onSubmit={handleSubmit((data) => login(data))} noValidate className="flex flex-col gap-5">
      {error && <Alert variant="error">{getErrorMessage(error)}</Alert>}

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

      <div className="-mt-2 text-right">
        <Link
          href="/forgot-password"
          className="text-xs font-medium text-[var(--primary)] hover:underline"
        >
          Lupa password?
        </Link>
      </div>

      <Button type="submit" variant="primary" size="lg" fullWidth loading={isPending} className="mt-1">
        Masuk
      </Button>
    </form>
  )
}

// ── Page ──────────────────────────────────
export const LoginPage = () => (
  <main
    className="flex min-h-screen items-center justify-center p-4"
    style={{
      background:
        'radial-gradient(1100px 560px at 0% 0%, var(--primary-light), transparent 55%), var(--bg-page)',
    }}
  >
    <div className="w-full max-w-[420px]">
      {/* Brand */}
      <header className="mb-8 flex flex-col items-center text-center">
        <div className="mb-4 flex items-center justify-center">
          <Image src={logoLogin} alt="KCE Logo" width={80} height={80} className="object-contain" />
        </div>
        <h1
          className="text-[26px] font-bold leading-tight tracking-tight text-[var(--text-primary)]"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Sistem Reservasi
        </h1>
        <p className="mt-1.5 text-sm text-[var(--text-secondary)]">Masuk untuk melanjutkan</p>
      </header>

      {/* Card */}
      <div
        className="rounded-2xl border border-[var(--border-card)] bg-[var(--bg-card)] p-7 shadow-[var(--shadow-card)]"
      >
        <LoginForm />
      </div>

      {/* Footer */}
      <p className="mt-6 text-center text-xs text-[var(--text-disabled)]">
        © {new Date().getFullYear()} Sistem Reservasi
      </p>
    </div>
  </main>
)
