import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import {
  CalendarDays,
  Download,
  Eye,
  MoreHorizontal,
  Pencil,
  Plus,
  Receipt,
  SearchX,
  Trash2,
  TrendingDown,
  Wallet,
} from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { StatCard } from '../../components/ui/StatCard'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { SearchInput, Select } from '../../components/ui/Input'
import { Dropdown, DropdownItem } from '../../components/ui/Dropdown'
import { Modal } from '../../components/ui/Modal'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { DataTable } from '../../components/tables/DataTable'
import { Tabs } from '../../components/ui/Tabs'
import { ExpenseFormModal, expenseCategories } from '../../components/forms/ExpenseForm'
import { useDataStore } from '../../store/useDataStore'
import { useCurrency } from '../../hooks/useCurrency'
import { useDelayedReady } from '../../hooks/useDelayedReady'
import { useTableControls } from '../../hooks/useTableControls'
import { isWithin, resolveRange } from '../../utils/analytics'
import { downloadCSV } from '../../utils/csv'
import { formatDate, formatNumber } from '../../utils/format'

const categoryTones = {
  rent: 'indigo',
  salaries: 'violet',
  utilities: 'sky',
  supplies: 'amber',
  marketing: 'orange',
  maintenance: 'rose',
  transport: 'teal',
  other: 'slate',
}

const rangeKeys = ['all', 'last7', 'last30', 'thisMonth']

export function Expenses() {
  const { t } = useTranslation()
  const money = useCurrency()
  const expenses = useDataStore((state) => state.expenses)
  const deleteExpense = useDataStore((state) => state.deleteExpense)
  const ready = useDelayedReady(260)

  const [range, setRange] = useState('all')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [viewing, setViewing] = useState(null)
  const [deleting, setDeleting] = useState(null)

  const { query, setQuery, filters, setFilter, resetFilters } = useTableControls({
    category: 'all',
  })

  const rangeExpenses = useMemo(() => {
    if (range === 'all') return expenses
    const window = resolveRange(range)
    return expenses.filter((expense) => isWithin(expense.date, window))
  }, [expenses, range])

  const stats = useMemo(() => {
    const total = rangeExpenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0)
    const thisMonth = expenses.filter((expense) =>
      isWithin(expense.date, resolveRange('thisMonth')),
    )
    const byCategory = new Map()
    rangeExpenses.forEach((expense) => {
      byCategory.set(expense.category, (byCategory.get(expense.category) || 0) + Number(expense.amount || 0))
    })
    const top = Array.from(byCategory.entries()).sort((a, b) => b[1] - a[1])[0]
    return {
      total,
      count: rangeExpenses.length,
      thisMonth: thisMonth.reduce((sum, expense) => sum + Number(expense.amount || 0), 0),
      thisMonthCount: thisMonth.length,
      average: rangeExpenses.length ? total / rangeExpenses.length : 0,
      topCategory: top ? top[0] : null,
      topAmount: top ? top[1] : 0,
    }
  }, [rangeExpenses, expenses])

  const rows = useMemo(() => {
    const term = query.trim().toLowerCase()
    return rangeExpenses
      .filter(
        (expense) =>
          !term ||
          String(expense.description || '').toLowerCase().includes(term) ||
          String(expense.category || '').toLowerCase().includes(term),
      )
      .filter((expense) => filters.category === 'all' || expense.category === filters.category)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [rangeExpenses, query, filters])

  const tabs = rangeKeys.map((key) => ({
    key,
    label: t(`range.${key}`),
  }))

  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }

  function confirmDelete() {
    if (!deleting) return
    deleteExpense(deleting.id)
    if (viewing?.id === deleting.id) setViewing(null)
    toast.success(t('expenses.deleted'))
    setDeleting(null)
  }

  function exportCSV() {
    downloadCSV(
      'smartpos-expenses',
      [
        { label: t('common.date'), value: (row) => formatDate(row.date) },
        { label: t('expenses.category'), value: (row) => t(`expenseCategory.${row.category.toLowerCase()}`) },
        { label: t('common.description'), key: 'description' },
        { label: t('common.amount'), key: 'amount' },
      ],
      rows,
    )
    toast.success(t('common.exported'))
  }

  const columns = [
    {
      key: 'date',
      header: t('common.date'),
      sortable: true,
      sortValue: (expense) => expense.date,
      render: (expense) => (
        <div>
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
            {formatDate(expense.date)}
          </p>
          <p className="text-[10px] text-slate-400">{t('expenses.recorded')}</p>
        </div>
      ),
    },
    {
      key: 'category',
      header: t('expenses.category'),
      sortable: true,
      render: (expense) => (
        <Badge tone={categoryTones[expense.category.toLowerCase()] || 'slate'}>
          {t(`expenseCategory.${expense.category.toLowerCase()}`)}
        </Badge>
      ),
    },
    {
      key: 'description',
      header: t('common.description'),
      render: (expense) => (
        <span className="block max-w-[320px] truncate text-xs text-slate-600 dark:text-slate-300">
          {expense.description || '—'}
        </span>
      ),
    },
    {
      key: 'amount',
      header: t('common.amount'),
      align: 'right',
      sortable: true,
      render: (expense) => (
        <span className="text-sm font-bold text-rose-600 dark:text-rose-400">
          −{money(expense.amount)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (expense) => (
        <Dropdown
          width="w-44"
          trigger={({ toggle }) => (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                toggle()
              }}
              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
              aria-label={t('common.actions')}
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          )}
        >
          {(close) => (
            <div>
              <DropdownItem
                icon={Eye}
                onClick={() => {
                  setViewing(expense)
                  close()
                }}
              >
                {t('common.viewDetails')}
              </DropdownItem>
              <DropdownItem
                icon={Pencil}
                onClick={() => {
                  setEditing(expense)
                  setFormOpen(true)
                  close()
                }}
              >
                {t('common.edit')}
              </DropdownItem>
              <DropdownItem
                icon={Trash2}
                danger
                onClick={() => {
                  setDeleting(expense)
                  close()
                }}
              >
                {t('common.delete')}
              </DropdownItem>
            </div>
          )}
        </Dropdown>
      ),
    },
  ]

  return (
    <div className="space-y-5">
      <PageHeader
        title={t('expenses.title')}
        description={t('expenses.subtitle')}
        badge={<Badge tone="rose">{t('common.countItems', { count: expenses.length })}</Badge>}
        actions={
          <>
            <Button variant="outline" leftIcon={Download} onClick={exportCSV} disabled={!rows.length}>
              {t('common.export')}
            </Button>
            <Button leftIcon={Plus} onClick={openCreate}>
              {t('expenses.addExpense')}
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard
          label={t('expenses.totalExpenses')}
          value={money(stats.total)}
          icon={Wallet}
          tone="rose"
          hint={t('expenses.recordCount', { count: stats.count })}
          loading={!ready}
        />
        <StatCard
          label={t('expenses.thisMonth')}
          value={money(stats.thisMonth)}
          icon={CalendarDays}
          tone="indigo"
          hint={t('expenses.thisMonthCount', { count: stats.thisMonthCount })}
          loading={!ready}
        />
        <StatCard
          label={t('expenses.averageExpense')}
          value={money(stats.average)}
          icon={TrendingDown}
          tone="amber"
          hint={t('expenses.averageHint')}
          loading={!ready}
        />
        <StatCard
          label={t('expenses.topCategory')}
          value={
            stats.topCategory
              ? t(`expenseCategory.${stats.topCategory.toLowerCase()}`)
              : '—'
          }
          icon={Receipt}
          tone="violet"
          hint={t('expenses.topCategoryHint', { amount: money(stats.topAmount) })}
          loading={!ready}
        />
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white px-3.5 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
        <Tabs items={tabs} value={range} onChange={setRange} />
        <p className="text-[11px] text-slate-400 dark:text-slate-500">
          {t('expenses.showingRange', {
            count: formatNumber(rangeExpenses.length),
            total: formatNumber(expenses.length),
          })}
        </p>
      </div>

      <Card>
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 dark:border-slate-800 lg:flex-row lg:items-center">
          <SearchInput
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('expenses.searchPlaceholder')}
            className="lg:max-w-sm"
          />
          <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
            <Select
              value={filters.category}
              onChange={(event) => setFilter('category', event.target.value)}
              aria-label={t('expenses.category')}
              className="h-10 min-w-[170px] text-xs"
              options={[
                { value: 'all', label: t('expenses.allCategories') },
                ...expenseCategories.map((category) => ({
                  value: category,
                  label: t(`expenseCategory.${category.toLowerCase()}`),
                })),
              ]}
            />
            <Button
              variant="ghost"
              size="sm"
              leftIcon={SearchX}
              onClick={resetFilters}
              disabled={!query && filters.category === 'all'}
            >
              {t('common.resetFilters')}
            </Button>
          </div>
        </div>
        <DataTable
          columns={columns}
          data={rows}
          pageSize={8}
          loading={!ready}
          initialSort={{ key: 'date', dir: 'desc' }}
          onRowClick={(expense) => setViewing(expense)}
          emptyIcon={Wallet}
          emptyTitle={t('expenses.noExpenses')}
          emptyDescription={t('expenses.noExpensesHint')}
        />
      </Card>

      <Modal
        open={Boolean(viewing)}
        onClose={() => setViewing(null)}
        title={t('expenses.expenseDetails')}
        description={viewing ? formatDate(viewing.date) : undefined}
        icon={Wallet}
        size="sm"
        footer={
          <div className="flex justify-between gap-2">
            <Button variant="outline" onClick={() => setViewing(null)}>
              {t('common.close')}
            </Button>
            {viewing && (
              <Button
                leftIcon={Pencil}
                onClick={() => {
                  setEditing(viewing)
                  setViewing(null)
                  setFormOpen(true)
                }}
              >
                {t('common.edit')}
              </Button>
            )}
          </div>
        }
      >
        {viewing && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-rose-50/70 p-4 text-center dark:bg-rose-500/10">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-rose-500 dark:text-rose-400">
                {t('expenses.amountPaid')}
              </p>
              <p className="mt-1 text-2xl font-bold text-rose-600 dark:text-rose-300">
                {money(viewing.amount)}
              </p>
              <Badge tone={categoryTones[viewing.category.toLowerCase()] || 'slate'} className="mt-2">
                {t(`expenseCategory.${viewing.category.toLowerCase()}`)}
              </Badge>
            </div>

            <div className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 text-xs dark:divide-slate-800 dark:border-slate-800">
              <div className="flex justify-between gap-4 px-3.5 py-2.5">
                <span className="text-slate-400">{t('common.date')}</span>
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  {formatDate(viewing.date)}
                </span>
              </div>
              <div className="flex justify-between gap-4 px-3.5 py-2.5">
                <span className="text-slate-400">{t('expenses.category')}</span>
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  {t(`expenseCategory.${viewing.category.toLowerCase()}`)}
                </span>
              </div>
              <div className="px-3.5 py-2.5">
                <p className="text-slate-400">{t('common.description')}</p>
                <p className="mt-1 leading-relaxed text-slate-700 dark:text-slate-200">
                  {viewing.description || '—'}
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              leftIcon={Trash2}
              className="w-full text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
              onClick={() => setDeleting(viewing)}
            >
              {t('common.delete')}
            </Button>
          </div>
        )}
      </Modal>

      <ExpenseFormModal open={formOpen} onClose={() => setFormOpen(false)} expense={editing} />

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        title={t('expenses.deleteTitle')}
        description={t('expenses.deleteDescription', { amount: money(deleting?.amount || 0) })}
        confirmLabel={t('common.delete')}
      />
    </div>
  )
}
