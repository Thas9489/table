import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  color?: string
  className?: string
}

export function Badge({ children, color, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md',
        !color && 'bg-slate-100 text-slate-600',
        className
      )}
      style={
        color
          ? {
              background: `${color}18`,
              color: color,
              border: `1px solid ${color}28`,
            }
          : undefined
      }
    >
      {children}
    </span>
  )
}
