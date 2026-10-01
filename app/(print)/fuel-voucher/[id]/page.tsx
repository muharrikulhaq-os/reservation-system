import type { Metadata } from 'next'
import { VoucherPrint } from '@/modules/fuel'

export const metadata: Metadata = {
  title: 'Cetak Voucher BBM - Sistem Reservasi',
}

// Halaman cetak voucher (printer thermal) - di luar layout (main) supaya tanpa
// sidebar/navbar. Tetap butuh login (proxy.ts); API membatasi driver hanya
// bisa membuka voucher miliknya.
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <VoucherPrint id={Number(id)} />
}
