'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  ArrowLeftRight,
  PiggyBank,
  Tag,
  TrendingUp,
  Wallet,
} from 'lucide-react'

const nav = [
  { href: '/',             label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { href: '/budgets',      label: 'Budgets',      icon: PiggyBank },
  { href: '/categories',   label: 'Categories',   icon: Tag },
  { href: '/analytics',    label: 'Analytics',    icon: TrendingUp },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-60 flex-shrink-0 flex flex-col h-full border-r border-slate-200" style={{ backgroundColor: '#ffffff', color: '#0f172a' }}>
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center shadow-sm">
            <Wallet size={15} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 leading-none">BudgetAI</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Smart Finance</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <p className="px-3 mb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
          Main Menu
        </p>
        <div className="space-y-0.5">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                  active
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                )}
              >
                <Icon
                  size={17}
                  className={active ? 'text-indigo-600' : 'text-slate-400'}
                />
                {label}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Bottom tip */}
      <div className="px-3 pb-4">
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-5 h-5 rounded-lg bg-indigo-100 flex items-center justify-center">
              <TrendingUp size={11} className="text-indigo-600" />
            </div>
            <p className="text-xs font-semibold text-slate-700">Pro Tip</p>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Set budget alerts to stay on track with your financial goals.
          </p>
        </div>
      </div>
    </aside>
  )
}
