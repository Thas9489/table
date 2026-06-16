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
import { Plus, TrendingUp, TrendingDown } from 'lucide-react'

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

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="min-w-0 rounded-2xl px-4 py-4 flex items-center gap-3" style={CARD_STYLE}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#EBF5F1' }}>
            <TrendingUp size={15} style={{ color: '#5BA68A' }} />
          </div>
          <div className="min-w-0">
            <p className="text-[11.5px] font-medium" style={{ color: '#9B928B' }}>Total Income</p>
            <p className="text-[15px] font-bold truncate" style={{ color: '#5BA68A' }}>{formatCurrency(totalIncome)}</p>
          </div>
        </div>
        <div className="min-w-0 rounded-2xl px-4 py-4 flex items-center gap-3" style={CARD_STYLE}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#FBF0F0' }}>
            <TrendingDown size={15} style={{ color: '#D96B6B' }} />
          </div>
          <div className="min-w-0">
            <p className="text-[11.5px] font-medium" style={{ color: '#9B928B' }}>Total Expenses</p>
            <p className="text-[15px] font-bold truncate" style={{ color: '#D96B6B' }}>{formatCurrency(totalExpense)}</p>
          </div>
        </div>
        <div className="min-w-0 rounded-2xl px-4 py-4 flex items-center gap-3" style={CARD_STYLE}>
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: net >= 0 ? '#EBF5F1' : '#FBF0F0' }}
          >
            <TrendingUp size={15} style={{ color: net >= 0 ? '#5BA68A' : '#D96B6B' }} />
          </div>
          <div className="min-w-0">
            <p className="text-[11.5px] font-medium" style={{ color: '#9B928B' }}>Net</p>
            <p className="text-[15px] font-bold truncate" style={{ color: net >= 0 ? '#5BA68A' : '#D96B6B' }}>
              {formatCurrency(net)}
            </p>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {/* Type pills */}
        <div className="flex gap-1.5 flex-shrink-0">
          {(['all', 'income', 'expense'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className="px-3 py-[7px] rounded-xl text-[12px] font-medium transition-all whitespace-nowrap"
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

        <div style={{ width: '160px', flexShrink: 0 }}>
          <Select options={catOptions} value={catFilter} onChange={e => setCatFilter(e.target.value)} />
        </div>
        <div style={{ width: '120px', flexShrink: 0 }}>
          <Select options={MONTHS} value={String(month)} onChange={e => setMonth(Number(e.target.value))} />
        </div>
        <div style={{ width: '88px', flexShrink: 0 }}>
          <Select options={YEARS} value={String(year)} onChange={e => setYear(Number(e.target.value))} />
        </div>

        <div className="ml-auto flex-shrink-0">
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus size={13} /> Add Transaction
          </Button>
        </div>
      </div>

      {/* Transaction list */}
      <div className="rounded-2xl overflow-hidden" style={CARD_STYLE}>
        {loading ? (
          <div className="px-5 py-10 text-center text-[13px]" style={{ color: '#9B928B' }}>Loading…</div>
        ) : transactions.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center mx-auto mb-3"
              style={{ backgroundColor: '#F0EAE2', border: '1px solid #E8E0D5' }}
            >
              <TrendingUp size={20} style={{ color: '#D4C8BC' }} />
            </div>
            <p className="text-[13px] mb-3" style={{ color: '#9B928B' }}>No transactions found</p>
            <Button size="sm" onClick={() => setAddOpen(true)}>
              <Plus size={13} /> Add Transaction
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
