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
  background: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '10px',
  color: '#0f172a',
  fontSize: '12px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
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
        color: t.categories?.color ?? '#6366f1',
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
    { label: 'Total Income',    value: formatCurrency(totalIncome),  color: '#059669', bg: '#ecfdf5' },
    { label: 'Total Expenses',  value: formatCurrency(totalExpense), color: '#dc2626', bg: '#fef2f2' },
    { label: 'Net Balance',     value: formatCurrency(balance),      color: balance >= 0 ? '#059669' : '#dc2626', bg: balance >= 0 ? '#ecfdf5' : '#fef2f2' },
    { label: 'Savings Rate',    value: `${savingsRate.toFixed(1)}%`, color: savingsRate >= 20 ? '#059669' : '#d97706', bg: savingsRate >= 20 ? '#ecfdf5' : '#fffbeb' },
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
          <div key={k.label} className="bg-white border border-slate-200 rounded-xl px-5 py-4 shadow-sm">
            <p className="text-xs text-slate-500 font-medium mb-2">{k.label}</p>
            <p className="text-xl font-bold" style={{ color: k.color }}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Daily spend chart */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm mb-4">
        <h3 className="text-sm font-semibold text-slate-800 mb-4">
          Daily Transactions — {getMonthName(month)} {year}
        </h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={barData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }} barSize={7} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="day"
              tick={{ fill: '#94a3b8', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              interval={4}
            />
            <YAxis
              tick={{ fill: '#94a3b8', fontSize: 10 }}
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
              labelStyle={{ color: '#64748b', fontWeight: 500 }}
            />
            <Bar dataKey="income"  fill="#059669" radius={[3, 3, 0, 0]} fillOpacity={0.85} />
            <Bar dataKey="expense" fill="#dc2626" radius={[3, 3, 0, 0]} fillOpacity={0.85} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Category pie */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-800 mb-4">Expenses by Category</h3>
        {pieData.length === 0 ? (
          <p className="text-center text-slate-400 text-sm py-8">No expense data for this period</p>
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
                      <Cell key={i} fill={entry.color} stroke="white" strokeWidth={2} />
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
                        <span className="text-xs font-medium text-slate-700 truncate">{item.name}</span>
                        <span className="text-xs font-semibold text-slate-800 ml-2">{formatCurrency(item.value)}</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${pct}%`, background: item.color }}
                        />
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-400 w-9 text-right flex-shrink-0">{pct}%</span>
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
