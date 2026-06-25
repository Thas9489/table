import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

function calcExpiry(intervalType: string, intervalCount: number): Date {
  const d = new Date()
  if (intervalType === 'year')         d.setFullYear(d.getFullYear() + intervalCount)
  else if (intervalType === 'quarter') d.setMonth(d.getMonth() + intervalCount * 3)
  else                                 d.setMonth(d.getMonth() + intervalCount)
  return d
}

function appUrl(request: NextRequest): string {
  const host  = request.headers.get('host') ?? ''
  const proto = host.includes('localhost') ? 'http' : 'https'
  return `${proto}://${host}`
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const paymentId = searchParams.get('paymentId')
  const hasError  = searchParams.get('error') === '1'
  const base      = appUrl(request)

  if (hasError && !paymentId) {
    return NextResponse.redirect(`${base}/subscription/failure?reason=cancelled`)
  }

  if (!paymentId) {
    return NextResponse.redirect(`${base}/subscription/failure?reason=missing_payment_id`)
  }

  try {
    const supabase = await createServerSupabaseClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.redirect(`${base}/login?returnTo=/subscription`)
    }

    // Verify payment via edge function — it holds the MYFATOORAH_API_KEY secret
    const { data: verifyData, error: verifyError } = await supabase.functions.invoke('verify-payment', {
      body: { paymentId },
    })

    if (verifyError || !verifyData?.status) {
      console.error('verify-payment error:', verifyError?.message, verifyData)
      return NextResponse.redirect(`${base}/subscription/failure?reason=server_error`)
    }

    const mfStatus = verifyData.status

    // transactionId was stored in UserDefinedField when the invoice was created
    const transactionId = mfStatus.UserDefinedField

    if (!transactionId) {
      return NextResponse.redirect(`${base}/subscription/failure?reason=invalid_reference`)
    }

    // Load the pending transaction
    const { data: tx } = await db
      .from('payment_transactions')
      .select('*, plan:subscription_plans(*)')
      .eq('id', transactionId)
      .eq('user_id', user.id)
      .single()

    if (!tx) {
      return NextResponse.redirect(`${base}/subscription/failure?reason=transaction_not_found`)
    }

    const isPaid    = mfStatus.InvoiceStatus === 'Paid'
    const newStatus = isPaid ? 'paid' : 'failed'
    const now       = new Date().toISOString()

    await db.from('payment_transactions').update({
      status: newStatus,
      myfatoorah_payment_id: paymentId,
      payment_method: mfStatus.PaymentGateway,
      // Store only non-sensitive fields, not the full raw gateway response
      error_message: isPaid ? null : `Payment ${mfStatus.InvoiceStatus}`,
      updated_at: now,
    }).eq('id', transactionId)

    if (!isPaid) {
      return NextResponse.redirect(
        `${base}/subscription/failure?reason=payment_${mfStatus.InvoiceStatus?.toLowerCase() ?? 'failed'}`
      )
    }

    // Activate subscription
    const plan      = tx.plan as { interval_type: string; interval_count: number; display_name?: string } | null
    const expiresAt = plan ? calcExpiry(plan.interval_type, plan.interval_count) : null

    const { data: existingSub } = await db
      .from('user_subscriptions')
      .select('id')
      .eq('user_id', user.id)
      .single()

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

    await db
      .from('payment_transactions')
      .update({ subscription_id: subscriptionId, updated_at: now })
      .eq('id', transactionId)

    return NextResponse.redirect(
      `${base}/subscription/success?plan=${encodeURIComponent(plan?.display_name ?? 'Premium')}`
    )
  } catch (e) {
    console.error('Callback error:', e)
    return NextResponse.redirect(`${appUrl(request)}/subscription/failure?reason=server_error`)
  }
}
