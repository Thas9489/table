'use client'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { formatCurrency } from '@/lib/utils'
import type { Transaction } from '@/lib/supabase/types'

interface MonthlyChartProps {
  transactions: Transaction[]
}

export function MonthlyChart({ transactions }: MonthlyChartProps) {
  const days: { date: string; label: string; income: number; expense: number }[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    const label = d.toLocaleDateString('en-US', { weekday: 'short' })
    const income = transactions
      .filter(t => t.date === dateStr && t.type === 'income')
      .reduce((s, t) => s + t.amount, 0)
    const expense = transactions
      .filter(t => t.date === dateStr && t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0)
    days.push({ date: dateStr, label, income, expense })
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={days} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#5BA68A" stopOpacity={0.18} />
            <stop offset="95%" stopColor="#5BA68A" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#D96B6B" stopOpacity={0.14} />
            <stop offset="95%" stopColor="#D96B6B" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D5" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: '#9B928B', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: '#9B928B', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={v => `$${v}`}
        />
        <Tooltip
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={(v: any, name: any) => [
            formatCurrency(Number(v)),
            String(name).charAt(0).toUpperCase() + String(name).slice(1),
          ]}
          contentStyle={{
            background: '#FAF8F5',
            border: '1px solid #E8E0D5',
            borderRadius: '12px',
            color: '#1A1A1A',
            fontSize: '12px',
            boxShadow: '0 4px 16px rgba(26,26,26,0.08)',
          }}
          labelStyle={{ color: '#6B6560', fontWeight: 500 }}
        />
        <Area
          type="monotone"
          dataKey="income"
          stroke="#5BA68A"
          strokeWidth={2}
          fill="url(#incomeGrad)"
          dot={false}
        />
        <Area
          type="monotone"
          dataKey="expense"
          stroke="#D96B6B"
          strokeWidth={2}
          fill="url(#expenseGrad)"
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
