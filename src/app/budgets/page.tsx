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
import { Plus, PiggyBank, AlertTriangle, DollarSign } from 'lucide-react'

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
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="rounded-2xl px-5 py-4" style={CARD_STYLE}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#F7E8E9' }}>
              <DollarSign size={14} style={{ color: '#C4787C' }} />
            </div>
            <p className="text-xs font-medium" style={{ color: '#9B928B' }}>Total Budgeted</p>
          </div>
          <p className="text-xl font-bold" style={{ color: '#1A1A1A' }}>{formatCurrency(totalBudgeted)}</p>
        </div>
        <div className="rounded-2xl px-5 py-4" style={CARD_STYLE}>
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: totalSpent > totalBudgeted ? '#FBF0F0' : '#F0EAE2' }}
            >
              <PiggyBank size={14} style={{ color: totalSpent > totalBudgeted ? '#D96B6B' : '#9B928B' }} />
            </div>
            <p className="text-xs font-medium" style={{ color: '#9B928B' }}>Total Spent</p>
          </div>
          <p className="text-xl font-bold" style={{ color: totalSpent > totalBudgeted ? '#D96B6B' : '#1A1A1A' }}>
            {formatCurrency(totalSpent)}
          </p>
        </div>
        <div className="rounded-2xl px-5 py-4" style={CARD_STYLE}>
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: alertCount > 0 ? '#FBF2EA' : '#F0EAE2' }}
            >
              <AlertTriangle size={14} style={{ color: alertCount > 0 ? '#D4956A' : '#9B928B' }} />
            </div>
            <p className="text-xs font-medium" style={{ color: '#9B928B' }}>Budget Alerts</p>
          </div>
          <p className="text-xl font-bold" style={{ color: alertCount > 0 ? '#D4956A' : '#1A1A1A' }}>
            {alertCount}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-36">
          <Select options={MONTHS} value={String(month)} onChange={e => setMonth(Number(e.target.value))} />
        </div>
        <div className="w-24">
          <Select options={YEARS} value={String(year)} onChange={e => setYear(Number(e.target.value))} />
        </div>
        <div className="ml-auto">
          <Button onClick={() => setAddOpen(true)} disabled={availableCategories.length === 0}>
            <Plus size={15} /> Set Budget
          </Button>
        </div>
      </div>

      {/* Budget grid */}
      {loading ? (
        <div className="p-10 text-center text-sm" style={{ color: '#9B928B' }}>Loading budgets…</div>
      ) : budgets.length === 0 ? (
        <div className="rounded-2xl p-16 text-center" style={CARD_STYLE}>
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: '#F0EAE2', border: '1px solid #E8E0D5' }}
          >
            <PiggyBank size={22} style={{ color: '#D4C8BC' }} />
          </div>
          <p className="text-sm mb-4" style={{ color: '#9B928B' }}>No budgets set for this month</p>
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus size={14} /> Create Your First Budget
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {budgets.map(budget => (
            <BudgetCard
              key={budget.id}
              budget={budget}
              transactions={transactions}
              onUpdate={async (id, amount, threshold) => {
                await upsertBudget(budget.category_id!, amount, threshold)
              }}
              onDelete={async (id) => { await deleteBudget(id) }}
            />
          ))}
        </div>
      )}

      {/* Add budget modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Set Budget" size="sm">
        <div className="mb-5">
          <label className="text-sm font-medium block mb-1.5" style={{ color: '#1A1A1A' }}>Category</label>
          <div className="relative">
            <select
              id="budget-cat-select"
              className="w-full appearance-none rounded-xl text-sm px-3.5 py-2 h-10 pr-9 focus:outline-none transition-all"
              style={{ backgroundColor: '#FAF8F5', border: '1px solid #E8E0D5', color: '#1A1A1A' }}
            >
              {availableCategories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: '#9B928B' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
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
