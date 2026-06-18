import { cn } from '@/lib/utils'

interface BadgeProps {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'default'
  children: React.ReactNode
  className?: string
}

const variantStyles = {
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  danger: 'bg-red-50 text-red-700 border-red-200',
  info: 'bg-blue-50 text-blue-700 border-blue-200',
  default: 'bg-gray-50 text-gray-700 border-gray-200',
}

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  )
}

export function ScoreBadge({ score, max = 100 }: { score: number; max?: number }) {
  const pct = (score / max) * 100
  const variant = pct >= 90 ? 'success' : pct >= 75 ? 'warning' : 'danger'
  return <Badge variant={variant}>{score}/{max}</Badge>
}

export function GradeBadge({ grade }: { grade: string }) {
  const variant = grade === 'A' ? 'success' : grade === 'B' ? 'info' : grade === 'C' ? 'warning' : 'danger'
  return <Badge variant={variant}>{grade}级</Badge>
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { variant: 'success' | 'warning' | 'danger' | 'info' | 'default'; label: string }> = {
    planned: { variant: 'info', label: '已计划' },
    in_progress: { variant: 'warning', label: '进行中' },
    completed: { variant: 'success', label: '已完成' },
    cancelled: { variant: 'default', label: '已取消' },
    pending: { variant: 'danger', label: '待整改' },
    rectifying: { variant: 'warning', label: '整改中' },
    planned_rect: { variant: 'info', label: '已计划' },
  }
  const config = map[status] || { variant: 'default' as const, label: status }
  return <Badge variant={config.variant}>{config.label}</Badge>
}
