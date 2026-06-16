'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Budget } from '@/lib/supabase/types'

const DEMO_USER_ID = 'a1b2c3d4-0000-0000-0000-000000000001'

export function useBudgets(month: number, year: number) {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from('budgets')
      .select('*, categories(*)')
      .eq('user_id', DEMO_USER_ID)
      .eq('month', month)
      .eq('year', year)
    setBudgets((data as Budget[]) ?? [])
    setLoading(false)
  }, [month, year])

  useEffect(() => { fetch() }, [fetch])

  const upsertBudget = async (
    category_id: string,
    amount: number,
    alert_threshold: number = 80
  ) => {
    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from('budgets').upsert(
      { user_id: DEMO_USER_ID, category_id, month, year, amount, alert_threshold },
      { onConflict: 'user_id,category_id,month,year' }
    )
    if (!error) fetch()
    return error
  }

  const deleteBudget = async (id: string): Promise<void> => {
    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('budgets').delete().eq('id', id).eq('user_id', DEMO_USER_ID)
    fetch()
  }

  return { budgets, loading, refresh: fetch, upsertBudget, deleteBudget }
}
