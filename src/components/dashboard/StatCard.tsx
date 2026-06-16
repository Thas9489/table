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

// Mapped to new beige/blush palette
const colors = {
  indigo: { bg: '#F7E8E9', icon: '#C4787C' },  // blush pink
  green:  { bg: '#EBF5F1', icon: '#5BA68A' },  // soft sage
  red:    { bg: '#FBF0F0', icon: '#D96B6B' },  // soft rose
  blue:   { bg: '#EBF0F5', icon: '#7A9EB5' },  // muted sky
}

export function StatCard({ title, amount, icon: Icon, color, trend, suffix, noFormat }: StatCardProps) {
  const c = colors[color]

  return (
    <div
      className="rounded-2xl p-5 transition-shadow hover:shadow-md"
      style={{
        backgroundColor: '#FAF8F5',
        border: '1px solid #E8E0D5',
        boxShadow: '0 1px 3px rgba(26,26,26,0.05)',
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: c.bg }}
        >
          <Icon size={18} style={{ color: c.icon }} />
        </div>
        {trend && (
          <span
            className="text-xs font-medium px-2 py-0.5 rounded-full"
            style={
              trend.value >= 0
                ? { backgroundColor: '#EBF5F1', color: '#5BA68A' }
                : { backgroundColor: '#FBF0F0', color: '#D96B6B' }
            }
          >
            {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
        )}
      </div>

      <p className="text-2xl font-bold tracking-tight" style={{ color: '#1A1A1A' }}>
        {noFormat
          ? `${amount.toFixed(1)}${suffix ?? ''}`
          : `${formatCurrency(amount)}${suffix ?? ''}`}
      </p>
      <p className="text-xs mt-1 font-medium" style={{ color: '#9B928B' }}>{title}</p>

      {trend && (
        <p className="text-[11px] mt-1" style={{ color: '#9B928B' }}>{trend.label}</p>
      )}
    </div>
  )
}
