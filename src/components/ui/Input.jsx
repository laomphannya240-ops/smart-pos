import { forwardRef, useId } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown, Search, X } from 'lucide-react'
import { cn } from '../../utils/cn'

const fieldBase =
  'w-full rounded-xl border bg-white text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:bg-slate-50 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:disabled:bg-slate-800'

const normalBorder =
  'border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/10 dark:border-slate-700 dark:hover:border-slate-600 dark:focus:border-indigo-500'
const errorBorder =
  'border-rose-400 focus:border-rose-500 focus:ring-rose-500/10 dark:border-rose-500/70'

export function FieldShell({
  label,
  htmlFor,
  error,
  hint,
  required,
  children,
  className,
}) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300"
        >
          {label}
          {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-xs font-medium text-rose-600 dark:text-rose-400" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-[11px] leading-relaxed text-slate-400 dark:text-slate-500">{hint}</p>
      ) : null}
    </div>
  )
}

export const Input = forwardRef(function Input(
  {
    label,
    error,
    hint,
    icon: Icon,
    className,
    containerClassName,
    id,
    required,
    suffix,
    trailing,
    ...props
  },
  ref,
) {
  const autoId = useId()
  const inputId = id || autoId
  return (
    <FieldShell
      label={label}
      htmlFor={inputId}
      error={error}
      hint={hint}
      required={required}
      className={containerClassName}
    >
      <div className="relative">
        {Icon && (
          <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        )}
        <input
          ref={ref}
          id={inputId}
          required={required}
          className={cn(
            fieldBase,
            'h-10 px-3.5',
            Icon && 'pl-10',
            (suffix || trailing) && 'pr-12',
            error ? errorBorder : normalBorder,
            className,
          )}
          {...props}
        />
        {suffix && (
          <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
            {suffix}
          </span>
        )}
        {trailing && (
          <span className="absolute right-1.5 top-1/2 -translate-y-1/2">{trailing}</span>
        )}
      </div>
    </FieldShell>
  )
})

export const Textarea = forwardRef(function Textarea(
  { label, error, hint, className, containerClassName, id, required, rows = 3, ...props },
  ref,
) {
  const autoId = useId()
  const inputId = id || autoId
  return (
    <FieldShell
      label={label}
      htmlFor={inputId}
      error={error}
      hint={hint}
      required={required}
      className={containerClassName}
    >
      <textarea
        ref={ref}
        id={inputId}
        rows={rows}
        className={cn(
          fieldBase,
          'resize-none px-3.5 py-2.5',
          error ? errorBorder : normalBorder,
          className,
        )}
        {...props}
      />
    </FieldShell>
  )
})

export const Select = forwardRef(function Select(
  {
    label,
    error,
    hint,
    className,
    containerClassName,
    id,
    required,
    options,
    placeholder,
    children,
    ...props
  },
  ref,
) {
  const autoId = useId()
  const inputId = id || autoId
  return (
    <FieldShell
      label={label}
      htmlFor={inputId}
      error={error}
      hint={hint}
      required={required}
      className={containerClassName}
    >
      <div className="relative">
        <select
          ref={ref}
          id={inputId}
          required={required}
          className={cn(
            fieldBase,
            'h-10 appearance-none px-3.5 pr-9',
            error ? errorBorder : normalBorder,
            className,
          )}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options
            ? options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))
            : children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </div>
    </FieldShell>
  )
})

export function Checkbox({ label, description, className, id, ...props }) {
  const autoId = useId()
  const inputId = id || autoId
  return (
    <label
      htmlFor={inputId}
      className={cn('flex cursor-pointer items-start gap-2.5', className)}
    >
      <input
        id={inputId}
        type="checkbox"
        className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-slate-300 accent-indigo-600 dark:border-slate-600"
        {...props}
      />
      <span className="select-none">
        <span className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          {label}
        </span>
        {description && (
          <span className="mt-0.5 block text-xs text-slate-400 dark:text-slate-500">
            {description}
          </span>
        )}
      </span>
    </label>
  )
}

export function Switch({ checked, onChange, label, description, disabled }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        {label && (
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{label}</p>
        )}
        {description && (
          <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">{description}</p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus-visible:ring-offset-2 disabled:opacity-50 dark:ring-offset-slate-900',
          checked ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700',
        )}
      >
        <span
          className={cn(
            'inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow transition-transform duration-200',
            checked ? 'translate-x-[1.4rem]' : 'translate-x-1',
          )}
        />
      </button>
    </div>
  )
}

export const SearchInput = forwardRef(function SearchInput(
  { value, onChange, placeholder, className, onClear, ...props },
  ref,
) {
  const { t } = useTranslation()
  return (
    <div className={cn('relative', className)}>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        ref={ref}
        type="search"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={cn(
          fieldBase,
          normalBorder,
          'h-10 px-3.5 pl-10 pr-9 [&::-webkit-search-cancel-button]:hidden',
        )}
        {...props}
      />
      {value ? (
        <button
          type="button"
          onClick={() => {
            if (onClear) onClear()
            else onChange({ target: { value: '' } })
          }}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          aria-label={t('common.clearSearch')}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      ) : null}
    </div>
  )
})
