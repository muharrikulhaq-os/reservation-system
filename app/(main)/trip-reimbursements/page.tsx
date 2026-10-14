import type { Metadata } from 'next'
import { TripReimbursements } from '@/modules/booking'

export const metadata: Metadata = {
  title: 'Reimburse Supir - Sistem Reservasi',
}

export default function Page() {
  return <TripReimbursements />
}
