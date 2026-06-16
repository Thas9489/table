'use client'
import { useEffect, useState } from 'react'
import { Wallet } from 'lucide-react'

/**
 * AuthProvider — lightweight version for demo mode.
 * Skips GoTrue sign-in (which is unreliable in sandbox environments)
 * and renders children immediately after a short paint delay.
 * RLS policies are set to open (anon key), data is filtered
 * by user_id in each hook explicitly.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // One animation frame so the loading splash renders before we swap in the app
    const id = requestAnimationFrame(() => setReady(true))
    return () => cancelAnimationFrame(id)
  }, [])

  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200 animate-pulse">
            <Wallet size={22} className="text-white" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-slate-700">BudgetAI</p>
            <p className="text-xs text-slate-400 mt-0.5">Loading your workspace…</p>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
