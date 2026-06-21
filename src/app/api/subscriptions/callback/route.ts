import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { mfGetPaymentStatus } from '@/lib/myfatoorah'

function calcExpiry(intervalType: string, intervalCount: number): Date {
  const d = new Date()
  if (intervalType === 'year')    d.setFullYear(d.getFullYear() + intervalCount)
  else if (intervalType === 'quarter') d.setMonth(d.getMonth() + intervalCount * 3)
  else                            d.setMonth(d.getMonth() + intervalCount)
  return d
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const paymentId = searchParams.get('paymentId')
  const hasError  = searchParams.get('error') === '1'

  const host   = request.headers.get('host') ?? ''
  const proto  = host.includes('localhost') ? 'http' : 'https'
  const appUrl = `${proto}://${host}`

  // If MyFatoorah redirected to error URL
  if (hasError && !paymentId) {
    return NextResponse.redirect(`${appUrl}/subscription/failure?reason=cancelled`)
  }

  if (!paymentId) {
    return NextResponse.redirect(`${appUrl}/subscription/failure?reason=missing_payment_id`)
  }

  try {
    const supabase = await createServerSupabaseClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.redirect(`${appUrl}/login?returnTo=/subscription`)
    }

    // Verify payment with MyFatoorah
    const mfStatus = await mfGetPaymentStatus(paymentId)

    // transactionId was stored in UserDefinedField
    const transactionId = mfStatus.UserDefinedField

    if (!transactionId) {
      return NextResponse.redirect(`${appUrl}/subscription/failure?reason=invalid_reference`)
    }

    // Load the pending transaction
    const { data: tx } = await db
      .from('payment_transactions')
      .select('*, plan:subscription_plans(*)')
      .eq('id', transactionId)
      .eq('user_id', user.id)
      .single()

    if (!tx) {
      return NextResponse.redirect(`${appUrl}/subscription/failure?reason=transaction_not_found`)
    }

    const isPaid = mfStatus.InvoiceStatus === 'Paid'
    const newStatus = isPaid ? 'paid' : 'failed'

    // Update the payment transaction
    await db.from('payment_transactions').update({
      status: newStatus,
      myfatoorah_payment_id: paymentId,
      payment_method: mfStatus.PaymentGateway,
      raw_response: mfStatus,
      updated_at: new Date().toISOString(),
    }).eq('id', transactionId)

    if (!isPaid) {
      await db.from('payment_transactions').update({
        error_message: `Payment ${mfStatus.InvoiceStatus}`,
        updated_at: new Date().toISOString(),
      }).eq('id', transactionId)
      return NextResponse.redirect(`${appUrl}/subscription/failure?reason=payment_${mfStatus.InvoiceStatus.toLowerCase()}`)
    }

    // Activate subscription
    const plan = tx.plan as { interval_type: string; interval_count: number } | null
    const expiresAt = plan ? calcExpiry(plan.interval_type, plan.interval_count) : null
    const now = new Date().toISOString()

    const { data: existingSub } = await db.from('user_subscriptions').select('id').eq('user_id', user.id).single()

    let subscriptionId: string

    if (existingSub) {
      await db.from('user_subscriptions').update({
        plan_id: tx.plan_id,
        status: 'active',
        started_at: now,
        expires_at: expiresAt?.toISOString() ?? null,
        next_billing_at: expiresAt?.toISOString() ?? null,
        auto_renew: true,
        cancelled_at: null,
        updated_at: now,
      }).eq('id', existingSub.id)
      subscriptionId = existingSub.id
    } else {
      const { data: newSub } = await db.from('user_subscriptions').insert({
        user_id: user.id,
        plan_id: tx.plan_id,
        status: 'active',
        started_at: now,
        expires_at: expiresAt?.toISOString() ?? null,
        next_billing_at: expiresAt?.toISOString() ?? null,
        auto_renew: true,
      }).select('id').single()
      subscriptionId = newSub?.id ?? ''
    }

    // Link transaction to subscription
    await db.from('payment_transactions').update({ subscription_id: subscriptionId, updated_at: now }).eq('id', transactionId)

    return NextResponse.redirect(
      `${appUrl}/subscription/success?plan=${encodeURIComponent((tx.plan as { display_name?: string } | null)?.display_name ?? 'Premium')}`
    )
  } catch (e) {
    const host   = request.headers.get('host') ?? ''
    const proto  = host.includes('localhost') ? 'http' : 'https'
    const au     = `${proto}://${host}`
    return NextResponse.redirect(`${au}/subscription/failure?reason=server_error`)
  }
}
