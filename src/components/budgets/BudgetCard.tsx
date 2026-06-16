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
    ? '#D96B6B'
    : isAlert
    ? '#D4956A'
    : cat?.color ?? '#E8B4B8'

  const borderColor = isOver ? '#F5CECE' : isAlert ? '#F5DCC8' : '#E8E0D5'

  return (
    <>
      <div
        className="rounded-2xl p-5 transition-all hover:shadow-md"
        style={{
          backgroundColor: '#FAF8F5',
          border: `1px solid ${borderColor}`,
          boxShadow: '0 1px 3px rgba(26,26,26,0.05)',
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: cat?.color ? `${cat.color}18` : '#F0EAE2' }}
            >
              {isOver ? (
                <AlertTriangle size={18} style={{ color: '#D96B6B' }} />
              ) : isAlert ? (
                <AlertTriangle size={18} style={{ color: '#D4956A' }} />
              ) : (
                <CheckCircle size={18} style={{ color: cat?.color ?? '#E8B4B8' }} />
              )}
            </div>
            <div>
              <p className="text-[14px] font-semibold" style={{ color: '#1A1A1A' }}>{cat?.name ?? 'Budget'}</p>
              <p className="text-[12px] mt-0.5" style={{ color: '#9B928B' }}>
                {formatCurrency(spent)} spent of {formatCurrency(budget.amount)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setEditOpen(true)}
              className="p-1.5 rounded-lg transition-all"
              style={{ color: '#9B928B' }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.backgroundColor = '#F0EAE2'
                ;(e.currentTarget as HTMLElement).style.color = '#1A1A1A'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'
                ;(e.currentTarget as HTMLElement).style.color = '#9B928B'
              }}
              title="Edit"
            >
              <Pencil size={13} />
            </button>
            <button
              onClick={() => onDelete(budget.id)}
              className="p-1.5 rounded-lg transition-all"
              style={{ color: '#9B928B' }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.backgroundColor = '#FBF0F0'
                ;(e.currentTarget as HTMLElement).style.color = '#D96B6B'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'
                ;(e.currentTarget as HTMLElement).style.color = '#9B928B'
              }}
              title="Delete"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="progress-bar h-[6px]">
            <div
              className="progress-fill h-[6px]"
              style={{ width: `${pct}%`, background: barColor }}
            />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[12px] font-medium" style={{ color: barColor }}>
              {pct.toFixed(0)}% used
            </span>
            <span
              className="text-[12px]"
              style={{ color: remaining < 0 ? '#D96B6B' : '#9B928B', fontWeight: remaining < 0 ? 500 : 400 }}
            >
              {remaining < 0
                ? `${formatCurrency(Math.abs(remaining))} over budget`
                : `${formatCurrency(remaining)} remaining`}
            </span>
          </div>
        </div>

        {/* Alert banner */}
        {isAlert && (
          <div
            className="mt-3 text-xs px-3 py-2 rounded-xl flex items-center gap-2"
            style={
              isOver
                ? { backgroundColor: '#FBF0F0', color: '#D96B6B', border: '1px solid #F5CECE' }
                : { backgroundColor: '#FBF2EA', color: '#B87040', border: '1px solid #F0D8C0' }
            }
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
