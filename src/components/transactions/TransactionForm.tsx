'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { FileUpload } from '@/components/ui/FileUpload'
import { useCategories } from '@/hooks/useCategories'
import { createClient } from '@/lib/supabase/client'
import { detectCategoryFromKeywords } from '@/lib/categorize'
import type { AutoCategorySource } from '@/lib/categorize'
import type { Transaction } from '@/lib/supabase/types'
import { TrendingUp, TrendingDown, Sparkles, Loader2, AlertCircle } from 'lucide-react'

interface TransactionFormProps {
  initial?: Partial<Transaction>
  onSubmit: (
    data: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'categories'>
  ) => Promise<void>
  onCancel: () => void
}

export function TransactionForm({ initial, onSubmit, onCancel }: TransactionFormProps) {
  const { categories } = useCategories()
  const [loading, setLoading]   = useState(false)
  const [type, setType]         = useState<'income' | 'expense'>(initial?.type ?? 'expense')
  const [form, setForm]         = useState({
    amount:      initial?.amount?.toString() ?? '',
    category_id: initial?.category_id ?? '',
    description: initial?.description ?? '',
    notes:       initial?.notes ?? '',
    date:        initial?.date ?? new Date().toISOString().split('T')[0],
  })
  const [attachment, setAttachment] = useState<{
    url: string; name: string; type: string
  } | null>(
    initial?.attachment_url
      ? { url: initial.attachment_url, name: initial.attachment_name ?? 'file', type: initial.attachment_type ?? '' }
      : null
  )
  const [errors, setErrors] = useState<Record<string, string>>({})

  // ─── Auto-categorization state ────────────────────────────────────────────
  const [autoSource, setAutoSource] = useState<AutoCategorySource>(null)
  const [aiLoading,  setAiLoading]  = useState(false)

  /**
   * Ref (not state) so toggling it never triggers a re-render.
   * Set to true when the user manually picks a category — after that we
   * stop auto-selecting until the description is cleared.
   */
  const userModifiedRef = useRef(false)

  /** Find a category object by its DB name (case-insensitive). */
  const findCatByName = useCallback(
    (name: string) => categories.find(c => c.name.toLowerCase() === name.toLowerCase()),
    [categories]
  )

  /** Apply an auto-detected category only if the user hasn't overridden it. */
  const applyAutoCategory = useCallback(
    (categoryName: string, source: AutoCategorySource) => {
      if (userModifiedRef.current) return
      const cat = findCatByName(categoryName)
      if (!cat) return
      setForm(f => ({ ...f, category_id: cat.id }))
      setAutoSource(source)
    },
    [findCatByName]
  )

  // ─── Effect 1: Instant keyword matching on every keystroke ────────────────
  useEffect(() => {
    const desc = form.description.trim()

    if (!desc) {
      // Description cleared — unlock auto-selection for next entry
      userModifiedRef.current = false
      setAutoSource(null)
      return
    }

    if (userModifiedRef.current) return

    const match = detectCategoryFromKeywords(desc)
    if (match) {
      applyAutoCategory(match, 'keyword')
    } else if (autoSource === 'keyword') {
      // Keyword no longer matches (user backspaced) — clear the hint
      setAutoSource(null)
    }
  }, [form.description]) // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Effect 2: Debounced AI call (only when keywords didn't match) ────────
  useEffect(() => {
    const desc = form.description.trim()

    // Skip if: too short, user already overrode, or keywords already matched
    if (desc.length < 4 || userModifiedRef.current) return
    if (detectCategoryFromKeywords(desc)) return

    const timer = setTimeout(async () => {
      // Re-check inside the timeout — user may have typed more since then
      if (userModifiedRef.current) return
      if (detectCategoryFromKeywords(form.description.trim())) return

      setAiLoading(true)
      try {
        // Primary: Supabase Edge Function (works in production & local with Supabase)
        const supabase = createClient()
        const { data: edgeData, error: edgeError } = await supabase.functions.invoke(
          'categorize-transaction',
          { body: { description: desc } }
        )

        if (!edgeError && edgeData?.category && edgeData.category !== 'Other') {
          if (!userModifiedRef.current) applyAutoCategory(edgeData.category, 'ai')
          return
        }

        // Fallback: Next.js API route (local dev without edge function)
        const res = await fetch('/api/categorize-transaction', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ description: desc }),
        })
        if (res.ok) {
          const data = await res.json()
          if (data?.category && data.category !== 'Other' && !userModifiedRef.current) {
            applyAutoCategory(data.category, 'ai')
          }
        }
      } catch {
        // Silently fall back — keyword-only mode
      } finally {
        setAiLoading(false)
      }
    }, 750)

    return () => clearTimeout(timer)
  }, [form.description, applyAutoCategory])

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    userModifiedRef.current = true
    setAutoSource(null)
    setForm(f => ({ ...f, category_id: e.target.value }))
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0)
      e.amount = 'Enter a valid amount greater than 0'
    if (!form.date) e.date = 'Date is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    await onSubmit({
      type,
      amount:          Number(form.amount),
      category_id:     form.category_id || null,
      description:     form.description || null,
      notes:           form.notes || null,
      date:            form.date,
      attachment_url:  attachment?.url  ?? null,
      attachment_name: attachment?.name ?? null,
      attachment_type: attachment?.type ?? null,
    })
    setLoading(false)
  }

  const catOptions = categories.map(c => ({ value: c.id, label: c.name }))

  // ─── Helper text shown below the Category select ──────────────────────────
  const showHelperText = aiLoading || (autoSource !== null && !userModifiedRef.current)

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* ── Type toggle ─────────────────────────────────────── */}
      <div
        className="flex gap-1.5 p-1.5 rounded-2xl"
        style={{ backgroundColor: '#F0EAE2' }}
      >
        {(['expense', 'income'] as const).map(t => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl text-[13.5px] font-semibold transition-all duration-150"
            style={{
              padding: '11px 0',
              ...(type === t
                ? t === 'expense'
                  ? { backgroundColor: '#F7E8E9', color: '#D96B6B', border: '1px solid #F5CECE', boxShadow: '0 1px 3px rgba(26,26,26,0.06)' }
                  : { backgroundColor: '#EBF5F1', color: '#5BA68A', border: '1px solid #C8E8DC', boxShadow: '0 1px 3px rgba(26,26,26,0.06)' }
                : { backgroundColor: '#FAF8F5', color: '#9B928B', border: '1px solid transparent' }
              )
            }}
          >
            {t === 'expense'
              ? <TrendingDown size={15} />
              : <TrendingUp size={15} />
            }
            {t === 'expense' ? 'Expense' : 'Income'}
          </button>
        ))}
      </div>

      {/* ── Amount ─────────────────────────────────────────── */}
      <div>
        <label className="block text-[13px] font-medium mb-[6px]" style={{ color: '#1A1A1A' }}>
          Amount <span style={{ color: '#D96B6B' }}>*</span>
        </label>
        <div
          className="flex items-center rounded-xl transition-all"
          style={{
            backgroundColor: '#FAF8F5',
            border: `1.5px solid ${errors.amount ? '#D96B6B' : '#E8E0D5'}`,
          }}
        >
          <span className="pl-4 text-[16px] font-medium flex-shrink-0" style={{ color: '#9B928B' }}>$</span>
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={form.amount}
            onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
            className="flex-1 text-[20px] font-semibold px-2 py-3 focus:outline-none bg-transparent min-w-0"
            style={{ color: '#1A1A1A' }}
            onFocus={e => {
              const parent = e.currentTarget.parentElement!
              parent.style.borderColor = errors.amount ? '#D96B6B' : '#E8B4B8'
              parent.style.boxShadow = errors.amount ? '0 0 0 3px rgba(217,107,107,0.12)' : '0 0 0 3px rgba(232,180,184,0.18)'
            }}
            onBlur={e => {
              const parent = e.currentTarget.parentElement!
              parent.style.borderColor = errors.amount ? '#D96B6B' : '#E8E0D5'
              parent.style.boxShadow = 'none'
            }}
          />
          {type === 'expense'
            ? <span className="pr-4 text-[12px] font-medium flex-shrink-0" style={{ color: '#D96B6B' }}>EXP</span>
            : <span className="pr-4 text-[12px] font-medium flex-shrink-0" style={{ color: '#5BA68A' }}>INC</span>
          }
        </div>
        {errors.amount && (
          <p className="flex items-center gap-1 mt-[6px] text-[11px]" style={{ color: '#D96B6B' }}>
            <AlertCircle size={11} />
            {errors.amount}
          </p>
        )}
      </div>

      {/* ── Description ─────────────────────────────────────── */}
      <Input
        label="Description"
        placeholder="What was this for? (e.g. Grocery Shopping)"
        value={form.description}
        onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
      />

      {/* ── Category + Date ─────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Select
            label="Category"
            placeholder="Select category"
            options={catOptions}
            value={form.category_id}
            onChange={handleCategoryChange}
          />
          {/* AI hint */}
          {showHelperText && (
            <div className="flex items-center gap-1.5 mt-[6px]">
              {aiLoading ? (
                <>
                  <Loader2 size={10} className="animate-spin flex-shrink-0" style={{ color: '#9B928B' }} />
                  <span className="text-[11px]" style={{ color: '#9B928B' }}>Detecting…</span>
                </>
              ) : autoSource === 'ai' ? (
                <>
                  <Sparkles size={10} className="flex-shrink-0" style={{ color: '#C4787C' }} />
                  <span className="text-[11px]" style={{ color: '#C4787C' }}>AI auto-selected</span>
                </>
              ) : (
                <>
                  <Sparkles size={10} className="flex-shrink-0" style={{ color: '#5BA68A' }} />
                  <span className="text-[11px]" style={{ color: '#6B6560' }}>Auto-selected from keywords</span>
                </>
              )}
            </div>
          )}
        </div>

        <Input
          label="Date"
          type="date"
          value={form.date}
          onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
          error={errors.date}
        />
      </div>

      {/* ── Notes ───────────────────────────────────────────── */}
      <div className="flex flex-col gap-[6px]">
        <label className="text-[13px] font-medium" style={{ color: '#1A1A1A' }}>
          Notes <span className="font-normal" style={{ color: '#9B928B' }}>(Optional)</span>
        </label>
        <textarea
          placeholder="Add any notes or memo…"
          value={form.notes}
          onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
          rows={2}
          className="w-full rounded-xl text-[13.5px] px-3.5 py-2.5 focus:outline-none transition-all resize-none"
          style={{ backgroundColor: '#FAF8F5', border: '1.5px solid #E8E0D5', color: '#1A1A1A', lineHeight: '1.5' }}
          onFocus={e => {
            e.currentTarget.style.borderColor = '#E8B4B8'
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(232,180,184,0.18)'
          }}
          onBlur={e => {
            e.currentTarget.style.borderColor = '#E8E0D5'
            e.currentTarget.style.boxShadow = 'none'
          }}
        />
      </div>

      {/* ── Attachment ──────────────────────────────────────── */}
      <FileUpload value={attachment} onChange={setAttachment} />

      {/* ── Actions ─────────────────────────────────────────── */}
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" className="flex-1" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" className="flex-1" loading={loading}>
          {initial?.id ? 'Update Transaction' : 'Add Transaction'}
        </Button>
      </div>
    </form>
  )
}
