import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Edge-compatible auth check: look for the Supabase session cookie.
// Supabase SSR stores the JWT in a cookie named  sb-<project-ref>-auth-token
// We don't need to validate the JWT here — Supabase RLS enforces real security
// server-side. This proxy only handles UI redirects.
function hasSession(request: NextRequest): boolean {
  return request.cookies.getAll().some(
    ({ name, value }) =>
      name.includes('-auth-token') && value.length > 20
  )
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isAuthPage = pathname === '/login' || pathname === '/register'
  const authenticated = hasSession(request)

  // Unauthenticated user trying to access a protected page → /login
  if (!authenticated && !isAuthPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Authenticated user landing on login/register → dashboard
  if (authenticated && isAuthPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return NextResponse.next({ request })
}

export const config = {
  matcher: [
    // Skip Next.js internals, static files, and API routes
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
}
