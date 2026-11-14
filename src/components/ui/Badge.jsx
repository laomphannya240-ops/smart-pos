import { cn } from '../../utils/cn'

const tones = {
  slate: 'bg-slate-100 text-slate-600 ring-slate-500/10 dark:bg-slate-800 dark:text-slate-300',
  indigo:
    'bg-indigo-50 text-indigo-700 ring-indigo-500/10 dark:bg-indigo-500/10 dark:text-indigo-300',
  emerald:
    'bg-emerald-50 text-emerald-700 ring-emerald-500/10 dark:bg-emerald-500/10 dark:text-emerald-300',
  amber:
    'bg-amber-50 text-amber-700 ring-amber-500/10 dark:bg-amber-500/10 dark:text-amber-300',
  rose: 'bg-rose-50 text-rose-700 ring-rose-500/10 dark:bg-rose-500/10 dark:text-rose-300',
  violet:
    'bg-violet-50 text-violet-700 ring-violet-500/10 dark:bg-violet-500/10 dark:text-violet-300',
  sky: 'bg-sky-50 text-sky-700 ring-sky-500/10 dark:bg-sky-500/10 dark:text-sky-300',
  blue: 'bg-blue-50 text-blue-700 ring-blue-500/10 dark:bg-blue-500/10 dark:text-blue-300',
  orange:
    'bg-orange-50 text-orange-700 ring-orange-500/10 dark:bg-orange-500/10 dark:text-orange-300',
  teal: 'bg-teal-50 text-teal-700 ring-teal-500/10 dark:bg-teal-500/10 dark:text-teal-300',
}

const dotTones = {
  slate: 'bg-slate-400',
  indigo: 'bg-indigo-500',
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  rose: 'bg-rose-500',
  violet: 'bg-violet-500',
  sky: 'bg-sky-500',
  blue: 'bg-blue-500',
  orange: 'bg-orange-500',
  teal: 'bg-teal-500',
}

export const badgeTones = tones

export function Badge({ tone = 'slate', dot = false, className, children }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset',
        tones[tone] || tones.slate,
        className,
      )}
    >
      {dot && <span className={cn('h-1.5 w-1.5 rounded-full', dotTones[tone])} />}
      {children}
    </span>
  )
}

const statusTone = {
  active: 'emerald',
  completed: 'emerald',
  received: 'emerald',
  in: 'emerald',
  inactive: 'slate',
  draft: 'slate',
  pending: 'amber',
  ordered: 'sky',
  low: 'amber',
  out: 'rose',
  cancelled: 'rose',
  refunded: 'rose',
  out_of_stock: 'rose',
}

export function StatusBadge({ status, children, className }) {
  return (
    <Badge tone={statusTone[status] || 'slate'} dot className={className}>
      {children}
    </Badge>
  )
}
