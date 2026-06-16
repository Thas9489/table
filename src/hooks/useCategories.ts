'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Category } from '@/lib/supabase/types'

const DEMO_USER_ID = 'a1b2c3d4-0000-0000-0000-000000000001'

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from('categories')
      .select('*')
      .order('is_default', { ascending: false })
      .order('name')
    setCategories((data as Category[]) ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const addCategory = async (cat: Pick<Category, 'name' | 'icon' | 'color'>) => {
    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from('categories').insert({
      ...cat,
      is_default: false,
      user_id: DEMO_USER_ID,
    })
    if (!error) fetch()
    return error
  }

  const deleteCategory = async (id: string) => {
    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from('categories').delete().eq('id', id)
    if (!error) fetch()
    return error
  }

  return { categories, loading, refresh: fetch, addCategory, deleteCategory }
}
