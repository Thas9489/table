'use client'
import { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Select } from '@/components/ui/select'
import { useTransactions } from '@/hooks/useTransactions'
import { formatCurrency, getMonthName } from '@/lib/utils'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'

const MONTHS = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1),
  label: getMonthName(i + 1),
}))
const YEARS = Array.from({ length: 5 }, (_, i) => {
  const y = new Date().getFullYear() - i
  return { value: String(y), label: String(y) }
})

const tooltipStyle = {
  background: '#FAF8F5',
  border: '1px solid #E8E0D5',
  borderRadius: '12px',
  color: '#1A1A1A',
  fontSize: '12px',
  boxShadow: '0 4px 16px rgba(26,26,26,0.08)',
}

const CARD_STYLE = {
  backgroundColor: '#FAF8F5',
  border: '1px solid #E8E0D5',
  boxShadow: '0 1px 3px rgba(26,26,26,0.05)',
}

export default function AnalyticsPage() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year,  setYear]  = useState(now.getFullYear())

  const { transactions, totalIncome, totalExpense, balance } = useTransactions({ month, year })

  // Category breakdown
  const byCat = transactions
    .filter(t => t.type === 'expense')
    .reduce<Record<string, { name: string; value: number; color: string }>>((acc, t) => {
      const key = t.category_id ?? 'other'
      if (!acc[key]) acc[key] = {
        name:  t.categories?.name  ?? 'Other',
        value: 0,
        color: t.categories?.color ?? '#E8B4B8',
      }
      acc[key].value += t.amount
      return acc
    }, {})
  const pieData = Object.values(byCat).sort((a, b) => b.value - a.value)
  const pieTotal = pieData.reduce((s, d) => s + d.value, 0)

  // Daily bar chart
  const daysInMonth = new Date(year, month, 0).getDate()
  const barData = Array.from({ length: daysInMonth }, (_, i) => {
    const d       = String(i + 1).padStart(2, '0')
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${d}`
    const income  = transactions.filter(t => t.date === dateStr && t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const expense = transactions.filter(t => t.date === dateStr && t.type === 'expense').reduce((s, t) => s + t.amount, 0)
    return { day: i + 1, income, expense }
  })

  const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0

  const kpis = [
    { label: 'Total Income',   value: formatCurrency(totalIncome),  color: '#5BA68A', bg: '#EBF5F1' },
    { label: 'Total Expenses', value: formatCurrency(totalExpense), color: '#D96B6B', bg: '#FBF0F0' },
    { label: 'Net Balance',    value: formatCurrency(balance),      color: balance >= 0 ? '#5BA68A' : '#D96B6B', bg: balance >= 0 ? '#EBF5F1' : '#FBF0F0' },
    { label: 'Savings Rate',   value: `${savingsRate.toFixed(1)}%`, color: savingsRate >= 20 ? '#5BA68A' : '#D4956A', bg: savingsRate >= 20 ? '#EBF5F1' : '#FBF2EA' },
  ]

  return (
    <AppLayout title="Analytics" subtitle="Detailed financial insights">
      {/* Period selector */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-36">
          <Select options={MONTHS} value={String(month)} onChange={e => setMonth(Number(e.target.value))} />
        </div>
        <div className="w-24">
          <Select options={YEARS} value={String(year)} onChange={e => setYear(Number(e.target.value))} />
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {kpis.map(k => (
          <div key={k.label} className="rounded-2xl px-5 py-4" style={CARD_STYLE}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: k.bg }}>
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: k.color }} />
            </div>
            <p className="text-xs font-medium mb-1" style={{ color: '#9B928B' }}>{k.label}</p>
            <p className="text-xl font-bold" style={{ color: k.color }}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Daily spend chart */}
      <div className="rounded-2xl p-5 mb-4" style={CARD_STYLE}>
        <h3 className="text-sm font-semibold mb-4" style={{ color: '#1A1A1A' }}>
          Daily Transactions — {getMonthName(month)} {year}
        </h3>
        <div className="flex items-center gap-4 text-[11px] mb-4">
          <span className="flex items-center gap-1.5" style={{ color: '#6B6560' }}>
            <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: '#5BA68A' }} /> Income
          </span>
          <span className="flex items-center gap-1.5" style={{ color: '#6B6560' }}>
            <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: '#D96B6B' }} /> Expenses
          </span>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={barData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }} barSize={7} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D5" vertical={false} />
            <XAxis
              dataKey="day"
              tick={{ fill: '#9B928B', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              interval={4}
            />
            <YAxis
              tick={{ fill: '#9B928B', fontSize: 10 }}
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
              contentStyle={tooltipStyle}
              labelStyle={{ color: '#6B6560', fontWeight: 500 }}
            />
            <Bar dataKey="income"  fill="#5BA68A" radius={[4, 4, 0, 0]} fillOpacity={0.85} />
            <Bar dataKey="expense" fill="#D96B6B" radius={[4, 4, 0, 0]} fillOpacity={0.85} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Category pie */}
      <div className="rounded-2xl p-5" style={CARD_STYLE}>
        <h3 className="text-sm font-semibold mb-4" style={{ color: '#1A1A1A' }}>Expenses by Category</h3>
        {pieData.length === 0 ? (
          <p className="text-center text-sm py-8" style={{ color: '#9B928B' }}>No expense data for this period</p>
        ) : (
          <div className="flex items-center gap-8">
            <div className="w-44 h-44 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={76}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} stroke="#FAF8F5" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={(v: any) => formatCurrency(Number(v))}
                    contentStyle={tooltipStyle}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex-1 space-y-3">
              {pieData.map(item => {
                const pct = ((item.value / pieTotal) * 100).toFixed(1)
                return (
                  <div key={item.name} className="flex items-center gap-3">
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ background: item.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium truncate" style={{ color: '#1A1A1A' }}>{item.name}</span>
                        <span className="text-xs font-semibold ml-2" style={{ color: '#1A1A1A' }}>{formatCurrency(item.value)}</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#E8E0D5' }}>
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${pct}%`, background: item.color }}
                        />
                      </div>
                    </div>
                    <span className="text-[11px] w-9 text-right flex-shrink-0" style={{ color: '#9B928B' }}>{pct}%</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
