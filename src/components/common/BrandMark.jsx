import { Store } from 'lucide-react'

export function BrandMark({ compact = false, light = false }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/30">
        <Store className="h-5 w-5" />
      </span>
      {!compact && (
        <span>
          <span
            className={
              light
                ? 'block text-base font-bold tracking-tight text-white'
                : 'block text-base font-bold tracking-tight text-slate-900 dark:text-white'
            }
          >
            SmartPOS
          </span>
          <span
            className={
              light
                ? 'block text-[10px] font-medium uppercase tracking-[0.16em] text-white/60'
                : 'block text-[10px] font-medium uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500'
            }
          >
            Retail Management Suite
          </span>
        </span>
      )}
    </div>
  )
}
