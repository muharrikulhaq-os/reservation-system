'use client'

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

// Brand mark — kalender (inline SVG, tanpa dependency)
const CalendarIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
    <rect x="3" y="4" width="18" height="16" rx="2" stroke="white" strokeWidth="1.8" />
    <path d="M8 2v4M16 2v4M3 10h18" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M8 14h2M11 14h5M8 17h3" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

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
        <div
          className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl shadow-[0_6px_16px_rgba(45,44,232,0.30)]"
          style={{ backgroundColor: 'var(--primary)' }}
        >
          <CalendarIcon />
        </div>
        <h1
          className="text-[26px] font-bold leading-tight tracking-tight text-[var(--text-primary)]"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Reservation System
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
        © {new Date().getFullYear()} Reservation System
      </p>
    </div>
  </main>
)
