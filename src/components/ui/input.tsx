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
          <label className="text-sm font-medium text-slate-700 leading-none">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {prefix && (
            <div className="absolute left-3.5 text-slate-400 pointer-events-none text-sm">
              {prefix}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full bg-white border border-slate-300 rounded-lg text-sm text-slate-900',
              'px-3.5 py-2 h-10',
              'placeholder:text-slate-400',
              'focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100',
              'transition-all duration-150',
              'disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed',
              prefix && 'pl-9',
              suffix && 'pr-9',
              error && 'border-red-400 focus:border-red-500 focus:ring-red-100',
              className
            )}
            {...props}
          />
          {suffix && (
            <div className="absolute right-3.5 text-slate-400 pointer-events-none text-sm">
              {suffix}
            </div>
          )}
        </div>
        {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
        {error && <p className="text-xs text-red-500 flex items-center gap-1">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
export { Input }
