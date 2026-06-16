'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Transaction } from '@/lib/supabase/types'

export function useTransactions(filters?: {
  month?: number
  year?: number
  type?: 'income' | 'expense'
  category_id?: string
}) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    const supabase = createClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query: any = supabase
      .from('transactions')
      .select('*, categories(*)')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })

    if (filters?.type) query = query.eq('type', filters.type)
    if (filters?.category_id) query = query.eq('category_id', filters.category_id)
    if (filters?.month && filters?.year) {
      const start = `${filters.year}-${String(filters.month).padStart(2, '0')}-01`
      const end = new Date(filters.year, filters.month, 0).toISOString().split('T')[0]
      query = query.gte('date', start).lte('date', end)
    }

    const { data, error: err } = await query
    if (err) setError(err.message)
    else setTransactions((data as Transaction[]) ?? [])
    setLoading(false)
  }, [filters?.month, filters?.year, filters?.type, filters?.category_id])

  useEffect(() => {
    fetch()
  }, [fetch])

  const addTransaction = async (tx: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'categories'>) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: err } = await (supabase as any)
      .from('transactions')
      .insert({ ...tx, user_id: user?.id ?? 'anonymous' })
    if (!err) fetch()
    return err
  }

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: err } = await (supabase as any)
      .from('transactions')
      .update(updates)
      .eq('id', id)
    if (!err) fetch()
    return err
  }

  const deleteTransaction = async (id: string) => {
    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: err } = await (supabase as any)
      .from('transactions')
      .delete()
      .eq('id', id)
    if (!err) fetch()
    return err
  }

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  return {
    transactions,
    loading,
    error,
    refresh: fetch,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
  }
}
