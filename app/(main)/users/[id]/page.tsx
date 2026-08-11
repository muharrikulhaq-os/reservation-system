import type { Metadata } from 'next'
import { UserDetail } from '@/modules/users'

export const metadata: Metadata = {
  title: 'Detail Pengguna — Sistem Reservasi',
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <UserDetail userId={Number(id)} />
}
