import type { Metadata } from 'next'
import { QueryProvider } from '@/components/common/Provider/QueryProvider'
import { AuthProvider } from '@/components/common/Provider/AuthProvider'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: 'Reservation System',
  description: 'Platform peminjaman kendaraan dan ruang rapat',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <QueryProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  )
}