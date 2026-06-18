'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Sparkles, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router   = useRouter()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })

    if (err) {
      setError(err.message)
      setLoading(false)
    } else {
      router.push('/')
      router.refresh()
    }
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
            Welcome back
          </h1>
          <p style={{ fontSize: '13.5px', color: '#9B928B' }}>
            Sign in to your BudgetAI account
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
          <div style={{ marginBottom: '20px' }}>
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
                placeholder="••••••••"
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
              ? <><Loader2 size={15} className="animate-spin" /> Signing in…</>
              : 'Sign In'
            }
          </button>
        </form>

        {/* Footer link */}
        <p
          className="text-center"
          style={{ fontSize: '13px', color: '#9B928B', marginTop: '24px' }}
        >
          Don&apos;t have an account?{' '}
          <Link
            href="/register"
            style={{ color: '#C4787C', fontWeight: 600, textDecoration: 'none' }}
          >
            Create account
          </Link>
        </p>
      </div>
    </div>
  )
}
