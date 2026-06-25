import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any
    const { data } = await db
      .from('user_subscriptions')
      .select('*, plan:subscription_plans(*)')
      .eq('user_id', user.id)
      .single()

    // No row = free plan
    if (!data) return NextResponse.json({ subscription: null })

    // Auto-expire if past expiry date
    if (data.status === 'active' && data.expires_at && new Date(data.expires_at) < new Date()) {
      await db
        .from('user_subscriptions')
        .update({ status: 'expired', updated_at: new Date().toISOString() })
        .eq('id', data.id)
      return NextResponse.json({ subscription: { ...data, status: 'expired' } })
    }

    return NextResponse.json({ subscription: data })
  } catch (e) {
    console.error(e); return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
