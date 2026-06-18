import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './types'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: {
        // Ensure auth cookies are sent for ALL paths, not just /login or /register.
        // Without this, document.cookie defaults to the current page path,
        // so cookies set on /login would never reach the proxy at /.
        path: '/',
        sameSite: 'lax',
        secure: true,
        maxAge: 60 * 60 * 24 * 365, // 1 year
      },
    }
  )
}
