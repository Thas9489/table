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
  Sparkles,
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
    <aside
      className="w-60 flex-shrink-0 flex flex-col h-full"
      style={{ backgroundColor: '#FAF8F5', borderRight: '1px solid #E8E0D5', color: '#1A1A1A' }}
    >
      {/* Logo */}
      <div className="px-5 py-5" style={{ borderBottom: '1px solid #E8E0D5' }}>
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-2xl flex items-center justify-center shadow-sm"
            style={{ background: 'linear-gradient(135deg, #E8B4B8 0%, #D9A0A4 100%)' }}
          >
            <Sparkles size={16} style={{ color: '#FAF8F5' }} />
          </div>
          <div>
            <p className="text-sm font-bold leading-none" style={{ color: '#1A1A1A' }}>BudgetAI</p>
            <p className="text-[11px] mt-0.5" style={{ color: '#9B928B' }}>Smart Finance</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <p
          className="px-3 mb-2.5 text-[10px] font-semibold uppercase tracking-widest"
          style={{ color: '#9B928B' }}
        >
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
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150'
                )}
                style={
                  active
                    ? { backgroundColor: '#F7E8E9', color: '#8B4A4E' }
                    : { color: '#6B6560' }
                }
                onMouseEnter={e => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.backgroundColor = '#F0EAE2'
                    ;(e.currentTarget as HTMLElement).style.color = '#1A1A1A'
                  }
                }}
                onMouseLeave={e => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'
                    ;(e.currentTarget as HTMLElement).style.color = '#6B6560'
                  }
                }}
              >
                <Icon
                  size={17}
                  style={{ color: active ? '#C4787C' : '#9B928B' }}
                />
                {label}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Bottom tip */}
      <div className="px-3 pb-4">
        <div
          className="rounded-2xl p-4"
          style={{ backgroundColor: '#F5F0E8', border: '1px solid #E8E0D5' }}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <div
              className="w-5 h-5 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: '#F7E8E9' }}
            >
              <TrendingUp size={11} style={{ color: '#C4787C' }} />
            </div>
            <p className="text-xs font-semibold" style={{ color: '#1A1A1A' }}>Pro Tip</p>
          </div>
          <p className="text-[11px] leading-relaxed" style={{ color: '#6B6560' }}>
            Set budget alerts to stay on track with your financial goals.
          </p>
        </div>
      </div>
    </aside>
  )
}
