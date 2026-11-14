import { cn } from '../../utils/cn'

export function PageHeader({ title, description, actions, badge, className }) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between',
        className,
      )}
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="kp-title text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
            {title}
          </h1>
          {badge}
        </div>
        {description && (
          <p className="kp-subtitle mt-1 max-w-2xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end [&>a]:w-full [&>button]:w-full [&>div]:w-full [&_button]:w-full sm:[&>a]:w-auto sm:[&>button]:w-auto sm:[&>div]:w-auto sm:[&_button]:w-auto">
          {actions}
        </div>
      )}
    </div>
  )
}
