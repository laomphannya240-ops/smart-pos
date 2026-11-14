import { useCurrency } from '../../hooks/useCurrency'
import { formatNumber } from '../../utils/format'

const countKeys = ['orders', 'items', 'qty', 'count', 'units']

export function ChartTooltip({ active, payload, label }) {
  const money = useCurrency()

  if (!active || !payload?.length) return null

  return (
    <div className="min-w-[150px] rounded-xl border border-slate-200/80 bg-white/95 px-3 py-2.5 shadow-xl shadow-slate-900/10 backdrop-blur dark:border-slate-700 dark:bg-slate-900/95">
      {label && (
        <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          {label}
        </p>
      )}
      <div className="space-y-1">
        {payload.map((entry) => {
          const isCount = countKeys.includes(entry.dataKey)
          return (
            <div
              key={`${entry.dataKey}-${entry.name}`}
              className="flex items-center justify-between gap-4 text-xs"
            >
              <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: entry.color || entry.fill }}
                />
                {entry.name}
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {isCount ? formatNumber(entry.value) : money(entry.value)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
