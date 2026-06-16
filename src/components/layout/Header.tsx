'use client'
import { Bell, Search, User } from 'lucide-react'

interface HeaderProps {
  title: string
  subtitle?: string
}

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <header
      className="flex items-center justify-between h-14 px-6 flex-shrink-0"
      style={{
        backgroundColor: '#FAF8F5',
        borderBottom: '1px solid #E8E0D5',
        color: '#1A1A1A',
      }}
    >
      <div>
        <h1 className="text-base font-semibold leading-none" style={{ color: '#1A1A1A' }}>{title}</h1>
        {subtitle && (
          <p className="text-xs mt-0.5" style={{ color: '#9B928B' }}>{subtitle}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button
          className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
          style={{ backgroundColor: '#F5F0E8', border: '1px solid #E8E0D5', color: '#9B928B' }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.color = '#1A1A1A'
            ;(e.currentTarget as HTMLElement).style.backgroundColor = '#EDE7DF'
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.color = '#9B928B'
            ;(e.currentTarget as HTMLElement).style.backgroundColor = '#F5F0E8'
          }}
          aria-label="Search"
        >
          <Search size={14} />
        </button>
        <button
          className="relative w-8 h-8 rounded-xl flex items-center justify-center transition-all"
          style={{ backgroundColor: '#F5F0E8', border: '1px solid #E8E0D5', color: '#9B928B' }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.color = '#1A1A1A'
            ;(e.currentTarget as HTMLElement).style.backgroundColor = '#EDE7DF'
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.color = '#9B928B'
            ;(e.currentTarget as HTMLElement).style.backgroundColor = '#F5F0E8'
          }}
          aria-label="Notifications"
        >
          <Bell size={14} />
          <span
            className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: '#E8B4B8' }}
          />
        </button>
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: '#F7E8E9' }}
        >
          <User size={14} style={{ color: '#C4787C' }} />
        </div>
      </div>
    </header>
  )
}
