import type { Metadata } from 'next'
import { ForgotPasswordPage } from '@/components/features/auth/ForgotPasswordForm'

export const metadata: Metadata = {
  title: 'Lupa Password - Sistem Reservasi',
}

export default function Page() {
  return <ForgotPasswordPage />
}
