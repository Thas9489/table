'use client'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useCategories } from '@/hooks/useCategories'
import type { Budget } from '@/lib/supabase/types'

interface BudgetFormProps {
  initial?: Partial<Budget>
  onSubmit: (amount: number, threshold: number, category_id?: string) => Promise<void>
  onCancel: () => void
  showCategory?: boolean
}

export function BudgetForm({ initial, onSubmit, onCancel, showCategory = false }: BudgetFormProps) {
  const { categories } = useCategories()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    amount:      initial?.amount?.toString() ?? '',
    threshold:   initial?.alert_threshold?.toString() ?? '80',
    category_id: initial?.category_id ?? '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.amount || Number(form.amount) <= 0) e.amount = 'Enter a valid amount'
    const t = Number(form.threshold)
    if (!form.threshold || t < 1 || t > 100) e.threshold = 'Must be between 1 and 100'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    await onSubmit(Number(form.amount), Number(form.threshold), form.category_id || undefined)
    setLoading(false)
  }

  const catOptions = categories.map(c => ({ value: c.id, label: c.name }))

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {showCategory && (
        <Select
          label="Category"
          placeholder="Select category"
          options={catOptions}
          value={form.category_id}
          onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
        />
      )}

      <Input
        label="Monthly Budget Amount"
        type="number"
        step="0.01"
        min="0"
        placeholder="0.00"
        prefix={<span className="text-sm font-medium text-slate-500">$</span>}
        value={form.amount}
        onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
        error={errors.amount}
      />

      {/* Alert threshold */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-slate-700">Alert Threshold</label>
          <span className="text-sm font-semibold text-indigo-600">{form.threshold}%</span>
        </div>
        <input
          type="range"
          min="10"
          max="100"
          step="5"
          value={form.threshold}
          onChange={e => setForm(f => ({ ...f, threshold: e.target.value }))}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-indigo-600 bg-slate-200"
        />
        <div className="flex justify-between text-[11px] text-slate-400">
          <span>10%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
        {errors.threshold && <p className="text-xs text-red-500">{errors.threshold}</p>}
      </div>

      <div className="flex gap-3 pt-1">
        <Button type="button" variant="secondary" className="flex-1" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" className="flex-1" loading={loading}>
          {initial?.id ? 'Update Budget' : 'Set Budget'}
        </Button>
      </div>
    </form>
  )
}
