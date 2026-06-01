// ─────────────────────────────────────────
// NEXT.JS MIDDLEWARE
// Route protection + role-based access
// Berjalan di Edge Runtime — tidak bisa
// akses localStorage, harus pakai cookies
// ─────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { TOKEN_CONFIG } from '@/constants'

// ── Route Definitions ────────────────────

const PUBLIC_ROUTES  = ['/login', '/register', '/guest-booking']
const AUTH_ROUTES    = ['/login', '/register']  // redirect ke dashboard jika sudah login
const ADMIN_ROUTES   = ['/admin', '/reports', '/users', '/settings']
const DRIVER_ROUTES  = ['/driver']

// ── Helpers ──────────────────────────────

const isPublicRoute  = (path: string) => PUBLIC_ROUTES.some((r)  => path.startsWith(r))
const isAuthRoute    = (path: string) => AUTH_ROUTES.some((r)    => path.startsWith(r))
const isAdminRoute   = (path: string) => ADMIN_ROUTES.some((r)   => path.startsWith(r))
const isDriverRoute  = (path: string) => DRIVER_ROUTES.some((r)  => path.startsWith(r))

// ─────────────────────────────────────────
// MIDDLEWARE
// ─────────────────────────────────────────

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Baca token dari cookie (disimpan saat login)
  const accessToken = request.cookies.get(TOKEN_CONFIG.ACCESS_TOKEN_KEY)?.value
  const userRole    = request.cookies.get('user_role')?.value

  const isLoggedIn  = !!accessToken

  // 1. Sudah login tapi akses halaman auth → redirect ke dashboard
  if (isLoggedIn && isAuthRoute(pathname)) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // 2. Belum login tapi akses halaman protected → redirect ke login
  if (!isLoggedIn && !isPublicRoute(pathname)) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // 3. Role-based: admin-only routes
  if (isLoggedIn && isAdminRoute(pathname) && userRole !== 'ADMIN') {
    return NextResponse.redirect(new URL('/unauthorized', request.url))
  }

  // 4. Role-based: driver-only routes
  if (isLoggedIn && isDriverRoute(pathname) && userRole !== 'DRIVER') {
    return NextResponse.redirect(new URL('/unauthorized', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Semua route kecuali static files & API routes internal
    '/((?!_next/static|_next/image|favicon.ico|files/).*)',
  ],
}