'use client'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'
import { XCircle, RefreshCw, ArrowLeft } from 'lucide-react'

const REASON_LABELS: Record<string, string> = {
  cancelled:           'Payment was cancelled.',
  payment_failed:      'Payment was declined by your bank or card.',
  payment_notpaid:     'Payment was not completed.',
  transaction_not_found: 'Transaction reference not found.',
  invalid_reference:   'Invalid payment reference.',
  missing_payment_id:  'Payment information is missing.',
  server_error:        'An unexpected error occurred.',
}

function FailureContent() {
  const params = useSearchParams()
  const reason = params.get('reason') ?? 'unknown'
  const label  = REASON_LABELS[reason] ?? 'Payment could not be processed.'

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
          style={{ backgroundColor: '#FBF0F0' }}
        >
          <XCircle size={32} style={{ color: '#D96B6B' }} />
        </div>

        <h1 className="text-[22px] font-bold mb-3" style={{ color: '#1A1A1A' }}>
          Payment Failed
        </h1>
        <p className="text-[13.5px] mb-2" style={{ color: '#6B6560', lineHeight: '1.6' }}>
          {label}
        </p>
        <p className="text-[12px] mb-8" style={{ color: '#9B928B' }}>
          Your account remains on the Free plan. No charge was made.
        </p>

        <div className="space-y-3">
          <Link
            href="/subscription"
            className="flex items-center justify-center gap-2 w-full rounded-xl text-[13.5px] font-semibold"
            style={{
              padding: '12px 0',
              backgroundColor: '#E8B4B8',
              color: '#6B2D30',
              textDecoration: 'none',
            }}
          >
            <RefreshCw size={14} /> Try Again
          </Link>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full rounded-xl text-[13.5px] font-medium"
            style={{
              padding: '11px 0',
              backgroundColor: '#F5F0E8',
              color: '#6B6560',
              textDecoration: 'none',
            }}
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function FailurePage() {
  return (
    <Suspense>
      <FailureContent />
    </Suspense>
  )
}
