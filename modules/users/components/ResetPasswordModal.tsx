'use client'

import { useState } from 'react'
import { AlertCircle, CheckCircle2, Copy, KeyRound, RefreshCw } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { AppButton, InputPassword } from '@/components/ui-custom'
import { getErrorMessage } from '@/lib'
import { useResetUserPassword } from '../hooks/useUsers'

// ─────────────────────────────────────────
// RESET PASSWORD (ADMIN) — langsung, tanpa OTP.
// Admin sudah terautentikasi & berwenang, jadi tak perlu verifikasi email.
// Alur user biasa (lupa password) memakai OTP di /forgot-password.
// ─────────────────────────────────────────

interface Props {
  userId: number
  userName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Password acak yang mudah dibacakan ke user (tanpa karakter ambigu).
const generatePassword = (len = 12) => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'
  const pick = () => chars[Math.floor(Math.random() * chars.length)]
  return Array.from({ length: len - 1 }, pick).join('') + '!'
}

export const ResetPasswordModal = ({
  userId,
  userName,
  open,
  onOpenChange,
}: Props) => {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [done, setDone] = useState(false)
  const [copied, setCopied] = useState(false)

  const reset = useResetUserPassword()

  const tooShort = password.length > 0 && password.length < 8
  const mismatch = confirm.length > 0 && password !== confirm
  const canSubmit = password.length >= 8 && password === confirm && !reset.isPending

  const close = () => {
    onOpenChange(false)
    setPassword('')
    setConfirm('')
    setDone(false)
    setCopied(false)
    reset.reset()
  }

  const handleGenerate = () => {
    const p = generatePassword()
    setPassword(p)
    setConfirm(p)
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(password)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard bisa diblokir browser — abaikan, password tetap terlihat
    }
  }

  const handleSubmit = async () => {
    if (!canSubmit) return
    try {
      await reset.mutateAsync({ id: userId, newPassword: password })
      setDone(true)
    } catch {
      // ditampilkan via reset.error
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && close()}>
      <DialogContent className="rounded-2xl p-6 shadow-[var(--shadow-modal)] sm:max-w-md">
        <DialogHeader>
          <DialogTitle
            className="flex items-center gap-2 text-lg font-bold text-[var(--text-primary)]"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            <KeyRound className="h-5 w-5 text-[var(--primary)]" />
            Reset Password
          </DialogTitle>
          <DialogDescription className="text-xs text-[var(--text-secondary)]">
            Setel password baru untuk akun pengguna {userName}.
          </DialogDescription>
        </DialogHeader>

        {done ? (
          <div className="mt-2 space-y-4">
            <div className="flex items-start gap-2.5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                Password <span className="font-semibold">{userName}</span> berhasil
                direset.
              </span>
            </div>

            <div>
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.07em] text-[var(--text-secondary)]">
                Password baru
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 truncate rounded-lg border border-[var(--border-card)] bg-[var(--bg-subtle)] px-3 py-2 text-sm font-semibold text-[var(--text-primary)]">
                  {password}
                </code>
                <AppButton variant="secondary" size="sm" onClick={handleCopy}>
                  <Copy className="h-3.5 w-3.5" />
                  {copied ? 'Tersalin' : 'Salin'}
                </AppButton>
              </div>
              <p className="mt-2 text-xs text-[var(--text-secondary)]">
                Sampaikan ke pengguna melalui kanal yang aman dan minta segera
                menggantinya setelah login.
              </p>
            </div>

            <AppButton fullWidth onClick={() => close()}>
              Selesai
            </AppButton>
          </div>
        ) : (
          <div className="mt-2 space-y-4">
            {reset.error && (
              <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{getErrorMessage(reset.error)}</span>
              </div>
            )}

            <p className="text-sm text-[var(--text-secondary)]">
              Setel password baru untuk{' '}
              <span className="font-semibold text-[var(--text-primary)]">
                {userName}
              </span>
              . Password lama langsung tidak berlaku.
            </p>

            <InputPassword
              label="Password Baru"
              required
              placeholder="Minimal 8 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={tooShort ? 'Minimal 8 karakter' : undefined}
            />

            <InputPassword
              label="Konfirmasi Password"
              required
              placeholder="Ulangi password baru"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              error={mismatch ? 'Konfirmasi tidak cocok' : undefined}
            />

            <AppButton
              variant="secondary"
              size="sm"
              leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
              onClick={handleGenerate}
            >
              Buat Password Acak
            </AppButton>

            <div className="flex gap-3 pt-1">
              <AppButton
                variant="secondary"
                fullWidth
                disabled={reset.isPending}
                onClick={() => close()}
              >
                Batal
              </AppButton>
              <AppButton
                fullWidth
                loading={reset.isPending}
                disabled={!canSubmit}
                onClick={handleSubmit}
              >
                Reset Password
              </AppButton>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
