'use client'
import { useState } from 'react'
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

const CARD_STYLE = {
  backgroundColor: '#FAF8F5',
  border: '1px solid #E8E0D5',
  boxShadow: '0 1px 3px rgba(26,26,26,0.05)',
}

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
  } = useTransactions({ month, year })

  const [addOpen, setAddOpen] = useState(false)

  return (
    <AppLayout
      title="Dashboard"
      subtitle={`${getMonthName(month)} ${year} overview`}
    >
      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        <div className="min-w-0">
          <StatCard title="Net Balance"    amount={balance}      icon={Wallet}      color="indigo" />
        </div>
        <div className="min-w-0">
          <StatCard title="Total Income"   amount={totalIncome}  icon={TrendingUp}  color="green" />
        </div>
        <div className="min-w-0">
          <StatCard title="Total Expenses" amount={totalExpense} icon={TrendingDown} color="red" />
        </div>
        <div className="min-w-0">
          <StatCard
            title="Savings Rate"
            amount={totalIncome > 0 ? (balance / totalIncome) * 100 : 0}
            icon={Scale}
            color="blue"
            suffix="%"
            noFormat
          />
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {/* Area chart */}
        <div className="col-span-2 min-w-0 rounded-2xl p-5" style={CARD_STYLE}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-[13.5px] font-semibold" style={{ color: '#1A1A1A' }}>7-Day Activity</h3>
              <p className="text-[11.5px] mt-0.5" style={{ color: '#9B928B' }}>Income vs Expenses</p>
            </div>
            <div className="flex items-center gap-4 text-[11px] flex-shrink-0">
              <span className="flex items-center gap-1.5" style={{ color: '#6B6560' }}>
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: '#5BA68A' }} />
                Income
              </span>
              <span className="flex items-center gap-1.5" style={{ color: '#6B6560' }}>
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: '#D96B6B' }} />
                Expenses
              </span>
            </div>
          </div>
          <MonthlyChart transactions={transactions} />
        </div>

        {/* Spending donut */}
        <div className="min-w-0 rounded-2xl p-5" style={CARD_STYLE}>
          <div className="mb-4">
            <h3 className="text-[13.5px] font-semibold" style={{ color: '#1A1A1A' }}>By Category</h3>
            <p className="text-[11.5px] mt-0.5" style={{ color: '#9B928B' }}>This month</p>
          </div>
          <SpendingChart transactions={transactions} />
        </div>
      </div>

      {/* Recent transactions */}
      <div className="rounded-2xl overflow-hidden" style={CARD_STYLE}>
        <div
          className="flex items-center justify-between px-5 py-3.5"
          style={{ borderBottom: '1px solid #F0EAE2' }}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <h3 className="text-[13.5px] font-semibold flex-shrink-0" style={{ color: '#1A1A1A' }}>
              Recent Transactions
            </h3>
            <span
              className="text-[11px] px-2 py-0.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: '#F0EAE2', color: '#6B6560' }}
            >
              {transactions.length} this month
            </span>
          </div>
          <Button size="sm" onClick={() => setAddOpen(true)} className="flex-shrink-0 ml-3">
            <Plus size={13} /> Add
          </Button>
        </div>

        <div>
          {loading ? (
            <div className="px-5 py-10 text-center">
              <p className="text-[13px]" style={{ color: '#9B928B' }}>Loading…</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center mx-auto mb-3"
                style={{ backgroundColor: '#F0EAE2', border: '1px solid #E8E0D5' }}
              >
                <TrendingUp size={18} style={{ color: '#D4C8BC' }} />
              </div>
              <p className="text-[13px] mb-3" style={{ color: '#9B928B' }}>No transactions yet</p>
              <Button size="sm" onClick={() => setAddOpen(true)}>
                <Plus size={13} /> Add first transaction
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
