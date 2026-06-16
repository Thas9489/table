'use client'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { formatCurrency } from '@/lib/utils'
import type { Transaction } from '@/lib/supabase/types'

interface SpendingChartProps {
  transactions: Transaction[]
}

export function SpendingChart({ transactions }: SpendingChartProps) {
  const byCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce<Record<string, { name: string; value: number; color: string }>>((acc, t) => {
      const key = t.category_id ?? 'other'
      const name = t.categories?.name ?? 'Other'
      const color = t.categories?.color ?? '#E8B4B8'
      if (!acc[key]) acc[key] = { name, value: 0, color }
      acc[key].value += t.amount
      return acc
    }, {})

  const data = Object.values(byCategory).sort((a, b) => b.value - a.value)
  const total = data.reduce((s, d) => s + d.value, 0)

  if (data.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center h-48 gap-2"
        style={{ color: '#9B928B' }}
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: '#F0EAE2' }}
        >
          <span className="text-lg">💸</span>
        </div>
        <p className="text-sm">No expense data yet</p>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-5">
      <div className="w-36 h-36 flex-shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={36}
              outerRadius={60}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color} stroke="#FAF8F5" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any) => formatCurrency(Number(value))}
              contentStyle={{
                background: '#FAF8F5',
                border: '1px solid #E8E0D5',
                borderRadius: '12px',
                color: '#1A1A1A',
                fontSize: '12px',
                boxShadow: '0 4px 16px rgba(26,26,26,0.08)',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex-1 space-y-2 min-w-0">
        {data.slice(0, 5).map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: item.color }}
            />
            <span className="text-xs flex-1 truncate" style={{ color: '#6B6560' }}>{item.name}</span>
            <span className="text-xs font-semibold" style={{ color: '#1A1A1A' }}>
              {formatCurrency(item.value)}
            </span>
            <span className="text-[10px] w-7 text-right" style={{ color: '#9B928B' }}>
              {((item.value / total) * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
