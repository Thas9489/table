'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  ArrowLeftRight,
  PiggyBank,
  Tag,
  TrendingUp,
  Sparkles,
  Crown,
} from 'lucide-react'

const nav = [
  { href: '/',             label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { href: '/budgets',      label: 'Budgets',      icon: PiggyBank },
  { href: '/categories',   label: 'Categories',   icon: Tag },
  { href: '/analytics',    label: 'Analytics',    icon: TrendingUp },
]

const navBottom = [
  { href: '/subscription', label: 'Subscription', icon: Crown },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside
      className="w-[220px] flex-shrink-0 flex flex-col h-full"
      style={{ backgroundColor: '#FAF8F5', borderRight: '1px solid #E8E0D5' }}
    >
      {/* Logo */}
      <div className="px-5 py-[18px]" style={{ borderBottom: '1px solid #E8E0D5' }}>
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center flex-shrink-0"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #E8B4B8 0%, #C4787C 100%)',
            }}
          >
            <Sparkles size={16} style={{ color: '#FAF8F5' }} />
          </div>
          <div>
            <p
              className="leading-none"
              style={{ fontWeight: 600, fontSize: '15px', color: '#1A1A1A' }}
            >
              BudgetAI
            </p>
            <p className="mt-0.5" style={{ fontSize: '11px', color: '#9B928B' }}>
              Smart Finance
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 pt-6 pb-4 overflow-y-auto">
        <p
          className="px-3 mb-3"
          style={{
            fontSize: '10px',
            fontWeight: 600,
            letterSpacing: '0.08em',
            color: '#9B928B',
            textTransform: 'uppercase',
          }}
        >
          MENU
        </p>
        <div className="space-y-0.5">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 rounded-xl transition-all duration-150"
                style={{
                  fontSize: '13.5px',
                  fontWeight: 500,
                  paddingTop: '9px',
                  paddingBottom: '9px',
                  paddingRight: '12px',
                  paddingLeft: 'calc(12px - 3px)',
                  borderLeft: active ? '3px solid #C4787C' : '3px solid transparent',
                  backgroundColor: active ? '#F7E8E9' : 'transparent',
                  color: active ? '#8B4A4E' : '#6B6560',
                }}
                onMouseEnter={e => {
                  if (!active) {
                    const el = e.currentTarget as HTMLElement
                    el.style.backgroundColor = '#F0EAE2'
                    el.style.color = '#1A1A1A'
                    const icon = el.querySelector('[data-nav-icon]') as HTMLElement | null
                    if (icon) icon.style.color = '#6B6560'
                  }
                }}
                onMouseLeave={e => {
                  if (!active) {
                    const el = e.currentTarget as HTMLElement
                    el.style.backgroundColor = 'transparent'
                    el.style.color = '#6B6560'
                    const icon = el.querySelector('[data-nav-icon]') as HTMLElement | null
                    if (icon) icon.style.color = '#9B928B'
                  }
                }}
              >
                <Icon
                  data-nav-icon=""
                  size={16}
                  style={{ color: active ? '#C4787C' : '#9B928B', flexShrink: 0 }}
                />
                {label}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Subscription nav */}
      <div className="px-3 pb-2">
        <p className="px-3 mb-2"
          style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em', color: '#9B928B', textTransform: 'uppercase' }}>
          ACCOUNT
        </p>
        <div className="space-y-0.5">
          {navBottom.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link key={href} href={href}
                className="flex items-center gap-3 rounded-xl transition-all duration-150"
                style={{
                  fontSize: '13.5px', fontWeight: 500,
                  paddingTop: '9px', paddingBottom: '9px', paddingRight: '12px',
                  paddingLeft: 'calc(12px - 3px)',
                  borderLeft: active ? '3px solid #C4787C' : '3px solid transparent',
                  backgroundColor: active ? '#F7E8E9' : 'transparent',
                  color: active ? '#8B4A4E' : '#6B6560',
                }}
                onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.backgroundColor = '#F0EAE2'; (e.currentTarget as HTMLElement).style.color = '#1A1A1A' } }}
                onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#6B6560' } }}
              >
                <Icon size={16} style={{ color: active ? '#C4787C' : '#9B928B', flexShrink: 0 }} />
                {label}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Premium upsell tip */}
      <div className="px-3 pb-4">
        <div style={{ backgroundColor: '#F5F0E8', border: '1px solid #E8E0D5', borderRadius: '14px', padding: '16px' }}>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={13} style={{ color: '#C4787C', flexShrink: 0 }} />
            <p style={{ fontSize: '12px', fontWeight: 600, color: '#1A1A1A' }}>Go Premium</p>
          </div>
          <p style={{ fontSize: '11px', color: '#6B6560', lineHeight: '1.6' }}>
            Unlimited budgets, AI insights &amp; more from 2.990 KWD/month.
          </p>
          <Link href="/subscription"
            className="flex items-center gap-1 mt-2"
            style={{ fontSize: '11px', fontWeight: 600, color: '#C4787C', textDecoration: 'none' }}>
            Upgrade now <Crown size={10} />
          </Link>
        </div>
      </div>
    </aside>
  )
}
