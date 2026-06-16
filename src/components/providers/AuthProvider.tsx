'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Wallet } from 'lucide-react'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        await supabase.auth.signInWithPassword({
          email: 'demo@budgetai.app',
          password: 'Demo1234!',
        })
      }
      setReady(true)
    }

    init()
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
