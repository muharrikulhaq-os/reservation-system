import type { Metadata } from 'next'
import { LoginPage } from '@/components/features/auth/LoginForm'

export const metadata: Metadata = {
  title: 'Masuk - Sistem Reservasi',
}

export default function Page() {
  return <LoginPage />
}