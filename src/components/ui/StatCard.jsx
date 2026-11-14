import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { cn } from '../../utils/cn'
import { Skeleton } from './Skeleton'

const tones = {
  indigo: {
    tile: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300',
    glow: 'from-indigo-500/[0.06]',
  },
  violet: {
    tile: 'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300',
    glow: 'from-violet-500/[0.06]',
  },
  emerald: {
    tile: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300',
    glow: 'from-emerald-500/[0.06]',
  },
  orange: {
    tile: 'bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-300',
    glow: 'from-orange-500/[0.06]',
  },
  amber: {
    tile: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300',
    glow: 'from-amber-500/[0.06]',
  },
  rose: {
    tile: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300',
    glow: 'from-rose-500/[0.06]',
  },
  sky: {
    tile: 'bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300',
    glow: 'from-sky-500/[0.06]',
  },
}

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = 'indigo',
  delta,
  hint,
  loading = false,
  onClick,
}) {
  const colors = tones[tone] || tones.indigo
  const positive = Number(delta) >= 0

  if (loading) {
    return (
      <div className="app-card p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-9 w-9 rounded-xl sm:h-10 sm:w-10" />
        </div>
        <Skeleton className="mt-4 h-6 w-24 sm:h-7 sm:w-28" />
        <Skeleton className="mt-3 h-3 w-24" />
      </div>
    )
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        'app-card group relative overflow-hidden p-4 transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_40px_-20px_rgb(79_70_229_/_0.35)] sm:p-5',
        onClick && 'cursor-pointer',
      )}
    >
      <div
        className={cn(
          'pointer-events-none absolute -right-10 -top-14 h-36 w-36 rounded-full bg-gradient-to-br to-transparent blur-2xl transition-opacity group-hover:opacity-80',
          colors.glow,
        )}
      />
      <div className="relative flex items-start justify-between gap-3">
        <p className="kp-subtitle text-[11px] font-medium leading-snug text-slate-500 dark:text-slate-400 sm:text-xs">
          {label}
        </p>
        {Icon && (
          <span
            className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105 sm:h-10 sm:w-10',
              colors.tile,
            )}
          >
            <Icon className="h-5 w-5" />
          </span>
        )}
      </div>
      <p className="relative mt-2 break-words text-lg font-bold tracking-tight text-slate-900 dark:text-white sm:mt-3 sm:text-2xl">
        {value}
      </p>
      <div className="relative mt-2 flex flex-wrap items-center gap-1.5">
        {delta !== undefined && delta !== null && (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-semibold',
              positive
                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
            )}
          >
            {positive ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : (
              <ArrowDownRight className="h-3 w-3" />
            )}
            {Math.abs(Number(delta)).toFixed(1)}%
          </span>
        )}
        {hint && (
          <span className="kp-subtitle text-[11px] text-slate-400 dark:text-slate-500">
            {hint}
          </span>
        )}
      </div>
    </div>
  )
}
