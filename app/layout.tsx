import type { Metadata } from 'next'
import { QueryProvider } from '@/components/common/Provider/QueryProvider'
import { AuthProvider } from '@/components/common/Provider/AuthProvider'
import '@/app/globals.css'
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: 'Sistem Reservasi',
  description: 'Platform peminjaman kendaraan dan ruang rapat',
  manifest: '/manifest.json',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={cn("font-sans", geist.variable)}>
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