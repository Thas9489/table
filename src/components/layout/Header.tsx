'use client'
import { Bell, Search, User } from 'lucide-react'

interface HeaderProps {
  title: string
  subtitle?: string
}

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="flex items-center justify-between h-14 px-6 border-b border-slate-200 flex-shrink-0" style={{ backgroundColor: '#ffffff', color: '#0f172a' }}>
      <div>
        <h1 className="text-base font-semibold text-slate-900 leading-none">{title}</h1>
        {subtitle && (
          <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button
          className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all"
          aria-label="Search"
        >
          <Search size={15} />
        </button>
        <button
          className="relative w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all"
          aria-label="Notifications"
        >
          <Bell size={15} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-indigo-600 rounded-full" />
        </button>
        <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
          <User size={15} className="text-indigo-600" />
        </div>
      </div>
    </header>
  )
}
