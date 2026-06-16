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
import { TrendingUp, TrendingDown, Sparkles, Loader2 } from 'lucide-react'

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
        const supabase = createClient()
        const { data, error } = await supabase.functions.invoke('categorize-transaction', {
          body: { description: desc },
        })
        if (!error && data?.category && data.category !== 'Other') {
          applyAutoCategory(data.category, 'ai')
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
      {/* Type toggle */}
      <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
        {(['expense', 'income'] as const).map(t => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
              type === t
                ? t === 'expense'
                  ? 'bg-white text-red-600 shadow-sm border border-red-100'
                  : 'bg-white text-emerald-600 shadow-sm border border-emerald-100'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {t === 'expense' ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Amount */}
      <Input
        label="Amount"
        type="number"
        step="0.01"
        min="0"
        placeholder="0.00"
        prefix={<span className="text-sm font-medium text-slate-500">$</span>}
        value={form.amount}
        onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
        error={errors.amount}
      />

      {/* Description — typing here triggers auto-categorization */}
      <Input
        label="Description"
        placeholder="What was this for?"
        value={form.description}
        onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
      />

      {/* Category & Date — category gets helper text when auto-detected */}
      <div className="grid grid-cols-2 gap-4 items-start">
        {/* Category wrapper lets us add the helper text below */}
        <div>
          <Select
            label="Category"
            placeholder="Select category"
            options={catOptions}
            value={form.category_id}
            onChange={handleCategoryChange}
          />

          {/* Auto-detect helper text */}
          {showHelperText && (
            <div className="flex items-center gap-1.5 mt-1.5 min-h-[16px]">
              {aiLoading ? (
                <>
                  <Loader2 size={11} className="text-indigo-400 shrink-0 animate-spin" />
                  <span className="text-[11px] text-slate-400">Detecting category…</span>
                </>
              ) : autoSource === 'ai' ? (
                <>
                  <Sparkles size={11} className="text-indigo-500 shrink-0" />
                  <span className="text-[11px] text-indigo-500">
                    Category auto-selected by AI based on description.
                  </span>
                </>
              ) : (
                <>
                  <Sparkles size={11} className="text-emerald-500 shrink-0" />
                  <span className="text-[11px] text-slate-500">
                    Category auto-selected based on description.
                  </span>
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

      {/* Notes */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-slate-700 leading-none">Notes</label>
        <textarea
          placeholder="Additional notes…"
          value={form.notes}
          onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
          rows={2}
          className="w-full bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 px-3.5 py-2.5 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all resize-none"
        />
      </div>

      {/* Attachment */}
      <FileUpload value={attachment} onChange={setAttachment} />

      {/* Actions */}
      <div className="flex gap-3 pt-1">
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
