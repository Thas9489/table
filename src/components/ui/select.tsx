'use client'
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
  placeholder?: string
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, placeholder, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-medium leading-none" style={{ color: '#1A1A1A' }}>
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={cn(
              'w-full appearance-none rounded-xl text-sm px-3.5 py-2 h-10 pr-9',
              'transition-all duration-150',
              'focus:outline-none',
              'disabled:cursor-not-allowed',
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
          >
            {placeholder && (
              <option value="">{placeholder}</option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: '#9B928B' }}
          />
        </div>
        {error && <p className="text-xs" style={{ color: '#D96B6B' }}>{error}</p>}
      </div>
    )
  }
)

Select.displayName = 'Select'
export { Select }
