import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useClickOutside } from '../../hooks/useClickOutside'
import { cn } from '../../utils/cn'

export function Dropdown({
  trigger,
  children,
  align = 'right',
  width = 'w-56',
  panelClassName,
  contentClassName,
}) {
  const [open, setOpen] = useState(false)
  const ref = useClickOutside(() => setOpen(false))
  const close = () => setOpen(false)

  return (
    <div className="relative" ref={ref}>
      {trigger({ open, toggle: () => setOpen((value) => !value), close })}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'absolute z-50 mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-900/10 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/40',
              align === 'right' ? 'right-0' : 'left-0',
              width,
              panelClassName,
            )}
          >
            <div className={contentClassName}>
              {typeof children === 'function' ? children(close) : children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function DropdownItem({ icon: Icon, children, onClick, active, danger, disabled }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50',
        danger
          ? 'text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10'
          : active
            ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300'
            : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
      )}
    >
      {Icon && <Icon className="h-4 w-4 shrink-0" />}
      <span className="flex-1 truncate">{children}</span>
    </button>
  )
}
