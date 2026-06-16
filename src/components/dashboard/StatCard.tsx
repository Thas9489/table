import { formatCurrency } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  amount: number
  icon: LucideIcon
  color: 'indigo' | 'green' | 'red' | 'blue'
  trend?: { value: number; label: string }
  suffix?: string
  noFormat?: boolean
}

const colors = {
  indigo: { bg: '#eef2ff', icon: '#6366f1' },
  green:  { bg: '#ecfdf5', icon: '#059669' },
  red:    { bg: '#fef2f2', icon: '#dc2626' },
  blue:   { bg: '#eff6ff', icon: '#2563eb' },
}

export function StatCard({ title, amount, icon: Icon, color, trend, suffix, noFormat }: StatCardProps) {
  const c = colors[color]

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ background: c.bg }}
        >
          <Icon size={18} style={{ color: c.icon }} />
        </div>
        {trend && (
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              trend.value >= 0
                ? 'bg-emerald-50 text-emerald-600'
                : 'bg-red-50 text-red-600'
            }`}
          >
            {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
        )}
      </div>

      <p className="text-2xl font-bold text-slate-900 tracking-tight">
        {noFormat
          ? `${amount.toFixed(1)}${suffix ?? ''}`
          : `${formatCurrency(amount)}${suffix ?? ''}`}
      </p>
      <p className="text-xs text-slate-500 mt-1 font-medium">{title}</p>

      {trend && (
        <p className="text-[11px] text-slate-400 mt-1">{trend.label}</p>
      )}
    </div>
  )
}
