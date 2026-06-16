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

  const data  = Object.values(byCategory).sort((a, b) => b.value - a.value)
  const total = data.reduce((s, d) => s + d.value, 0)

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-2" style={{ color: '#9B928B' }}>
        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#F0EAE2' }}>
          <span className="text-lg">💸</span>
        </div>
        <p className="text-[12px]">No expense data yet</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 min-w-0">
      {/* Donut — fills the column width */}
      <div style={{ width: '100%', height: '140px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={36}
              outerRadius={58}
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

      {/* Legend — stacked below, truncates properly */}
      <div className="space-y-1.5 min-w-0">
        {data.slice(0, 4).map(item => (
          <div key={item.name} className="flex items-center gap-2 min-w-0">
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.color }} />
            <span className="text-[11px] flex-1 truncate min-w-0" style={{ color: '#6B6560' }}>{item.name}</span>
            <span className="text-[11px] font-semibold flex-shrink-0" style={{ color: '#1A1A1A' }}>
              {((item.value / total) * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
