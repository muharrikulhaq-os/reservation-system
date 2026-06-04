import { redirect } from 'next/navigation'

// Root — arahkan ke dashboard. Middleware/proxy yang menangani
// redirect ke /login jika belum terautentikasi.
export default function RootPage() {
  redirect('/dashboard')
}
