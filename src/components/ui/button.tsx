'use client'
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, style, ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-150 ' +
      'disabled:opacity-50 disabled:cursor-not-allowed select-none focus-visible:outline-none ' +
      'focus-visible:ring-2 focus-visible:ring-offset-1'

    // Variant styles using inline style for custom palette colors
    const variantStyles: Record<string, React.CSSProperties> = {
      primary: {
        backgroundColor: '#E8B4B8',
        color: '#1A1A1A',
        boxShadow: '0 1px 2px rgba(232,180,184,0.3)',
      },
      secondary: {
        backgroundColor: '#FAF8F5',
        color: '#1A1A1A',
        border: '1px solid #E8E0D5',
        boxShadow: '0 1px 2px rgba(26,26,26,0.04)',
      },
      ghost: {
        backgroundColor: 'transparent',
        color: '#6B6560',
      },
      danger: {
        backgroundColor: '#FBF0F0',
        color: '#D96B6B',
        border: '1px solid #F5CECE',
      },
      outline: {
        backgroundColor: 'transparent',
        color: '#6B6560',
        border: '1px solid #E8E0D5',
      },
    }

    const variantClasses: Record<string, string> = {
      primary:   'hover:opacity-90 active:opacity-80 focus-visible:ring-[#E8B4B8]',
      secondary: 'hover:bg-[#F0EAE2] active:bg-[#EDE7DF] focus-visible:ring-[#E8E0D5]',
      ghost:     'hover:bg-[#F0EAE2] hover:text-[#1A1A1A] active:bg-[#E8E0D5] focus-visible:ring-[#E8E0D5]',
      danger:    'hover:bg-[#F5DADA] active:bg-[#F0CECE] focus-visible:ring-[#D96B6B]',
      outline:   'hover:bg-[#F0EAE2] active:bg-[#E8E0D5] focus-visible:ring-[#E8E0D5]',
    }

    const sizes = {
      sm: 'text-xs h-8 px-3.5 py-0',
      md: 'text-sm h-9 px-4 py-0',
      lg: 'text-sm h-10 px-5 py-0',
    }

    return (
      <button
        ref={ref}
        className={cn(base, variantClasses[variant], sizes[size], className)}
        style={{ ...variantStyles[variant], ...style }}
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
