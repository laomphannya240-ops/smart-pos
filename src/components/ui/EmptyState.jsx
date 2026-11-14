import { Inbox } from 'lucide-react'
import { cn } from '../../utils/cn'

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
  compact = false,
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center px-6 text-center',
        compact ? 'py-10' : 'py-16',
        className,
      )}
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
        <Icon className="h-6 w-6" />
      </span>
      <h3 className="mt-4 text-sm font-semibold text-slate-800 dark:text-slate-100">
        {title}
      </h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-slate-400 dark:text-slate-500">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
