'use client'
import { useState, useRef, useEffect } from 'react'
import { Bell, Search, LogOut, ChevronDown } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

interface HeaderProps {
  title: string
  subtitle?: string
}

export function Header({ title, subtitle }: HeaderProps) {
  const { user, signOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Avatar initials from email
  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : '?'

  const emailDisplay = user?.email ?? ''

  return (
    <header
      className="flex items-center justify-between flex-shrink-0 px-6 h-[60px]"
      style={{
        backgroundColor: '#FAF8F5',
        borderBottom: '1px solid #E8E0D5',
        color: '#1A1A1A',
      }}
    >
      {/* Left: Title + Subtitle */}
      <div>
        <h1
          className="leading-none"
          style={{ fontWeight: 600, fontSize: '16px', color: '#1A1A1A' }}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="mt-0.5" style={{ fontSize: '12px', color: '#9B928B' }}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <button
          className="flex items-center justify-center transition-colors duration-150"
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '10px',
            backgroundColor: '#F0EAE2',
            border: '1px solid #E8E0D5',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#E8E0D5' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#F0EAE2' }}
          aria-label="Search"
        >
          <Search size={15} style={{ color: '#6B6560' }} />
        </button>

        {/* Bell */}
        <button
          className="relative flex items-center justify-center transition-colors duration-150"
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '10px',
            backgroundColor: '#F0EAE2',
            border: '1px solid #E8E0D5',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#E8E0D5' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#F0EAE2' }}
          aria-label="Notifications"
        >
          <Bell size={15} style={{ color: '#6B6560' }} />
          <span
            className="absolute"
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: '#E8B4B8',
              top: '7px',
              right: '7px',
            }}
          />
        </button>

        {/* User avatar + dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="flex items-center gap-1.5 transition-all duration-150"
            style={{
              height: '32px',
              paddingLeft: '8px',
              paddingRight: '6px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #F7E8E9, #F0E0E1)',
              border: '1px solid #E8D0D2',
              cursor: 'pointer',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'linear-gradient(135deg, #F0DFE0, #E8D4D6)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'linear-gradient(135deg, #F7E8E9, #F0E0E1)' }}
            aria-label="User menu"
          >
            <span
              className="flex items-center justify-center"
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '6px',
                backgroundColor: '#C4787C',
                fontSize: '9px',
                fontWeight: 700,
                color: '#FAF8F5',
                letterSpacing: '0.02em',
                flexShrink: 0,
              }}
            >
              {initials}
            </span>
            <ChevronDown
              size={12}
              style={{
                color: '#C4787C',
                transform: menuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.15s',
              }}
            />
          </button>

          {/* Dropdown */}
          {menuOpen && (
            <div
              className="absolute right-0"
              style={{
                top: 'calc(100% + 8px)',
                minWidth: '220px',
                backgroundColor: '#FAF8F5',
                border: '1px solid #E8E0D5',
                borderRadius: '14px',
                boxShadow: '0 8px 24px rgba(26,26,26,0.12)',
                overflow: 'hidden',
                zIndex: 50,
              }}
            >
              {/* User info */}
              <div style={{ padding: '14px 16px 12px', borderBottom: '1px solid #F0EAE2' }}>
                <div
                  className="flex items-center justify-center mx-auto"
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #F7E8E9, #F0E0E1)',
                    marginBottom: '8px',
                  }}
                >
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#C4787C' }}>
                    {initials}
                  </span>
                </div>
                <p style={{ fontSize: '11px', color: '#9B928B', textAlign: 'center', wordBreak: 'break-all' }}>
                  {emailDisplay}
                </p>
              </div>

              {/* Sign out */}
              <button
                onClick={() => { setMenuOpen(false); signOut() }}
                className="flex items-center w-full transition-colors duration-150"
                style={{
                  gap: '10px',
                  padding: '11px 16px',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: '#D96B6B',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#FBF0F0' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}
              >
                <LogOut size={14} style={{ flexShrink: 0 }} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
