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
      <div className="grid grid-cols-4 gap-4 mb-6 animate-fade-up">
        <StatCard title="Net Balance"     amount={balance}      icon={Wallet}      color="indigo" />
        <StatCard title="Total Income"    amount={totalIncome}  icon={TrendingUp}  color="green" />
        <StatCard title="Total Expenses"  amount={totalExpense} icon={TrendingDown} color="red" />
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
        <div className="col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">7-Day Activity</h3>
              <p className="text-xs text-slate-400 mt-0.5">Income vs Expenses</p>
            </div>
            <div className="flex items-center gap-4 text-[11px]">
              <span className="flex items-center gap-1.5 text-slate-500">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />Income
              </span>
              <span className="flex items-center gap-1.5 text-slate-500">
                <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />Expenses
              </span>
            </div>
          </div>
          <MonthlyChart transactions={transactions} />
        </div>

        {/* Spending donut */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-800">Spending by Category</h3>
            <p className="text-xs text-slate-400 mt-0.5">This month</p>
          </div>
          <SpendingChart transactions={transactions} />
        </div>
      </div>

      {/* Recent transactions */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Recent Transactions</h3>
            <p className="text-xs text-slate-400 mt-0.5">{transactions.length} this month</p>
          </div>
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus size={14} /> Add
          </Button>
        </div>

        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="p-8 text-center text-slate-400 text-sm">Loading transactions…</div>
          ) : transactions.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-slate-400 text-sm mb-3">No transactions yet</p>
              <Button size="sm" onClick={() => setAddOpen(true)}>
                <Plus size={14} /> Add your first transaction
              </Button>
            </div>
          ) : (
            transactions.slice(0, 8).map(tx => (
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
