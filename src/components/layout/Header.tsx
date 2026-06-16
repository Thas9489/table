'use client'
import { Bell, Search, User } from 'lucide-react'

interface HeaderProps {
  title: string
  subtitle?: string
}

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <header
      className="flex items-center justify-between flex-shrink-0 px-6 py-0 h-[60px]"
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
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.backgroundColor = '#E8E0D5'
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.backgroundColor = '#F0EAE2'
          }}
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
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.backgroundColor = '#E8E0D5'
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.backgroundColor = '#F0EAE2'
          }}
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

        {/* Avatar */}
        <div
          className="flex items-center justify-center"
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #F7E8E9, #F0E0E1)',
          }}
        >
          <User size={14} style={{ color: '#C4787C' }} />
        </div>
      </div>
    </header>
  )
}
