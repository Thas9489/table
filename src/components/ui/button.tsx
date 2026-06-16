'use client'
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-150 ' +
      'disabled:opacity-50 disabled:cursor-not-allowed select-none focus-visible:outline-none ' +
      'focus-visible:ring-2 focus-visible:ring-offset-1'

    const variants = {
      primary:
        'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-sm ' +
        'focus-visible:ring-indigo-500',
      secondary:
        'bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 border border-slate-200 shadow-sm ' +
        'focus-visible:ring-slate-300',
      ghost:
        'text-slate-600 hover:text-slate-900 hover:bg-slate-100 active:bg-slate-200 ' +
        'focus-visible:ring-slate-300',
      danger:
        'bg-red-50 hover:bg-red-100 active:bg-red-200 text-red-600 border border-red-200 ' +
        'focus-visible:ring-red-400',
      outline:
        'border border-slate-300 text-slate-700 hover:bg-slate-50 active:bg-slate-100 ' +
        'focus-visible:ring-slate-300',
    }

    const sizes = {
      sm: 'text-xs h-8 px-3 py-0',
      md: 'text-sm h-9 px-4 py-0',
      lg: 'text-sm h-10 px-5 py-0',
    }

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-3.5 w-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
export { Button }
