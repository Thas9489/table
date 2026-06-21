'use client'
import { useState, useEffect, useCallback } from 'react'
import type { UserSubscription } from '@/lib/supabase/types'

export interface SubscriptionState {
  subscription: UserSubscription | null
  isPremium: boolean
  loading: boolean
  error: string | null
  refresh: () => void
}

export function useSubscription(): SubscriptionState {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/subscriptions/status')
      const json = await res.json()
      setSubscription(json.subscription ?? null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load subscription')
    } finally {
      setLoading(false)
    }
  }, [tick]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load() }, [load])

  const isActive =
    subscription?.status === 'active' &&
    (!subscription.expires_at || new Date(subscription.expires_at) > new Date())

  return {
    subscription,
    isPremium: isActive,
    loading,
    error,
    refresh: () => setTick(t => t + 1),
  }
}
