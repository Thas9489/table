'use client'
import { useState } from 'react'
import { formatCurrency } from '@/lib/utils'
import type { Budget, Transaction } from '@/lib/supabase/types'
import { AlertTriangle, Trash2, Pencil, CheckCircle } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { BudgetForm } from './BudgetForm'

interface BudgetCardProps {
  budget: Budget
  transactions: Transaction[]
  onUpdate: (id: string, amount: number, threshold: number) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export function BudgetCard({ budget, transactions, onUpdate, onDelete }: BudgetCardProps) {
  const [editOpen, setEditOpen] = useState(false)

  const spent = transactions
    .filter(t => t.category_id === budget.category_id && t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0)

  const pct       = Math.min((spent / budget.amount) * 100, 100)
  const isAlert   = pct >= budget.alert_threshold
  const isOver    = spent > budget.amount
  const cat       = budget.categories
  const remaining = budget.amount - spent

  const barColor = isOver
    ? '#dc2626'
    : isAlert
    ? '#d97706'
    : cat?.color ?? '#6366f1'

  return (
    <>
      <div
        className={`bg-white rounded-xl p-5 shadow-sm border transition-shadow hover:shadow-md ${
          isOver   ? 'border-red-200'
          : isAlert ? 'border-amber-200'
          : 'border-slate-200'
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
              style={{ background: cat?.color ? `${cat.color}14` : '#f1f5f9' }}
            >
              {isOver ? (
                <AlertTriangle size={18} className="text-red-500" />
              ) : isAlert ? (
                <AlertTriangle size={18} className="text-amber-500" />
              ) : (
                <CheckCircle  size={18} style={{ color: cat?.color ?? '#6366f1' }} />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">{cat?.name ?? 'Budget'}</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {formatCurrency(spent)} spent of {formatCurrency(budget.amount)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setEditOpen(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
              title="Edit"
            >
              <Pencil size={13} />
            </button>
            <button
              onClick={() => onDelete(budget.id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
              title="Delete"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="progress-bar h-2">
            <div
              className="progress-fill h-2"
              style={{ width: `${pct}%`, background: barColor }}
            />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium" style={{ color: barColor }}>
              {pct.toFixed(0)}% used
            </span>
            <span className={`text-xs ${remaining < 0 ? 'text-red-500 font-medium' : 'text-slate-400'}`}>
              {remaining < 0
                ? `${formatCurrency(Math.abs(remaining))} over budget`
                : `${formatCurrency(remaining)} remaining`}
            </span>
          </div>
        </div>

        {/* Alert banner */}
        {isAlert && (
          <div
            className={`mt-3 text-xs px-3 py-2 rounded-lg flex items-center gap-2 ${
              isOver
                ? 'bg-red-50 text-red-600 border border-red-100'
                : 'bg-amber-50 text-amber-700 border border-amber-100'
            }`}
          >
            <AlertTriangle size={12} className="flex-shrink-0" />
            {isOver
              ? `Over budget by ${formatCurrency(Math.abs(remaining))}`
              : `Alert: ${budget.alert_threshold}% threshold reached`}
          </div>
        )}
      </div>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Budget" size="sm">
        <BudgetForm
          initial={budget}
          onSubmit={async (amount, threshold) => {
            await onUpdate(budget.id, amount, threshold)
            setEditOpen(false)
          }}
          onCancel={() => setEditOpen(false)}
        />
      </Modal>
    </>
  )
}
