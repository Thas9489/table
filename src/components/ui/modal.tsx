'use client'
import { useEffect } from 'react'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function Modal({ open, onClose, title, children, className, size = 'md' }: ModalProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (open) {
      document.addEventListener('keydown', handleKey)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 backdrop-blur-[2px]"
        style={{ backgroundColor: 'rgba(26,26,26,0.4)' }}
        onClick={onClose}
      />
      <div
        className={cn(
          'relative w-full rounded-2xl shadow-xl animate-scale-in flex flex-col',
          sizes[size],
          className
        )}
        style={{
          backgroundColor: '#FAF8F5',
          border: '1px solid #E8E0D5',
          boxShadow: '0 24px 64px rgba(26,26,26,0.14), 0 4px 16px rgba(26,26,26,0.06)',
          maxHeight: 'calc(100vh - 48px)',
        }}
      >
        {title && (
          <div
            className="flex items-center justify-between px-6 py-[18px] flex-shrink-0"
            style={{ borderBottom: '1px solid #F0EAE2' }}
          >
            <h2 className="text-[15px] font-semibold" style={{ color: '#1A1A1A' }}>{title}</h2>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
              style={{ color: '#9B928B' }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.backgroundColor = '#F0EAE2'
                ;(e.currentTarget as HTMLElement).style.color = '#1A1A1A'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'
                ;(e.currentTarget as HTMLElement).style.color = '#9B928B'
              }}
              aria-label="Close"
            >
              <X size={15} />
            </button>
          </div>
        )}
        <div className="p-6 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  )
}
