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
        <div className="bg-white border border-slate-200 rounded-xl px-5 py-4 shadow-sm">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
              <DollarSign size={14} className="text-indigo-600" />
            </div>
            <p className="text-xs text-slate-500 font-medium">Total Budgeted</p>
          </div>
          <p className="text-xl font-bold text-slate-900">{formatCurrency(totalBudgeted)}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl px-5 py-4 shadow-sm">
          <div className="flex items-center gap-3 mb-1">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${totalSpent > totalBudgeted ? 'bg-red-50' : 'bg-slate-100'}`}>
              <PiggyBank size={14} className={totalSpent > totalBudgeted ? 'text-red-500' : 'text-slate-400'} />
            </div>
            <p className="text-xs text-slate-500 font-medium">Total Spent</p>
          </div>
          <p className={`text-xl font-bold ${totalSpent > totalBudgeted ? 'text-red-600' : 'text-slate-900'}`}>
            {formatCurrency(totalSpent)}
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl px-5 py-4 shadow-sm">
          <div className="flex items-center gap-3 mb-1">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${alertCount > 0 ? 'bg-amber-50' : 'bg-slate-100'}`}>
              <AlertTriangle size={14} className={alertCount > 0 ? 'text-amber-500' : 'text-slate-400'} />
            </div>
            <p className="text-xs text-slate-500 font-medium">Budget Alerts</p>
          </div>
          <p className={`text-xl font-bold ${alertCount > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
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
        <div className="p-10 text-center text-slate-400 text-sm">Loading budgets…</div>
      ) : budgets.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-16 text-center shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto mb-4">
            <PiggyBank size={22} className="text-slate-300" />
          </div>
          <p className="text-slate-400 text-sm mb-4">No budgets set for this month</p>
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
          <label className="text-sm font-medium text-slate-700 block mb-1.5">Category</label>
          <div className="relative">
            <select
              id="budget-cat-select"
              className="w-full appearance-none bg-white border border-slate-300 rounded-lg text-sm text-slate-900 px-3.5 py-2 h-10 pr-9 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
            >
              {availableCategories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
