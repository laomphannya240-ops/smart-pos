import { useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Inbox } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '../../utils/cn'
import { Skeleton } from '../ui/Skeleton'

function EmptyTable({ icon: Icon = Inbox, title, description, colSpan }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-6 py-16">
        <div className="flex flex-col items-center justify-center text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
            <Icon className="h-6 w-6" />
          </span>
          <p className="mt-4 text-sm font-semibold text-slate-700 dark:text-slate-200">
            {title}
          </p>
          {description && (
            <p className="mt-1 max-w-xs text-xs leading-relaxed text-slate-400 dark:text-slate-500">
              {description}
            </p>
          )}
        </div>
      </td>
    </tr>
  )
}

export function DataTable({
  columns,
  data = [],
  rowKey = 'id',
  loading = false,
  pageSize = 8,
  initialSort = null,
  emptyTitle,
  emptyDescription,
  emptyIcon = Inbox,
  onRowClick,
  rowClassName,
  footer = true,
  className,
}) {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState(initialSort)

  const sorted = useMemo(() => {
    if (!sort?.key) return data
    const column = columns.find((entry) => entry.key === sort.key)
    const getValue = (row) =>
      column?.sortValue
        ? column.sortValue(row)
        : row[sort.key] ?? ''
    return [...data].sort((a, b) => {
      const left = getValue(a)
      const right = getValue(b)
      if (typeof left === 'number' && typeof right === 'number') {
        return sort.dir === 'asc' ? left - right : right - left
      }
      return sort.dir === 'asc'
        ? String(left).localeCompare(String(right))
        : String(right).localeCompare(String(left))
    })
  }, [data, sort, columns])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const start = (currentPage - 1) * pageSize
  const rows = sorted.slice(start, start + pageSize)

  function toggleSort(column) {
    if (!column.sortable) return
    setSort((prev) => {
      if (!prev || prev.key !== column.key) return { key: column.key, dir: 'asc' }
      if (prev.dir === 'asc') return { key: column.key, dir: 'desc' }
      return null
    })
  }

  function pageNumbers() {
    const pages = []
    const from = Math.max(1, currentPage - 1)
    const to = Math.min(totalPages, currentPage + 1)
    if (from > 1) pages.push(1)
    if (from > 2) pages.push('...')
    for (let i = from; i <= to; i += 1) pages.push(i)
    if (to < totalPages - 1) pages.push('...')
    if (to < totalPages) pages.push(totalPages)
    return pages
  }

  const primaryColumn =
    columns.find((column) => column.mobilePrimary) ||
    columns.find((column) => column.key !== 'actions') ||
    columns[0]
  const actionColumn = columns.find((column) => column.key === 'actions')
  const EmptyIcon = emptyIcon || Inbox
  const detailColumns = columns.filter(
    (column) =>
      column !== primaryColumn && column !== actionColumn && !column.mobileHidden,
  )

  return (
    <div className={cn('w-full', className)}>
      <div className="hidden w-full overflow-x-auto md:block">
        <table className="w-full min-w-[680px] border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-800/40">
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={cn(
                    'whitespace-nowrap px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 first:pl-5 last:pr-5 dark:text-slate-400',
                    column.align === 'right' && 'text-right',
                    column.align === 'center' && 'text-center',
                    column.className,
                  )}
                >
                  {column.sortable ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(column)}
                      className={cn(
                        'inline-flex items-center gap-1.5 transition hover:text-slate-800 dark:hover:text-slate-200',
                        column.align === 'right' && 'flex-row-reverse',
                      )}
                    >
                      {column.header}
                      {sort?.key === column.key ? (
                        sort.dir === 'asc' ? (
                          <ArrowUp className="h-3 w-3" />
                        ) : (
                          <ArrowDown className="h-3 w-3" />
                        )
                      ) : (
                        <ArrowUpDown className="h-3 w-3 opacity-40" />
                      )}
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading &&
              Array.from({ length: Math.min(pageSize, 5) }).map((_, rowIndex) => (
                <tr key={`skeleton-${rowIndex}`}>
                  {columns.map((column) => (
                    <td key={column.key} className="px-4 py-3.5 first:pl-5 last:pr-5">
                      <Skeleton className="h-4 w-full max-w-[140px]" />
                    </td>
                  ))}
                </tr>
              ))}

            {!loading && rows.length === 0 && (
              <EmptyTable
                icon={emptyIcon}
                title={emptyTitle || t('common.noResults')}
                description={emptyDescription || t('common.noResultsHint')}
                colSpan={columns.length}
              />
            )}

            {!loading &&
              rows.map((row, index) => (
                <tr
                  key={row[rowKey] ?? index}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn(
                    'group transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40',
                    onRowClick && 'cursor-pointer',
                    rowClassName?.(row),
                  )}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={cn(
                        'whitespace-nowrap px-4 py-3.5 text-sm text-slate-600 first:pl-5 last:pr-5 dark:text-slate-300',
                        column.align === 'right' && 'text-right',
                        column.align === 'center' && 'text-center',
                        column.cellClassName,
                      )}
                    >
                      {column.render ? column.render(row) : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-slate-100 md:hidden dark:divide-slate-800">
        {loading &&
          Array.from({ length: Math.min(pageSize, 5) }).map((_, index) => (
            <div key={`mobile-skeleton-${index}`} className="space-y-2.5 px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-7 w-7 rounded-lg" />
              </div>
              <Skeleton className="h-3 w-full max-w-[220px]" />
              <Skeleton className="h-3 w-full max-w-[160px]" />
            </div>
          ))}

        {!loading && rows.length === 0 && (
          <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
              <EmptyIcon className="h-6 w-6" />
            </span>
            <p className="mt-4 text-sm font-semibold text-slate-700 dark:text-slate-200">
              {emptyTitle || t('common.noResults')}
            </p>
            <p className="mt-1 max-w-xs text-xs leading-relaxed text-slate-400 dark:text-slate-500">
              {emptyDescription || t('common.noResultsHint')}
            </p>
          </div>
        )}

        {!loading &&
          rows.map((row, index) => (
            <div
              key={row[rowKey] ?? index}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={cn(
                'px-4 py-3.5 transition-colors',
                onRowClick &&
                  'cursor-pointer active:bg-slate-50 dark:active:bg-slate-800/40',
                rowClassName?.(row),
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1 text-sm">
                  {primaryColumn?.render
                    ? primaryColumn.render(row)
                    : row[primaryColumn?.key]}
                </div>
                {actionColumn && (
                  <div className="shrink-0">
                    {actionColumn.render
                      ? actionColumn.render(row)
                      : row[actionColumn.key]}
                  </div>
                )}
              </div>

              {detailColumns.length > 0 && (
                <dl className="mt-2.5 space-y-1.5 border-t border-slate-100 pt-2.5 dark:border-slate-800">
                  {detailColumns.map((column) => (
                    <div
                      key={column.key}
                      className="flex items-start justify-between gap-3"
                    >
                      <dt className="shrink-0 pt-0.5 text-[11px] font-medium text-slate-400 dark:text-slate-500">
                        {column.header}
                      </dt>
                      <dd
                        className={cn(
                          'min-w-0 text-right text-xs text-slate-600 dark:text-slate-300',
                          column.align === 'right' && 'tabular-nums',
                        )}
                      >
                        {column.render ? column.render(row) : row[column.key]}
                      </dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>
          ))}
      </div>

      {footer && sorted.length > 0 && (
        <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-3.5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-400 dark:text-slate-500">
            {t('common.showingResults', {
              from: start + 1,
              to: Math.min(start + pageSize, sorted.length),
              total: sorted.length,
            })}
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="inline-flex h-8 items-center gap-1 rounded-lg px-2 text-xs font-medium text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">{t('common.previous')}</span>
            </button>
            {pageNumbers().map((number, index) =>
              number === '...' ? (
                <span
                  key={`dots-${index}`}
                  className="px-1 text-xs text-slate-400 dark:text-slate-600"
                >
                  …
                </span>
              ) : (
                <button
                  key={number}
                  type="button"
                  onClick={() => setPage(number)}
                  className={cn(
                    'h-8 min-w-8 rounded-lg px-2 text-xs font-semibold transition',
                    number === currentPage
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                      : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800',
                  )}
                >
                  {number}
                </button>
              ),
            )}
            <button
              type="button"
              onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="inline-flex h-8 items-center gap-1 rounded-lg px-2 text-xs font-medium text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <span className="hidden sm:inline">{t('common.next')}</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
