import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function POST() {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any
    const { data: sub } = await db
      .from('user_subscriptions')
      .select('id, status')
      .eq('user_id', user.id)
      .single()

    if (!sub || sub.status !== 'active') {
      return NextResponse.json({ error: 'No active subscription to cancel' }, { status: 400 })
    }

    const { error } = await db
      .from('user_subscriptions')
      .update({
        auto_renew: false,
        cancelled_at: new Date().toISOString(),
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', sub.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error(e); return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
