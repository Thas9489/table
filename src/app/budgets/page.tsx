'use client'
import { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { BudgetCard } from '@/components/budgets/BudgetCard'
import { BudgetForm } from '@/components/budgets/BudgetForm'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { useBudgets } from '@/hooks/useBudgets'
import { useTransactions } from '@/hooks/useTransactions'
import { useCategories } from '@/hooks/useCategories'
import { formatCurrency, getMonthName, getCurrentMonth } from '@/lib/utils'
import { Plus, PiggyBank, AlertTriangle, DollarSign, ChevronDown } from 'lucide-react'

const MONTHS = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1),
  label: getMonthName(i + 1),
}))
const YEARS = Array.from({ length: 5 }, (_, i) => {
  const y = new Date().getFullYear() - i
  return { value: String(y), label: String(y) }
})

const CARD_STYLE = {
  backgroundColor: '#FAF8F5',
  border: '1px solid #E8E0D5',
  boxShadow: '0 1px 3px rgba(26,26,26,0.05)',
}

export default function BudgetsPage() {
  const { month: curMonth, year: curYear } = getCurrentMonth()
  const [month,   setMonth]   = useState(curMonth)
  const [year,    setYear]    = useState(curYear)
  const [addOpen, setAddOpen] = useState(false)

  const { budgets, loading, upsertBudget, deleteBudget } = useBudgets(month, year)
  const { transactions } = useTransactions({ month, year })
  const { categories }   = useCategories()

  const totalBudgeted = budgets.reduce((s, b) => s + b.amount, 0)
  const totalSpent    = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const alertCount    = budgets.filter(b => {
    const spent = transactions
      .filter(t => t.category_id === b.category_id && t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0)
    return (spent / b.amount) * 100 >= b.alert_threshold
  }).length

  const budgetedCatIds      = new Set(budgets.map(b => b.category_id))
  const availableCategories = categories.filter(c => !budgetedCatIds.has(c.id))

  return (
    <AppLayout title="Budgets" subtitle={`${getMonthName(month)} ${year}`}>

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="min-w-0 rounded-2xl px-4 py-4" style={CARD_STYLE}>
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#F7E8E9' }}>
              <DollarSign size={14} style={{ color: '#C4787C' }} />
            </div>
            <p className="text-[11.5px] font-medium" style={{ color: '#9B928B' }}>Total Budgeted</p>
          </div>
          <p className="text-[17px] font-bold truncate" style={{ color: '#1A1A1A' }}>{formatCurrency(totalBudgeted)}</p>
        </div>

        <div className="min-w-0 rounded-2xl px-4 py-4" style={CARD_STYLE}>
          <div className="flex items-center gap-2.5 mb-2">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: totalSpent > totalBudgeted ? '#FBF0F0' : '#F0EAE2' }}
            >
              <PiggyBank size={14} style={{ color: totalSpent > totalBudgeted ? '#D96B6B' : '#9B928B' }} />
            </div>
            <p className="text-[11.5px] font-medium" style={{ color: '#9B928B' }}>Total Spent</p>
          </div>
          <p className="text-[17px] font-bold truncate" style={{ color: totalSpent > totalBudgeted ? '#D96B6B' : '#1A1A1A' }}>
            {formatCurrency(totalSpent)}
          </p>
        </div>

        <div className="min-w-0 rounded-2xl px-4 py-4" style={CARD_STYLE}>
          <div className="flex items-center gap-2.5 mb-2">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: alertCount > 0 ? '#FBF2EA' : '#F0EAE2' }}
            >
              <AlertTriangle size={14} style={{ color: alertCount > 0 ? '#D4956A' : '#9B928B' }} />
            </div>
            <p className="text-[11.5px] font-medium" style={{ color: '#9B928B' }}>Budget Alerts</p>
          </div>
          <p className="text-[17px] font-bold" style={{ color: alertCount > 0 ? '#D4956A' : '#1A1A1A' }}>
            {alertCount}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2.5 mb-5">
        <div style={{ width: '140px' }}>
          <Select options={MONTHS} value={String(month)} onChange={e => setMonth(Number(e.target.value))} />
        </div>
        <div style={{ width: '88px' }}>
          <Select options={YEARS} value={String(year)} onChange={e => setYear(Number(e.target.value))} />
        </div>
        <div className="ml-auto">
          <Button onClick={() => setAddOpen(true)} disabled={availableCategories.length === 0} size="sm">
            <Plus size={13} /> Set Budget
          </Button>
        </div>
      </div>

      {/* Budget grid */}
      {loading ? (
        <div className="py-10 text-center text-[13px]" style={{ color: '#9B928B' }}>Loading budgets…</div>
      ) : budgets.length === 0 ? (
        <div className="rounded-2xl py-14 text-center" style={CARD_STYLE}>
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center mx-auto mb-3"
            style={{ backgroundColor: '#F0EAE2', border: '1px solid #E8E0D5' }}
          >
            <PiggyBank size={20} style={{ color: '#D4C8BC' }} />
          </div>
          <p className="text-[13px] mb-3" style={{ color: '#9B928B' }}>No budgets set for this month</p>
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus size={13} /> Create Your First Budget
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {budgets.map(budget => (
            <div key={budget.id} className="min-w-0">
              <BudgetCard
                budget={budget}
                transactions={transactions}
                onUpdate={async (id, amount, threshold) => {
                  await upsertBudget(budget.category_id!, amount, threshold)
                }}
                onDelete={async () => { await deleteBudget(budget.id) }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Add budget modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Set Budget" size="sm">
        <div className="mb-5">
          <label className="block text-[13px] font-medium mb-[6px]" style={{ color: '#1A1A1A' }}>Category</label>
          <div className="relative">
            <select
              id="budget-cat-select"
              className="w-full appearance-none rounded-xl text-[13.5px] h-10 pl-3.5 pr-9 focus:outline-none transition-all"
              style={{ backgroundColor: '#FAF8F5', border: '1.5px solid #E8E0D5', color: '#1A1A1A' }}
              onFocus={e => {
                e.currentTarget.style.borderColor = '#E8B4B8'
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(232,180,184,0.18)'
              }}
              onBlur={e => {
                e.currentTarget.style.borderColor = '#E8E0D5'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              {availableCategories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#9B928B' }} />
          </div>
        </div>
        <BudgetForm
          showCategory={false}
          onSubmit={async (amount, threshold) => {
            const sel = document.getElementById('budget-cat-select') as HTMLSelectElement
            await upsertBudget(sel.value, amount, threshold)
            setAddOpen(false)
          }}
          onCancel={() => setAddOpen(false)}
        />
      </Modal>
    </AppLayout>
  )
}
