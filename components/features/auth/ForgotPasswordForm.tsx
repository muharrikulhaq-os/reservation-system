'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import logoLogin from '@/img/kce-menu.png'
import { ArrowLeft, CheckCircle2, KeyRound, Mail, ShieldCheck } from 'lucide-react'
import { getErrorMessage } from '@/lib'
import { Alert, Button, InputField, PasswordInput } from '@/components/common'
import { useForgotPassword, useVerifyOtp, useResetPassword } from '@/hooks'

// ─────────────────────────────────────────
// LUPA PASSWORD (user) - 3 langkah sesuai backend:
//   1. POST /auth/forgot-password { email }      → kirim OTP ke email
//   2. POST /auth/verify-otp      { email, otpCode } → dapat resetToken
//   3. POST /auth/reset-password  { resetToken, newPassword }
// Berbeda dengan admin yang bisa reset langsung dari detail pengguna.
// ─────────────────────────────────────────

type Step = 'email' | 'otp' | 'password' | 'done'

const STEPS: { key: Step; label: string }[] = [
  { key: 'email', label: 'Email' },
  { key: 'otp', label: 'Kode OTP' },
  { key: 'password', label: 'Password' },
]

const StepIndicator = ({ current }: { current: Step }) => {
  const activeIndex = STEPS.findIndex((s) => s.key === current)
  const index = activeIndex === -1 ? STEPS.length : activeIndex // 'done' → semua selesai

  return (
    <div className="mb-6 flex items-center gap-2">
      {STEPS.map((s, i) => {
        const state = i < index ? 'done' : i === index ? 'active' : 'idle'
        return (
          <div key={s.key} className="flex flex-1 flex-col gap-1.5">
            <span
              className="h-1 rounded-full transition-colors"
              style={{
                backgroundColor:
                  state === 'idle' ? 'var(--border-card)' : 'var(--primary)',
              }}
            />
            <span
              className="text-[10px] font-semibold uppercase tracking-[0.06em]"
              style={{
                color:
                  state === 'active'
                    ? 'var(--primary)'
                    : state === 'done'
                      ? 'var(--text-secondary)'
                      : 'var(--text-disabled)',
              }}
            >
              {s.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

const ForgotPasswordForm = () => {
  const router = useRouter()

  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')

  const forgot = useForgotPassword()
  const verify = useVerifyOtp()
  const reset = useResetPassword()

  const error = forgot.error ?? verify.error ?? reset.error

  // ── Langkah 1: kirim OTP ──
  const submitEmail = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    forgot.mutate(
      { email: email.trim() },
      { onSuccess: () => setStep('otp') },
    )
  }

  // ── Langkah 2: verifikasi OTP → resetToken ──
  const submitOtp = (e: React.FormEvent) => {
    e.preventDefault()
    if (!otp.trim()) return
    verify.mutate(
      { email: email.trim(), otpCode: otp.trim() },
      {
        onSuccess: (data) => {
          setResetToken(data.resetToken)
          setStep('password')
        },
      },
    )
  }

  // ── Langkah 3: set password baru ──
  const submitPassword = (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 8 || password !== confirm) return
    reset.mutate(
      { resetToken, newPassword: password },
      { onSuccess: () => setStep('done') },
    )
  }

  if (step === 'done') {
    return (
      <div className="space-y-5 text-center">
        <div className="flex justify-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50">
            <CheckCircle2 className="h-6 w-6 text-[var(--success)]" />
          </span>
        </div>
        <div>
          <p className="text-base font-bold text-[var(--text-primary)]">
            Password Berhasil Diubah
          </p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Silakan masuk memakai password baru Anda.
          </p>
        </div>
        <Button fullWidth onClick={() => router.replace('/login')}>
          Kembali ke Halaman Masuk
        </Button>
      </div>
    )
  }

  return (
    <div>
      <StepIndicator current={step} />

      {error && <Alert variant="error">{getErrorMessage(error)}</Alert>}

      {/* ── Langkah 1: email ── */}
      {step === 'email' && (
        <form onSubmit={submitEmail} className="space-y-5">
          <p className="text-sm text-[var(--text-secondary)]">
            Masukkan email akun Anda. Kami akan mengirim kode OTP untuk verifikasi.
          </p>
          <InputField
            label="Email"
            type="email"
            required
            placeholder="nama@perusahaan.com"
            leftIcon={<Mail className="h-4 w-4" />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            loading={forgot.isPending}
            disabled={!email.trim() || forgot.isPending}
          >
            Kirim Kode OTP
          </Button>
        </form>
      )}

      {/* ── Langkah 2: OTP ── */}
      {step === 'otp' && (
        <form onSubmit={submitOtp} className="space-y-5">
          <p className="text-sm text-[var(--text-secondary)]">
            Kode OTP telah dikirim ke{' '}
            <span className="font-semibold text-[var(--text-primary)]">{email}</span>{' '}
            bila email tersebut terdaftar. Cek juga folder spam.
          </p>
          <InputField
            label="Kode OTP"
            required
            inputMode="numeric"
            maxLength={6}
            placeholder="6 digit"
            leftIcon={<ShieldCheck className="h-4 w-4" />}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
          />
          <Button
            type="submit"
            fullWidth
            loading={verify.isPending}
            disabled={otp.length < 4 || verify.isPending}
          >
            Verifikasi Kode
          </Button>
          <button
            type="button"
            className="w-full text-center text-xs font-medium text-[var(--primary)] hover:underline disabled:opacity-60"
            disabled={forgot.isPending}
            onClick={() => forgot.mutate({ email: email.trim() })}
          >
            {forgot.isPending ? 'Mengirim ulang…' : 'Kirim ulang kode'}
          </button>
        </form>
      )}

      {/* ── Langkah 3: password baru ── */}
      {step === 'password' && (
        <form onSubmit={submitPassword} className="space-y-5">
          <p className="text-sm text-[var(--text-secondary)]">
            Kode terverifikasi. Buat password baru untuk akun Anda.
          </p>
          <PasswordInput
            label="Password Baru"
            required
            placeholder="Minimal 8 karakter"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={
              password.length > 0 && password.length < 8
                ? 'Minimal 8 karakter'
                : undefined
            }
          />
          <PasswordInput
            label="Konfirmasi Password"
            required
            placeholder="Ulangi password baru"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            error={
              confirm.length > 0 && confirm !== password
                ? 'Konfirmasi tidak cocok'
                : undefined
            }
          />
          <Button
            type="submit"
            fullWidth
            loading={reset.isPending}
            disabled={
              password.length < 8 || password !== confirm || reset.isPending
            }
          >
            Simpan Password Baru
          </Button>
        </form>
      )}

      <div className="mt-6 text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Kembali ke halaman masuk
        </Link>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────
export const ForgotPasswordPage = () => (
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
          <Image
            src={logoLogin}
            alt="KCE Logo"
            width={80}
            height={80}
            className="object-contain"
          />
        </div>
        <h1
          className="flex items-center gap-2 text-[26px] font-bold leading-tight tracking-tight text-[var(--text-primary)]"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          <KeyRound className="h-5 w-5 text-[var(--primary)]" />
          Lupa Password
        </h1>
        <p className="mt-1.5 text-sm text-[var(--text-secondary)]">
          Verifikasi email untuk menyetel ulang password
        </p>
      </header>

      {/* Card */}
      <div className="rounded-2xl border border-[var(--border-card)] bg-[var(--bg-card)] p-7 shadow-[var(--shadow-card)]">
        <ForgotPasswordForm />
      </div>

      {/* Footer */}
      <p className="mt-6 text-center text-xs text-[var(--text-disabled)]">
        © {new Date().getFullYear()} Sistem Reservasi
      </p>
    </div>
  </main>
)
