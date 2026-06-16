'use client'
import { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { TransactionCard } from '@/components/transactions/TransactionCard'
import { TransactionForm } from '@/components/transactions/TransactionForm'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { useTransactions } from '@/hooks/useTransactions'
import { useCategories } from '@/hooks/useCategories'
import { formatCurrency, getMonthName } from '@/lib/utils'
import { Plus, TrendingUp, TrendingDown, Filter } from 'lucide-react'

const MONTHS = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1),
  label: getMonthName(i + 1),
}))
const YEARS = Array.from({ length: 5 }, (_, i) => {
  const y = new Date().getFullYear() - i
  return { value: String(y), label: String(y) }
})

export default function TransactionsPage() {
  const now = new Date()
  const [month,      setMonth]      = useState(now.getMonth() + 1)
  const [year,       setYear]       = useState(now.getFullYear())
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all')
  const [catFilter,  setCatFilter]  = useState('')
  const [addOpen,    setAddOpen]    = useState(false)

  const { categories } = useCategories()
  const { transactions, loading, totalIncome, totalExpense, addTransaction, updateTransaction, deleteTransaction } =
    useTransactions({
      month,
      year,
      type:        typeFilter === 'all' ? undefined : typeFilter,
      category_id: catFilter || undefined,
    })

  const catOptions = [
    { value: '', label: 'All Categories' },
    ...categories.map(c => ({ value: c.id, label: c.name })),
  ]

  const net = totalIncome - totalExpense

  return (
    <AppLayout title="Transactions" subtitle={`${getMonthName(month)} ${year}`}>
      {/* Summary bar */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-slate-200 rounded-xl px-5 py-4 shadow-sm flex items-center gap-4">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
            <TrendingUp size={16} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Total Income</p>
            <p className="text-base font-bold text-emerald-600">{formatCurrency(totalIncome)}</p>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl px-5 py-4 shadow-sm flex items-center gap-4">
          <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
            <TrendingDown size={16} className="text-red-500" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Total Expenses</p>
            <p className="text-base font-bold text-red-600">{formatCurrency(totalExpense)}</p>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl px-5 py-4 shadow-sm flex items-center gap-4">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${net >= 0 ? 'bg-emerald-50' : 'bg-red-50'}`}>
            <TrendingUp size={16} className={net >= 0 ? 'text-emerald-600' : 'text-red-500'} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Net</p>
            <p className={`text-base font-bold ${net >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {formatCurrency(net)}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <Filter size={14} className="text-slate-400 flex-shrink-0" />

        {/* Type pills */}
        <div className="flex gap-1.5">
          {(['all', 'income', 'expense'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                typeFilter === t
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <div className="w-44">
          <Select options={catOptions} value={catFilter} onChange={e => setCatFilter(e.target.value)} />
        </div>
        <div className="w-32">
          <Select options={MONTHS} value={String(month)} onChange={e => setMonth(Number(e.target.value))} />
        </div>
        <div className="w-24">
          <Select options={YEARS} value={String(year)} onChange={e => setYear(Number(e.target.value))} />
        </div>

        <div className="ml-auto">
          <Button onClick={() => setAddOpen(true)}>
            <Plus size={15} /> Add Transaction
          </Button>
        </div>
      </div>

      {/* Transaction list */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="p-10 text-center text-slate-400 text-sm">Loading…</div>
          ) : transactions.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto mb-4">
                <TrendingUp size={22} className="text-slate-300" />
              </div>
              <p className="text-slate-400 text-sm mb-4">No transactions found</p>
              <Button size="sm" onClick={() => setAddOpen(true)}>
                <Plus size={14} /> Add Transaction
              </Button>
            </div>
          ) : (
            transactions.map(tx => (
              <TransactionCard
                key={tx.id}
                transaction={tx}
                onUpdate={async (id, data) => { await updateTransaction(id, data) }}
                onDelete={async (id) => { await deleteTransaction(id) }}
              />
            ))
          )}
        </div>
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Transaction">
        <TransactionForm
          onSubmit={async (data) => {
            await addTransaction(data)
            setAddOpen(false)
          }}
          onCancel={() => setAddOpen(false)}
        />
      </Modal>
    </AppLayout>
  )
}
