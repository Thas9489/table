import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label?: string
  error?: string
  hint?: string
  prefix?: React.ReactNode
  suffix?: React.ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, prefix, suffix, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-medium leading-none" style={{ color: '#1A1A1A' }}>
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {prefix && (
            <div className="absolute left-3.5 pointer-events-none text-sm" style={{ color: '#9B928B' }}>
              {prefix}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full rounded-xl text-sm px-3.5 py-2 h-10',
              'transition-all duration-150',
              'focus:outline-none',
              'disabled:cursor-not-allowed',
              prefix && 'pl-9',
              suffix && 'pr-9',
              className
            )}
            style={{
              backgroundColor: '#FAF8F5',
              border: `1px solid ${error ? '#D96B6B' : '#E8E0D5'}`,
              color: '#1A1A1A',
            }}
            onFocus={e => {
              e.currentTarget.style.borderColor = error ? '#D96B6B' : '#E8B4B8'
              e.currentTarget.style.boxShadow = error
                ? '0 0 0 3px rgba(217,107,107,0.12)'
                : '0 0 0 3px rgba(232,180,184,0.18)'
            }}
            onBlur={e => {
              e.currentTarget.style.borderColor = error ? '#D96B6B' : '#E8E0D5'
              e.currentTarget.style.boxShadow = 'none'
            }}
            {...props}
          />
          {suffix && (
            <div className="absolute right-3.5 pointer-events-none text-sm" style={{ color: '#9B928B' }}>
              {suffix}
            </div>
          )}
        </div>
        {hint && !error && <p className="text-xs" style={{ color: '#9B928B' }}>{hint}</p>}
        {error && <p className="text-xs flex items-center gap-1" style={{ color: '#D96B6B' }}>{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
export { Input }
