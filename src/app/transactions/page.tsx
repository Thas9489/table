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

const CARD_STYLE = {
  backgroundColor: '#FAF8F5',
  border: '1px solid #E8E0D5',
  boxShadow: '0 1px 3px rgba(26,26,26,0.05)',
}

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
        <div className="rounded-2xl px-5 py-4 flex items-center gap-4" style={CARD_STYLE}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#EBF5F1' }}>
            <TrendingUp size={16} style={{ color: '#5BA68A' }} />
          </div>
          <div>
            <p className="text-xs font-medium" style={{ color: '#9B928B' }}>Total Income</p>
            <p className="text-base font-bold" style={{ color: '#5BA68A' }}>{formatCurrency(totalIncome)}</p>
          </div>
        </div>
        <div className="rounded-2xl px-5 py-4 flex items-center gap-4" style={CARD_STYLE}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#FBF0F0' }}>
            <TrendingDown size={16} style={{ color: '#D96B6B' }} />
          </div>
          <div>
            <p className="text-xs font-medium" style={{ color: '#9B928B' }}>Total Expenses</p>
            <p className="text-base font-bold" style={{ color: '#D96B6B' }}>{formatCurrency(totalExpense)}</p>
          </div>
        </div>
        <div className="rounded-2xl px-5 py-4 flex items-center gap-4" style={CARD_STYLE}>
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: net >= 0 ? '#EBF5F1' : '#FBF0F0' }}
          >
            <TrendingUp size={16} style={{ color: net >= 0 ? '#5BA68A' : '#D96B6B' }} />
          </div>
          <div>
            <p className="text-xs font-medium" style={{ color: '#9B928B' }}>Net</p>
            <p className="text-base font-bold" style={{ color: net >= 0 ? '#5BA68A' : '#D96B6B' }}>
              {formatCurrency(net)}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <Filter size={14} style={{ color: '#9B928B' }} className="flex-shrink-0" />

        {/* Type pills */}
        <div className="flex gap-1.5">
          {(['all', 'income', 'expense'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
              style={
                typeFilter === t
                  ? { backgroundColor: '#E8B4B8', color: '#1A1A1A', border: '1px solid #E8B4B8' }
                  : { backgroundColor: '#FAF8F5', color: '#6B6560', border: '1px solid #E8E0D5' }
              }
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
      <div className="rounded-2xl overflow-hidden" style={CARD_STYLE}>
        {loading ? (
          <div className="p-10 text-center text-sm" style={{ color: '#9B928B' }}>Loading…</div>
        ) : transactions.length === 0 ? (
          <div className="p-16 text-center">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: '#F0EAE2', border: '1px solid #E8E0D5' }}
            >
              <TrendingUp size={22} style={{ color: '#D4C8BC' }} />
            </div>
            <p className="text-sm mb-4" style={{ color: '#9B928B' }}>No transactions found</p>
            <Button size="sm" onClick={() => setAddOpen(true)}>
              <Plus size={14} /> Add Transaction
            </Button>
          </div>
        ) : (
          <>
            {transactions.map((tx, i) => (
              <div key={tx.id} style={i > 0 ? { borderTop: '1px solid #F0EAE2' } : {}}>
                <TransactionCard
                  transaction={tx}
                  onUpdate={async (id, data) => { await updateTransaction(id, data) }}
                  onDelete={async (id) => { await deleteTransaction(id) }}
                />
              </div>
            ))}
          </>
        )}
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
