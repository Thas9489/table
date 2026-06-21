'use client'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'
import { CheckCircle2, Crown, ArrowRight } from 'lucide-react'

function SuccessContent() {
  const params = useSearchParams()
  const plan = params.get('plan') ?? 'Premium'

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: '#F5F0E8' }}>
      <div
        className="w-full max-w-md rounded-3xl text-center"
        style={{
          backgroundColor: '#FAF8F5',
          border: '1px solid #E8E0D5',
          boxShadow: '0 8px 32px rgba(26,26,26,0.10)',
          padding: '48px 36px',
        }}
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
          style={{ backgroundColor: '#EBF5F1' }}
        >
          <CheckCircle2 size={32} style={{ color: '#5BA68A' }} />
        </div>

        <div
          className="flex items-center justify-center gap-2 mb-3"
        >
          <Crown size={16} style={{ color: '#C4787C' }} />
          <span className="text-[12px] font-semibold" style={{ color: '#C4787C' }}>
            {plan}
          </span>
        </div>

        <h1 className="text-[22px] font-bold mb-3" style={{ color: '#1A1A1A' }}>
          You&apos;re now Premium!
        </h1>
        <p className="text-[13.5px] mb-8" style={{ color: '#6B6560', lineHeight: '1.6' }}>
          Your subscription is active. Enjoy unlimited access to all BudgetAI features.
        </p>

        <div className="space-y-3">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full rounded-xl text-[13.5px] font-semibold transition-all"
            style={{
              padding: '12px 0',
              backgroundColor: '#C4787C',
              color: '#FAF8F5',
              textDecoration: 'none',
            }}
          >
            Go to Dashboard <ArrowRight size={14} />
          </Link>
          <Link
            href="/subscription"
            className="flex items-center justify-center w-full rounded-xl text-[13.5px] font-medium"
            style={{
              padding: '11px 0',
              backgroundColor: '#F5F0E8',
              color: '#6B6560',
              textDecoration: 'none',
            }}
          >
            View Subscription Details
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  )
}
