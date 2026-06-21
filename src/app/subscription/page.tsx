'use client'
import { useState, useEffect } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import type { SubscriptionPlan, UserSubscription, PaymentTransaction } from '@/lib/supabase/types'
import type { MFPaymentMethod } from '@/lib/myfatoorah'
import { formatCurrency } from '@/lib/utils'
import {
  Crown, Check, X, Loader2, CreditCard, AlertCircle,
  CalendarDays, RefreshCw, BadgeCheck, Clock, ChevronRight,
} from 'lucide-react'

const CARD = {
  backgroundColor: '#FAF8F5',
  border: '1px solid #E8E0D5',
  boxShadow: '0 1px 3px rgba(26,26,26,0.05)',
}

// ─── Plan Pricing Card ────────────────────────────────────────────────────────
function PlanCard({
  plan,
  highlight,
  onSelect,
  loading,
}: {
  plan: SubscriptionPlan
  highlight?: boolean
  onSelect: (plan: SubscriptionPlan) => void
  loading: boolean
}) {
  const perMonth =
    plan.interval_type === 'quarter'
      ? plan.price / 3
      : plan.interval_type === 'year'
      ? plan.price / 12
      : plan.price

  const savingLabel =
    plan.interval_type === 'quarter'
      ? 'Save 15%'
      : plan.interval_type === 'year'
      ? 'Save 30%'
      : null

  return (
    <div
      className="relative rounded-2xl flex flex-col"
      style={{
        ...CARD,
        padding: '28px 24px',
        border: highlight ? '2px solid #C4787C' : '1px solid #E8E0D5',
        boxShadow: highlight ? '0 8px 24px rgba(196,120,124,0.15)' : CARD.boxShadow,
      }}
    >
      {highlight && (
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 text-[11px] font-semibold px-3 py-1 rounded-full"
          style={{ backgroundColor: '#C4787C', color: '#FAF8F5' }}
        >
          Most Popular
        </div>
      )}
      {savingLabel && (
        <div
          className="absolute top-4 right-4 text-[10px] font-semibold px-2 py-0.5 rounded-full"
          style={{ backgroundColor: '#EBF5F1', color: '#5BA68A' }}
        >
          {savingLabel}
        </div>
      )}

      <p className="text-[13px] font-semibold mb-1" style={{ color: '#9B928B' }}>
        {plan.display_name}
      </p>

      <div className="flex items-end gap-1 mb-1">
        <span className="text-[32px] font-bold leading-none" style={{ color: '#1A1A1A' }}>
          {plan.price.toFixed(3)}
        </span>
        <span className="text-[13px] mb-1" style={{ color: '#9B928B' }}>KWD</span>
      </div>

      <p className="text-[11.5px] mb-1" style={{ color: '#9B928B' }}>
        {plan.interval_type === 'month'
          ? 'per month'
          : plan.interval_type === 'quarter'
          ? 'per 3 months'
          : 'per year'}
      </p>

      {perMonth !== plan.price && (
        <p className="text-[11px] mb-4" style={{ color: '#5BA68A' }}>
          ≈ {perMonth.toFixed(3)} KWD / month
        </p>
      )}
      {perMonth === plan.price && <div className="mb-4" />}

      <button
        onClick={() => onSelect(plan)}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 rounded-xl text-[13.5px] font-semibold transition-all"
        style={{
          padding: '11px 0',
          backgroundColor: highlight ? '#C4787C' : '#E8B4B8',
          color: highlight ? '#FAF8F5' : '#6B2D30',
          opacity: loading ? 0.7 : 1,
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : <Crown size={14} />}
        Subscribe Now
      </button>
    </div>
  )
}

// ─── Payment Method Modal ─────────────────────────────────────────────────────
function PaymentModal({
  plan,
  methods,
  transactionId,
  onClose,
}: {
  plan: SubscriptionPlan
  methods: MFPaymentMethod[]
  transactionId: string
  onClose: () => void
}) {
  const [selected, setSelected] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const pay = async () => {
    if (!selected) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/subscriptions/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId, methodId: selected }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      window.location.href = data.paymentUrl
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Payment failed')
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(26,26,26,0.5)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-sm rounded-2xl" style={{ ...CARD, padding: '28px 24px' }}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-[15px] font-semibold" style={{ color: '#1A1A1A' }}>
              Select Payment Method
            </h3>
            <p className="text-[12px] mt-0.5" style={{ color: '#9B928B' }}>
              {plan.display_name} — {plan.price.toFixed(3)} KWD
            </p>
          </div>
          <button onClick={onClose} style={{ color: '#9B928B' }}><X size={18} /></button>
        </div>

        <div className="space-y-2 mb-5">
          {methods.map(m => (
            <button
              key={m.PaymentMethodId}
              onClick={() => setSelected(m.PaymentMethodId)}
              className="w-full flex items-center gap-3 rounded-xl transition-all"
              style={{
                padding: '12px 14px',
                border: selected === m.PaymentMethodId ? '2px solid #C4787C' : '1.5px solid #E8E0D5',
                backgroundColor: selected === m.PaymentMethodId ? '#FBF5F5' : '#FAF8F5',
                textAlign: 'left',
              }}
            >
              {m.ImageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.ImageUrl} alt={m.PaymentMethodEn} className="h-6 w-10 object-contain flex-shrink-0" />
              )}
              {!m.ImageUrl && <CreditCard size={18} style={{ color: '#9B928B', flexShrink: 0 }} />}
              <span className="text-[13px] font-medium flex-1" style={{ color: '#1A1A1A' }}>
                {m.PaymentMethodEn}
              </span>
              {m.ServiceCharge > 0 && (
                <span className="text-[11px]" style={{ color: '#9B928B' }}>
                  +{m.ServiceCharge.toFixed(3)} KWD fee
                </span>
              )}
              {selected === m.PaymentMethodId && (
                <Check size={14} style={{ color: '#C4787C', flexShrink: 0 }} />
              )}
            </button>
          ))}
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl mb-4 p-3"
            style={{ backgroundColor: '#FBF0F0', border: '1px solid #F5CECE' }}>
            <AlertCircle size={13} style={{ color: '#D96B6B' }} />
            <p className="text-[12px]" style={{ color: '#D96B6B' }}>{error}</p>
          </div>
        )}

        <button
          onClick={pay}
          disabled={!selected || loading}
          className="w-full flex items-center justify-center gap-2 rounded-xl text-[13.5px] font-semibold transition-all"
          style={{
            padding: '12px 0',
            backgroundColor: selected && !loading ? '#C4787C' : '#E8E0D5',
            color: selected && !loading ? '#FAF8F5' : '#9B928B',
            cursor: selected && !loading ? 'pointer' : 'not-allowed',
          }}
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Crown size={14} />}
          {loading ? 'Redirecting…' : 'Pay Now'}
        </button>
      </div>
    </div>
  )
}

// ─── Active Subscription Card ─────────────────────────────────────────────────
function ActiveSubscriptionCard({
  subscription,
  onCancel,
  cancelling,
}: {
  subscription: UserSubscription
  onCancel: () => void
  cancelling: boolean
}) {
  const plan = subscription.plan as SubscriptionPlan | undefined
  const isActive = subscription.status === 'active'
  const isCancelled = subscription.status === 'cancelled'

  const fmt = (d: string | null) =>
    d ? new Date(d).toLocaleDateString('en-KW', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'

  return (
    <div className="rounded-2xl mb-6" style={{ ...CARD, padding: '24px' }}>
      <div className="flex items-start justify-between mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Crown size={16} style={{ color: '#C4787C' }} />
            <h3 className="text-[15px] font-semibold" style={{ color: '#1A1A1A' }}>
              {plan?.display_name ?? 'Premium'}
            </h3>
          </div>
          <p className="text-[12px]" style={{ color: '#9B928B' }}>{plan?.description}</p>
        </div>
        <span
          className="text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1"
          style={
            isActive
              ? { backgroundColor: '#EBF5F1', color: '#5BA68A' }
              : isCancelled
              ? { backgroundColor: '#FBF0F0', color: '#D96B6B' }
              : { backgroundColor: '#F5F0E8', color: '#9B928B' }
          }
        >
          <span className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: isActive ? '#5BA68A' : isCancelled ? '#D96B6B' : '#9B928B' }} />
          {isActive ? 'Active' : isCancelled ? 'Cancelled' : subscription.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        {[
          { icon: CalendarDays, label: 'Started', value: fmt(subscription.started_at) },
          { icon: Clock,        label: 'Expires', value: fmt(subscription.expires_at) },
          { icon: RefreshCw,    label: 'Next Billing', value: isActive && !isCancelled ? fmt(subscription.next_billing_at) : 'N/A' },
          {
            icon: BadgeCheck,
            label: 'Auto-Renew',
            value: subscription.auto_renew && !isCancelled ? 'ON' : 'OFF',
          },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="rounded-xl p-3" style={{ backgroundColor: '#F5F0E8' }}>
            <div className="flex items-center gap-1.5 mb-1">
              <Icon size={11} style={{ color: '#9B928B' }} />
              <p className="text-[10.5px] font-medium" style={{ color: '#9B928B' }}>{label}</p>
            </div>
            <p className="text-[12.5px] font-semibold" style={{ color: '#1A1A1A' }}>{value}</p>
          </div>
        ))}
      </div>

      {isActive && !isCancelled && (
        <button
          onClick={onCancel}
          disabled={cancelling}
          className="flex items-center gap-1.5 text-[12.5px] font-medium transition-opacity"
          style={{ color: '#D96B6B', opacity: cancelling ? 0.6 : 1 }}
        >
          {cancelling ? <Loader2 size={12} className="animate-spin" /> : <X size={12} />}
          {cancelling ? 'Cancelling…' : 'Cancel Auto-Renew'}
        </button>
      )}
      {isCancelled && (
        <p className="text-[12px]" style={{ color: '#9B928B' }}>
          Your premium access continues until{' '}
          <strong style={{ color: '#1A1A1A' }}>{fmt(subscription.expires_at)}</strong>.
        </p>
      )}
    </div>
  )
}

// ─── Payment History ──────────────────────────────────────────────────────────
function PaymentHistory({ invoices }: { invoices: PaymentTransaction[] }) {
  if (invoices.length === 0) return null
  return (
    <div className="rounded-2xl overflow-hidden" style={CARD}>
      <div className="px-5 py-3.5" style={{ borderBottom: '1px solid #F0EAE2' }}>
        <h3 className="text-[13.5px] font-semibold" style={{ color: '#1A1A1A' }}>Payment History</h3>
      </div>
      <div>
        {invoices.map((inv, i) => {
          const plan = inv.plan as SubscriptionPlan | undefined
          return (
            <div key={inv.id}
              className="flex items-center justify-between px-5 py-3.5"
              style={{ borderTop: i > 0 ? '1px solid #F0EAE2' : undefined }}
            >
              <div className="min-w-0">
                <p className="text-[13px] font-medium truncate" style={{ color: '#1A1A1A' }}>
                  {inv.invoice_number}
                </p>
                <p className="text-[11.5px] mt-0.5" style={{ color: '#9B928B' }}>
                  {plan?.display_name ?? 'Premium'} •{' '}
                  {new Date(inv.created_at).toLocaleDateString('en-KW', { day: 'numeric', month: 'short', year: 'numeric' })}
                  {inv.payment_method && ` • ${inv.payment_method}`}
                </p>
              </div>
              <div className="flex items-center gap-3 ml-3 flex-shrink-0">
                <span className="text-[13px] font-semibold" style={{ color: '#1A1A1A' }}>
                  {formatCurrency(inv.amount)}
                </span>
                <span
                  className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full"
                  style={
                    inv.status === 'paid'
                      ? { backgroundColor: '#EBF5F1', color: '#5BA68A' }
                      : inv.status === 'failed'
                      ? { backgroundColor: '#FBF0F0', color: '#D96B6B' }
                      : { backgroundColor: '#F5F0E8', color: '#9B928B' }
                  }
                >
                  {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SubscriptionPage() {
  const [plans, setPlans]               = useState<SubscriptionPlan[]>([])
  const [subscription, setSubscription] = useState<UserSubscription | null>(null)
  const [invoices, setInvoices]         = useState<PaymentTransaction[]>([])
  const [loading, setLoading]           = useState(true)

  // Payment modal state
  const [selectedPlan, setSelectedPlan]     = useState<SubscriptionPlan | null>(null)
  const [paymentMethods, setPaymentMethods] = useState<MFPaymentMethod[]>([])
  const [transactionId, setTransactionId]   = useState('')
  const [initiating, setInitiating]         = useState(false)
  const [initiateError, setInitiateError]   = useState('')
  const [cancelling, setCancelling]         = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/subscriptions/plans').then(r => r.json()),
      fetch('/api/subscriptions/status').then(r => r.json()),
      fetch('/api/subscriptions/invoices').then(r => r.json()),
    ]).then(([p, s, inv]) => {
      setPlans(p.plans ?? [])
      setSubscription(s.subscription ?? null)
      setInvoices(inv.invoices ?? [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const isPremium =
    subscription?.status === 'active' &&
    (!subscription.expires_at || new Date(subscription.expires_at) > new Date())

  const handleSelectPlan = async (plan: SubscriptionPlan) => {
    setInitiating(true)
    setInitiateError('')
    try {
      const res = await fetch('/api/subscriptions/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: plan.id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setTransactionId(data.transactionId)
      setPaymentMethods(data.methods)
      setSelectedPlan(plan)
    } catch (e) {
      setInitiateError(e instanceof Error ? e.message : 'Failed to initiate payment')
    } finally {
      setInitiating(false)
    }
  }

  const handleCancel = async () => {
    setCancelling(true)
    try {
      const res = await fetch('/api/subscriptions/cancel', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSubscription(prev => prev ? { ...prev, status: 'cancelled', auto_renew: false } : prev)
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to cancel')
    } finally {
      setCancelling(false)
    }
  }

  const premiumFeatures = plans.find(p => p.name !== 'free')?.features ?? []

  if (loading) {
    return (
      <AppLayout title="Subscription" subtitle="Manage your plan">
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin" style={{ color: '#C4787C' }} />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout title="Subscription" subtitle="Manage your plan and billing">
      {/* Active subscription status */}
      {subscription && (subscription.status === 'active' || subscription.status === 'cancelled') && (
        <ActiveSubscriptionCard
          subscription={subscription}
          onCancel={handleCancel}
          cancelling={cancelling}
        />
      )}

      {/* Plans section */}
      {!isPremium && (
        <>
          {/* Hero */}
          <div className="rounded-2xl mb-6 text-center" style={{ ...CARD, padding: '32px 24px' }}>
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'linear-gradient(135deg, #E8B4B8 0%, #C4787C 100%)' }}
            >
              <Crown size={22} style={{ color: '#FAF8F5' }} />
            </div>
            <h2 className="text-[20px] font-bold mb-2" style={{ color: '#1A1A1A' }}>
              Upgrade to Premium
            </h2>
            <p className="text-[13.5px] max-w-md mx-auto" style={{ color: '#6B6560' }}>
              Unlock unlimited access to all BudgetAI features and take full control of your finances.
            </p>
          </div>

          {initiateError && (
            <div className="flex items-center gap-2 rounded-xl mb-4 p-3"
              style={{ backgroundColor: '#FBF0F0', border: '1px solid #F5CECE' }}>
              <AlertCircle size={13} style={{ color: '#D96B6B' }} />
              <p className="text-[12px]" style={{ color: '#D96B6B' }}>{initiateError}</p>
            </div>
          )}

          {/* Pricing grid */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {plans
              .filter(p => p.name !== 'free')
              .map((plan, i) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  highlight={i === 1}
                  onSelect={handleSelectPlan}
                  loading={initiating}
                />
              ))}
          </div>

          {/* Features list */}
          <div className="rounded-2xl" style={{ ...CARD, padding: '24px' }}>
            <h3 className="text-[13.5px] font-semibold mb-4" style={{ color: '#1A1A1A' }}>
              Everything included in Premium
            </h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              {premiumFeatures.map((f: string) => (
                <div key={f} className="flex items-start gap-2">
                  <Check size={14} className="flex-shrink-0 mt-0.5" style={{ color: '#5BA68A' }} />
                  <span className="text-[12.5px]" style={{ color: '#6B6560' }}>{f}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Premium user — show features + payment history */}
      {isPremium && (
        <div className="rounded-2xl mb-6" style={{ ...CARD, padding: '24px' }}>
          <h3 className="text-[13.5px] font-semibold mb-4" style={{ color: '#1A1A1A' }}>
            Your Premium Features
          </h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            {premiumFeatures.map((f: string) => (
              <div key={f} className="flex items-start gap-2">
                <Check size={14} className="flex-shrink-0 mt-0.5" style={{ color: '#5BA68A' }} />
                <span className="text-[12.5px]" style={{ color: '#6B6560' }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment history */}
      <PaymentHistory invoices={invoices} />

      {/* Upgrade options for cancelled/expired subscribers */}
      {subscription && (subscription.status === 'cancelled' || subscription.status === 'expired') && (
        <div className="mt-6">
          <h3 className="text-[13.5px] font-semibold mb-4" style={{ color: '#1A1A1A' }}>
            Renew Your Subscription
          </h3>
          {initiateError && (
            <div className="flex items-center gap-2 rounded-xl mb-4 p-3"
              style={{ backgroundColor: '#FBF0F0', border: '1px solid #F5CECE' }}>
              <AlertCircle size={13} style={{ color: '#D96B6B' }} />
              <p className="text-[12px]" style={{ color: '#D96B6B' }}>{initiateError}</p>
            </div>
          )}
          <div className="grid grid-cols-3 gap-4">
            {plans.filter(p => p.name !== 'free').map((plan, i) => (
              <PlanCard key={plan.id} plan={plan} highlight={i === 1} onSelect={handleSelectPlan} loading={initiating} />
            ))}
          </div>
        </div>
      )}

      {/* Free plan note */}
      {!subscription && (
        <div className="mt-4 flex items-center gap-1.5 justify-center">
          <ChevronRight size={12} style={{ color: '#9B928B' }} />
          <p className="text-[12px]" style={{ color: '#9B928B' }}>
            Your current plan: <strong>Free</strong> — 20 income &amp; 50 expense records/month, 2 budgets
          </p>
        </div>
      )}

      {/* Payment method modal */}
      {selectedPlan && paymentMethods.length > 0 && (
        <PaymentModal
          plan={selectedPlan}
          methods={paymentMethods}
          transactionId={transactionId}
          onClose={() => { setSelectedPlan(null); setPaymentMethods([]) }}
        />
      )}
    </AppLayout>
  )
}
