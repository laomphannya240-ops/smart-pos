import { cn } from '../../utils/cn'

const toneClasses = {
  amber:
    'from-amber-100 to-orange-50 text-amber-600 dark:from-amber-500/20 dark:to-orange-500/10 dark:text-amber-300',
  orange:
    'from-orange-100 to-rose-50 text-orange-600 dark:from-orange-500/20 dark:to-rose-500/10 dark:text-orange-300',
  sky: 'from-sky-100 to-cyan-50 text-sky-600 dark:from-sky-500/20 dark:to-cyan-500/10 dark:text-sky-300',
  rose: 'from-rose-100 to-pink-50 text-rose-600 dark:from-rose-500/20 dark:to-pink-500/10 dark:text-rose-300',
  emerald:
    'from-emerald-100 to-teal-50 text-emerald-600 dark:from-emerald-500/20 dark:to-teal-500/10 dark:text-emerald-300',
  violet:
    'from-violet-100 to-purple-50 text-violet-600 dark:from-violet-500/20 dark:to-purple-500/10 dark:text-violet-300',
  indigo:
    'from-indigo-100 to-blue-50 text-indigo-600 dark:from-indigo-500/20 dark:to-blue-500/10 dark:text-indigo-300',
  teal: 'from-teal-100 to-emerald-50 text-teal-600 dark:from-teal-500/20 dark:to-emerald-500/10 dark:text-teal-300',
  slate:
    'from-slate-100 to-slate-50 text-slate-600 dark:from-slate-700 dark:to-slate-800 dark:text-slate-300',
}

const sizes = {
  xs: 'h-8 w-8 text-base rounded-lg',
  sm: 'h-10 w-10 text-xl rounded-xl',
  md: 'h-12 w-12 text-2xl rounded-xl',
  lg: 'h-16 w-16 text-3xl rounded-2xl',
  xl: 'h-20 w-20 text-4xl rounded-2xl',
}

export function ProductThumb({ product, tone = 'indigo', size = 'md', className }) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center bg-gradient-to-br shadow-inner',
        toneClasses[tone] || toneClasses.indigo,
        sizes[size] || sizes.md,
        className,
      )}
    >
      {product?.image ? (
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full rounded-[inherit] object-cover"
        />
      ) : (
        <span className="select-none leading-none">{product?.emoji || '📦'}</span>
      )}
    </span>
  )
}

export const productToneClasses = toneClasses
