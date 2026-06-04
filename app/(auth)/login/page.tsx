import type { Metadata } from 'next'
import { LoginPage } from '@/components/features/auth/LoginForm'

export const metadata: Metadata = {
  title: 'Masuk — Reservation System',
}

export default function Page() {
  return <LoginPage />
}