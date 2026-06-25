import { NextRequest, NextResponse } from 'next/server'

export function checkOrigin(request: NextRequest): NextResponse | null {
  const origin = request.headers.get('origin')
  // No Origin header = server-to-server call (curl, webhook) — allow
  if (!origin) return null

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
  const allowed =
    origin === 'http://localhost:3000' ||
    origin === 'https://localhost:3000' ||
    origin.endsWith('.vercel.app') ||
    (appUrl !== '' && origin === appUrl)

  if (!allowed) {
    console.warn(`CSRF: rejected origin "${origin}"`)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  return null
}
