import { useTranslation } from 'react-i18next'
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  CreditCard,
  Package,
  ShoppingBag,
  Truck,
  UserPlus,
  Wallet,
} from 'lucide-react'
import { cn } from '../../utils/cn'

const config = {
  'sale.completed': { icon: ShoppingBag, tone: 'emerald' },
  'sale.refunded': { icon: CreditCard, tone: 'rose' },
  'stock.low': { icon: AlertTriangle, tone: 'amber' },
  'stock.adjusted': { icon: Package, tone: 'indigo' },
  'purchase.received': { icon: Truck, tone: 'emerald' },
  'purchase.created': { icon: Truck, tone: 'sky' },
  'customer.created': { icon: UserPlus, tone: 'violet' },
  'customer.updated': { icon: UserPlus, tone: 'violet' },
  'customer.deleted': { icon: UserPlus, tone: 'rose' },
  'expense.added': { icon: Wallet, tone: 'orange' },
  'product.created': { icon: Package, tone: 'emerald' },
  'product.updated': { icon: Package, tone: 'indigo' },
  'product.deleted': { icon: Package, tone: 'rose' },
  'category.created': { icon: Package, tone: 'emerald' },
  'category.updated': { icon: Package, tone: 'indigo' },
  'category.deleted': { icon: Package, tone: 'rose' },
  'supplier.created': { icon: Truck, tone: 'emerald' },
  'supplier.updated': { icon: Truck, tone: 'indigo' },
  'supplier.deleted': { icon: Truck, tone: 'rose' },
  'user.created': { icon: UserPlus, tone: 'violet' },
}

const tones = {
  emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
  rose: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
  amber: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
  indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400',
  sky: 'bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400',
  violet: 'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
  orange: 'bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400',
}

export function useActivityContent(activity) {
  const { t } = useTranslation()
  const { icon: Icon, tone } = config[activity.action] || { icon: Activity, tone: 'indigo' }

  let text = t('activity.generic', { defaultValue: '' })
  try {
    text = t(`activity.${activity.action}`, { ...activity.params })
  } catch {
    text = t('activity.generic')
  }

  return { Icon, tone, text }
}

export function ActivityItem({ activity, compact = false, className }) {
  const { i18n } = useTranslation()
  const { Icon, tone, text } = useActivityContent(activity)
  const time = new Intl.RelativeTimeFormat(i18n.language === 'km' ? 'km' : 'en', {
    numeric: 'auto',
  })

  const diffMinutes = Math.round((new Date(activity.createdAt) - Date.now()) / 60000)
  let relative
  if (Math.abs(diffMinutes) < 60) relative = time.format(diffMinutes, 'minute')
  else if (Math.abs(diffMinutes) < 1440) relative = time.format(Math.round(diffMinutes / 60), 'hour')
  else relative = time.format(Math.round(diffMinutes / 1440), 'day')

  return (
    <div className={cn('flex items-start gap-3', className)}>
      <span
        className={cn(
          'flex shrink-0 items-center justify-center rounded-xl',
          compact ? 'h-8 w-8' : 'h-9 w-9',
          tones[tone] || tones.indigo,
        )}
      >
        <Icon className={compact ? 'h-4 w-4' : 'h-4.5 w-4.5'} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
          {text}
        </p>
        <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
          {relative}
        </p>
      </div>
      {!compact && (
        <CheckCircle2 className="mt-1 h-3.5 w-3.5 shrink-0 text-slate-300 dark:text-slate-700" />
      )}
    </div>
  )
}
