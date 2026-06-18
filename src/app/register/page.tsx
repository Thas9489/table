'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Sparkles, Mail, Lock, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react'

export default function RegisterPage() {
  const [email,    setEmail]           = useState('')
  const [password, setPassword]        = useState('')
  const [confirm,  setConfirm]         = useState('')
  const [loading,  setLoading]         = useState(false)
  const [error,    setError]           = useState('')
  const [success,  setSuccess]         = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error: err } = await supabase.auth.signUp({ email, password })

      if (err) {
        setError(err.message)
        setLoading(false)
        return
      }

      // If session is present → auto-confirmed, redirect immediately
      if (data.session) {
        // Full page reload so the proxy sees the new auth cookie immediately
        window.location.href = '/'
        return
      }

      // Otherwise → email confirmation required
      setSuccess(true)
      setLoading(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-6"
        style={{ backgroundColor: '#F5F0E8' }}
      >
        <div
          className="w-full flex flex-col items-center text-center rounded-3xl"
          style={{
            maxWidth: '420px',
            backgroundColor: '#FAF8F5',
            border: '1px solid #E8E0D5',
            boxShadow: '0 8px 32px rgba(26,26,26,0.10)',
            padding: '48px 36px',
          }}
        >
          <div
            className="flex items-center justify-center"
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '18px',
              backgroundColor: '#EBF5F1',
              marginBottom: '16px',
            }}
          >
            <CheckCircle2 size={26} style={{ color: '#5BA68A' }} />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1A1A1A', marginBottom: '8px' }}>
            Check your email
          </h2>
          <p style={{ fontSize: '13.5px', color: '#6B6560', lineHeight: '1.6', marginBottom: '24px' }}>
            We sent a confirmation link to <strong style={{ color: '#1A1A1A' }}>{email}</strong>.
            Click it to activate your account, then sign in.
          </p>
          <Link
            href="/login"
            style={{
              display: 'inline-block',
              padding: '10px 28px',
              borderRadius: '12px',
              fontSize: '13.5px',
              fontWeight: 600,
              backgroundColor: '#E8B4B8',
              color: '#6B2D30',
              textDecoration: 'none',
            }}
          >
            Go to Sign In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ backgroundColor: '#F5F0E8' }}
    >
      <div
        className="w-full rounded-3xl"
        style={{
          maxWidth: '420px',
          backgroundColor: '#FAF8F5',
          border: '1px solid #E8E0D5',
          boxShadow: '0 8px 32px rgba(26,26,26,0.10)',
          padding: '40px 36px 36px',
        }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center" style={{ marginBottom: '32px' }}>
          <div
            className="flex items-center justify-center"
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '18px',
              background: 'linear-gradient(135deg, #E8B4B8 0%, #C4787C 100%)',
              marginBottom: '14px',
              boxShadow: '0 4px 16px rgba(196,120,124,0.30)',
            }}
          >
            <Sparkles size={24} style={{ color: '#FAF8F5' }} />
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1A1A1A', marginBottom: '4px' }}>
            Create your account
          </h1>
          <p style={{ fontSize: '13.5px', color: '#9B928B' }}>
            Start tracking your finances today
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div style={{ marginBottom: '16px' }}>
            <label
              style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#1A1A1A', marginBottom: '6px' }}
            >
              Email
            </label>
            <div
              className="flex items-center"
              style={{
                height: '44px',
                borderRadius: '12px',
                border: '1.5px solid #E8E0D5',
                backgroundColor: '#FAF8F5',
                paddingLeft: '14px',
                paddingRight: '14px',
                gap: '10px',
                transition: 'border-color 0.15s',
              }}
              onFocusCapture={e => (e.currentTarget as HTMLElement).style.borderColor = '#E8B4B8'}
              onBlurCapture={e => (e.currentTarget as HTMLElement).style.borderColor = '#E8E0D5'}
            >
              <Mail size={15} style={{ color: '#9B928B', flexShrink: 0 }} />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                style={{
                  flex: 1,
                  background: 'transparent',
                  outline: 'none',
                  border: 'none',
                  fontSize: '13.5px',
                  color: '#1A1A1A',
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: '16px' }}>
            <label
              style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#1A1A1A', marginBottom: '6px' }}
            >
              Password
            </label>
            <div
              className="flex items-center"
              style={{
                height: '44px',
                borderRadius: '12px',
                border: '1.5px solid #E8E0D5',
                backgroundColor: '#FAF8F5',
                paddingLeft: '14px',
                paddingRight: '14px',
                gap: '10px',
                transition: 'border-color 0.15s',
              }}
              onFocusCapture={e => (e.currentTarget as HTMLElement).style.borderColor = '#E8B4B8'}
              onBlurCapture={e => (e.currentTarget as HTMLElement).style.borderColor = '#E8E0D5'}
            >
              <Lock size={15} style={{ color: '#9B928B', flexShrink: 0 }} />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                required
                style={{
                  flex: 1,
                  background: 'transparent',
                  outline: 'none',
                  border: 'none',
                  fontSize: '13.5px',
                  color: '#1A1A1A',
                }}
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div style={{ marginBottom: '20px' }}>
            <label
              style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#1A1A1A', marginBottom: '6px' }}
            >
              Confirm Password
            </label>
            <div
              className="flex items-center"
              style={{
                height: '44px',
                borderRadius: '12px',
                border: '1.5px solid #E8E0D5',
                backgroundColor: '#FAF8F5',
                paddingLeft: '14px',
                paddingRight: '14px',
                gap: '10px',
                transition: 'border-color 0.15s',
              }}
              onFocusCapture={e => (e.currentTarget as HTMLElement).style.borderColor = '#E8B4B8'}
              onBlurCapture={e => (e.currentTarget as HTMLElement).style.borderColor = '#E8E0D5'}
            >
              <Lock size={15} style={{ color: '#9B928B', flexShrink: 0 }} />
              <input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Repeat your password"
                required
                style={{
                  flex: 1,
                  background: 'transparent',
                  outline: 'none',
                  border: 'none',
                  fontSize: '13.5px',
                  color: '#1A1A1A',
                }}
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div
              className="flex items-center"
              style={{
                gap: '8px',
                backgroundColor: '#FBF0F0',
                border: '1px solid #F5CECE',
                borderRadius: '10px',
                padding: '10px 14px',
                marginBottom: '16px',
              }}
            >
              <AlertCircle size={14} style={{ color: '#D96B6B', flexShrink: 0 }} />
              <p style={{ fontSize: '12.5px', color: '#D96B6B' }}>{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center"
            style={{
              width: '100%',
              height: '44px',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 600,
              backgroundColor: '#E8B4B8',
              color: '#6B2D30',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              gap: '8px',
              transition: 'background-color 0.15s',
            }}
            onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLElement).style.backgroundColor = '#DDA5A9' }}
            onMouseLeave={e => { if (!loading) (e.currentTarget as HTMLElement).style.backgroundColor = '#E8B4B8' }}
          >
            {loading
              ? <><Loader2 size={15} className="animate-spin" /> Creating account…</>
              : 'Create Account'
            }
          </button>
        </form>

        {/* Footer link */}
        <p
          className="text-center"
          style={{ fontSize: '13px', color: '#9B928B', marginTop: '24px' }}
        >
          Already have an account?{' '}
          <Link
            href="/login"
            style={{ color: '#C4787C', fontWeight: 600, textDecoration: 'none' }}
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
