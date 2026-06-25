import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { mfInitiatePayment } from '@/lib/myfatoorah'
import { checkOrigin } from '@/lib/csrf'

function genInvoiceNumber(): string {
  const d = new Date()
  const date = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `INV-${date}-${rand}`
}

export async function POST(request: NextRequest) {
  const originErr = checkOrigin(request)
  if (originErr) return originErr
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { planId } = await request.json()
    if (!planId) return NextResponse.json({ error: 'planId is required' }, { status: 400 })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any

    // Verify plan exists
    const { data: plan, error: planErr } = await db
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .eq('is_active', true)
      .single()

    if (planErr || !plan) return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    if (plan.price === 0) return NextResponse.json({ error: 'Cannot purchase free plan' }, { status: 400 })

    // Prevent duplicate active subscriptions
    const { data: existing } = await db
      .from('user_subscriptions')
      .select('status')
      .eq('user_id', user.id)
      .single()

    if (existing?.status === 'active') {
      return NextResponse.json({ error: 'You already have an active subscription' }, { status: 409 })
    }

    // Create pending transaction record
    const invoiceNumber = genInvoiceNumber()
    const { data: tx, error: txErr } = await db
      .from('payment_transactions')
      .insert({
        user_id: user.id,
        plan_id: planId,
        invoice_number: invoiceNumber,
        amount: plan.price,
        currency: plan.currency,
        status: 'pending',
      })
      .select()
      .single()

    if (txErr || !tx) return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 })

    // Call MyFatoorah to get available payment methods
    const mfData = await mfInitiatePayment(plan.price, plan.currency)

    return NextResponse.json({
      transactionId: tx.id,
      invoiceNumber,
      amount: plan.price,
      currency: plan.currency,
      planName: plan.display_name,
      methods: mfData.PaymentMethods,
    })
  } catch (e) {
    console.error(e); return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
