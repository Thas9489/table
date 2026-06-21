import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ plans: data })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
