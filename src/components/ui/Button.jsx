import { forwardRef } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '../../utils/cn'

const base =
  'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus-visible:ring-offset-2 ring-offset-white dark:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-50'

const variants = {
  primary:
    'bg-indigo-600 text-white shadow-sm shadow-indigo-600/25 hover:bg-indigo-700 hover:shadow-md hover:shadow-indigo-600/25 active:scale-[0.98]',
  secondary:
    'bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-[0.98] dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700',
  outline:
    'border border-slate-200 bg-white text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800',
  ghost:
    'text-slate-600 hover:bg-slate-100 active:scale-[0.98] dark:text-slate-300 dark:hover:bg-slate-800',
  soft: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 active:scale-[0.98] dark:bg-indigo-500/10 dark:text-indigo-300 dark:hover:bg-indigo-500/20',
  danger:
    'bg-rose-600 text-white shadow-sm shadow-rose-600/25 hover:bg-rose-700 active:scale-[0.98]',
  success:
    'bg-emerald-600 text-white shadow-sm shadow-emerald-600/25 hover:bg-emerald-700 active:scale-[0.98]',
  violet:
    'bg-violet-600 text-white shadow-sm shadow-violet-600/25 hover:bg-violet-700 active:scale-[0.98]',
  dark: 'bg-slate-900 text-white hover:bg-slate-800 active:scale-[0.98] dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100',
}

const sizes = {
  xs: 'h-8 px-2.5 text-xs',
  sm: 'h-9 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-5 text-sm',
  xl: 'h-12 px-6 text-base',
  icon: 'h-10 w-10',
  'icon-sm': 'h-8 w-8',
  'icon-lg': 'h-11 w-11',
}

export function buttonStyles({ variant = 'primary', size = 'md', className } = {}) {
  return cn(base, variants[variant] || variants.primary, sizes[size] || sizes.md, className)
}

export const Button = forwardRef(function Button(
  {
    variant = 'primary',
    size = 'md',
    className,
    children,
    loading = false,
    disabled = false,
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    type = 'button',
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={buttonStyles({ variant, size, className })}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        LeftIcon && <LeftIcon className="h-4 w-4 shrink-0" />
      )}
      {children}
      {RightIcon && !loading && <RightIcon className="h-4 w-4 shrink-0" />}
    </button>
  )
})
