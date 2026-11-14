import { cn } from '../../utils/cn'

export function Tabs({ items = [], value, onChange, variant = 'segmented', className }) {
  if (variant === 'underline') {
    return (
      <div
        className={cn(
          'flex gap-1 overflow-x-auto border-b border-slate-200 dark:border-slate-800',
          className,
        )}
      >
        {items.map((item) => {
          const Icon = item.icon
          const active = item.key === value
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onChange(item.key)}
              className={cn(
                'relative flex shrink-0 items-center gap-2 px-3.5 py-2.5 text-sm font-medium transition',
                active
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200',
              )}
            >
              {Icon && <Icon className="h-4 w-4" />}
              {item.label}
              {item.count !== undefined && (
                <span
                  className={cn(
                    'rounded-full px-1.5 py-0.5 text-[10px] font-semibold',
                    active
                      ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300'
                      : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
                  )}
                >
                  {item.count}
                </span>
              )}
              {active && (
                <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
              )}
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1 dark:bg-slate-800/70',
        className,
      )}
    >
      {items.map((item) => {
        const Icon = item.icon
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onChange(item.key)}
            className={cn(
              'flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all',
              item.key === value
                ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200',
            )}
          >
            {Icon && <Icon className="h-3.5 w-3.5" />}
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
