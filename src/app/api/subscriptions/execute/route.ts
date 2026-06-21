import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { mfExecutePayment } from '@/lib/myfatoorah'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { transactionId, methodId } = await request.json()
    if (!transactionId || !methodId) {
      return NextResponse.json({ error: 'transactionId and methodId are required' }, { status: 400 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any

    // Load the pending transaction
    const { data: tx } = await db
      .from('payment_transactions')
      .select('*, plan:subscription_plans(*)')
      .eq('id', transactionId)
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .single()

    if (!tx) return NextResponse.json({ error: 'Transaction not found or already processed' }, { status: 404 })

    const plan = tx.plan as { display_name: string; price: number; currency: string } | null
    if (!plan) return NextResponse.json({ error: 'Plan not found' }, { status: 404 })

    // Build callback URLs from the request host
    const host = request.headers.get('host') ?? ''
    const proto = host.includes('localhost') ? 'http' : 'https'
    const appUrl = `${proto}://${host}`
    const callbackUrl = `${appUrl}/api/subscriptions/callback`
    const errorUrl = `${appUrl}/api/subscriptions/callback?error=1`

    // Execute payment with MyFatoorah
    const mfData = await mfExecutePayment({
      methodId: Number(methodId),
      amount: plan.price,
      currency: plan.currency ?? 'KWD',
      customerName: user.user_metadata?.full_name ?? user.email ?? 'Customer',
      customerEmail: user.email ?? '',
      callbackUrl,
      errorUrl,
      itemName: plan.display_name,
      transactionRef: transactionId,
    })

    // Store the MyFatoorah invoice ID
    await db
      .from('payment_transactions')
      .update({
        myfatoorah_invoice_id: String(mfData.InvoiceId),
        updated_at: new Date().toISOString(),
      })
      .eq('id', transactionId)

    return NextResponse.json({ paymentUrl: mfData.PaymentURL })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
