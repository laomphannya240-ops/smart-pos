import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '../../utils/cn'

const sizes = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-lg',
  lg: 'sm:max-w-2xl',
  xl: 'sm:max-w-4xl',
  '2xl': 'sm:max-w-6xl',
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  closeOnBackdrop = true,
  bodyClassName,
  icon: Icon,
  iconTone = 'indigo',
}) {
  const { t } = useTranslation()
  useEffect(() => {
    if (!open) return undefined
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    function onKeyDown(event) {
      if (event.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = original
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  if (typeof document === 'undefined') return null

  const iconTones = {
    indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300',
    rose: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300',
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-[3px]"
            onClick={() => closeOnBackdrop && onClose?.()}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            className={cn(
              'relative z-10 flex max-h-[94dvh] w-full flex-col overflow-hidden rounded-t-2xl border border-slate-200/70 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 sm:max-h-[92dvh] sm:rounded-2xl',
              sizes[size] || sizes.md,
            )}
          >
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-4 py-3.5 dark:border-slate-800 sm:gap-4 sm:px-6 sm:py-4">
              <div className="flex min-w-0 items-start gap-3">
                {Icon && (
                  <span
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                      iconTones[iconTone] || iconTones.indigo,
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                )}
                <div className="min-w-0">
                  <h2 className="kp-title text-base font-semibold text-slate-900 dark:text-white">
                    {title}
                  </h2>
                  {description && (
                    <p className="mt-0.5 text-xs leading-relaxed text-slate-400 dark:text-slate-500">
                      {description}
                    </p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                aria-label={t('common.close')}
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <div className={cn('flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5', bodyClassName)}>
              {children}
            </div>

            {footer && (
              <div className="border-t border-slate-100 bg-slate-50/60 px-4 py-3.5 dark:border-slate-800 dark:bg-slate-900/60 sm:px-6 sm:py-4">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
