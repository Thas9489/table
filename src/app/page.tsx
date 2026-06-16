'use client'
import { useState, useEffect, useRef } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { StatCard } from '@/components/dashboard/StatCard'
import { SpendingChart } from '@/components/dashboard/SpendingChart'
import { MonthlyChart } from '@/components/dashboard/MonthlyChart'
import { TransactionCard } from '@/components/transactions/TransactionCard'
import { Modal } from '@/components/ui/modal'
import { TransactionForm } from '@/components/transactions/TransactionForm'
import { Button } from '@/components/ui/button'
import { useTransactions } from '@/hooks/useTransactions'
import { getCurrentMonth, getMonthName } from '@/lib/utils'
import { Wallet, TrendingUp, TrendingDown, Scale, Plus } from 'lucide-react'

export default function Dashboard() {
  const { month, year } = getCurrentMonth()
  const {
    transactions,
    loading,
    totalIncome,
    totalExpense,
    balance,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    refresh,
  } = useTransactions({ month, year })

  const [addOpen, setAddOpen] = useState(false)
  const seededRef = useRef(false)

  // Auto-seed 10 sample transactions if DB is empty
  useEffect(() => {
    if (!loading && transactions.length === 0 && !seededRef.current) {
      seededRef.current = true
      fetch('/api/seed', { method: 'POST' })
        .then(r => r.ok ? refresh() : null)
        .catch(() => null)
    }
  }, [loading, transactions.length, refresh])

  return (
    <AppLayout
      title="Dashboard"
      subtitle={`${getMonthName(month)} ${year} overview`}
    >
      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4 mb-6 animate-fade-up">
        <StatCard title="Net Balance"    amount={balance}      icon={Wallet}      color="indigo" />
        <StatCard title="Total Income"   amount={totalIncome}  icon={TrendingUp}  color="green" />
        <StatCard title="Total Expenses" amount={totalExpense} icon={TrendingDown} color="red" />
        <StatCard
          title="Savings Rate"
          amount={totalIncome > 0 ? (balance / totalIncome) * 100 : 0}
          icon={Scale}
          color="blue"
          suffix="%"
          noFormat
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* Area chart */}
        <div
          className="col-span-2 rounded-2xl p-5"
          style={{ backgroundColor: '#FAF8F5', border: '1px solid #E8E0D5', boxShadow: '0 1px 3px rgba(26,26,26,0.05)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold" style={{ color: '#1A1A1A' }}>7-Day Activity</h3>
              <p className="text-xs mt-0.5" style={{ color: '#9B928B' }}>Income vs Expenses</p>
            </div>
            <div className="flex items-center gap-4 text-[11px]">
              <span className="flex items-center gap-1.5" style={{ color: '#6B6560' }}>
                <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: '#5BA68A' }} />
                Income
              </span>
              <span className="flex items-center gap-1.5" style={{ color: '#6B6560' }}>
                <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: '#D96B6B' }} />
                Expenses
              </span>
            </div>
          </div>
          <MonthlyChart transactions={transactions} />
        </div>

        {/* Spending donut */}
        <div
          className="rounded-2xl p-5"
          style={{ backgroundColor: '#FAF8F5', border: '1px solid #E8E0D5', boxShadow: '0 1px 3px rgba(26,26,26,0.05)' }}
        >
          <div className="mb-4">
            <h3 className="text-sm font-semibold" style={{ color: '#1A1A1A' }}>Spending by Category</h3>
            <p className="text-xs mt-0.5" style={{ color: '#9B928B' }}>This month</p>
          </div>
          <SpendingChart transactions={transactions} />
        </div>
      </div>

      {/* Recent transactions */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ backgroundColor: '#FAF8F5', border: '1px solid #E8E0D5', boxShadow: '0 1px 3px rgba(26,26,26,0.05)' }}
      >
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid #F0EAE2' }}
        >
          <div>
            <h3 className="text-sm font-semibold" style={{ color: '#1A1A1A' }}>Recent Transactions</h3>
            <p className="text-xs mt-0.5" style={{ color: '#9B928B' }}>{transactions.length} this month</p>
          </div>
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus size={14} /> Add
          </Button>
        </div>

        <div style={{ borderTop: 'none' }}>
          {loading ? (
            <div className="p-10 text-center text-sm" style={{ color: '#9B928B' }}>
              Loading transactions…
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-12 text-center">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: '#F0EAE2', border: '1px solid #E8E0D5' }}
              >
                <TrendingUp size={20} style={{ color: '#D4C8BC' }} />
              </div>
              <p className="text-sm mb-3" style={{ color: '#9B928B' }}>No transactions yet</p>
              <Button size="sm" onClick={() => setAddOpen(true)}>
                <Plus size={14} /> Add your first transaction
              </Button>
            </div>
          ) : (
            <div>
              {transactions.slice(0, 8).map((tx, i) => (
                <div key={tx.id} style={i > 0 ? { borderTop: '1px solid #F0EAE2' } : {}}>
                  <TransactionCard
                    transaction={tx}
                    onUpdate={async (id, data) => { await updateTransaction(id, data) }}
                    onDelete={async (id) => { await deleteTransaction(id) }}
                  />
                </div>
              ))}
            </div>
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
