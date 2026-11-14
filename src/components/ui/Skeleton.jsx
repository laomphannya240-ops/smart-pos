import { cn } from '../../utils/cn'

export function Skeleton({ className }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-slate-200/80 dark:bg-slate-800',
        className,
      )}
    />
  )
}

export function StatSkeleton() {
  return (
    <div className="app-card p-5">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-10 w-10 rounded-xl" />
      </div>
      <Skeleton className="mt-4 h-7 w-28" />
      <Skeleton className="mt-3 h-3 w-24" />
    </div>
  )
}

export function ChartSkeleton({ height = 'h-72' }) {
  return (
    <div className={cn('flex w-full items-end gap-2', height)}>
      {[45, 70, 55, 85, 62, 92, 74, 48, 66, 80, 58, 90].map((value, index) => (
        <div
          key={index}
          className="flex-1 animate-pulse rounded-t-md bg-slate-200/70 dark:bg-slate-800"
          style={{ height: `${value}%` }}
        />
      ))}
    </div>
  )
}
