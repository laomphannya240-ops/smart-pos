import { cn } from '../../utils/cn'

export function Card({ className, hover = false, children, ...props }) {
  return (
    <div
      className={cn(
        'app-card',
        hover &&
          'transition duration-300 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-[0_12px_36px_-16px_rgb(79_70_229_/_0.3)] dark:hover:border-indigo-500/30',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ title, subtitle, action, icon: Icon, className }) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-4 py-3.5 dark:border-slate-800 sm:px-5 sm:py-4',
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        {Icon && (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
            <Icon className="h-4.5 w-4.5" />
          </span>
        )}
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-slate-900 dark:text-white">
            {title}
          </h3>
          {subtitle && (
            <p className="mt-0.5 line-clamp-2 text-xs text-slate-400 dark:text-slate-500">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {action}
    </div>
  )
}

export function CardBody({ className, children }) {
  return <div className={cn('p-4 sm:p-5', className)}>{children}</div>
}
