import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import {
  ArrowDownLeft,
  ArrowUpRight,
  Banknote,
  Clock3,
  CreditCard,
  Download,
  Eye,
  MoreHorizontal,
  Printer,
  QrCode,
  ReceiptText,
  SearchX,
  Wallet,
} from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { StatCard } from '../../components/ui/StatCard'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge, StatusBadge } from '../../components/ui/Badge'
import { SearchInput, Select } from '../../components/ui/Input'
import { Dropdown, DropdownItem } from '../../components/ui/Dropdown'
import { Modal } from '../../components/ui/Modal'
import { DataTable } from '../../components/tables/DataTable'
import { Tabs } from '../../components/ui/Tabs'
import { ReceiptModal } from '../../components/pos/ReceiptModal'
import { useDataStore } from '../../store/useDataStore'
import { useCurrency } from '../../hooks/useCurrency'
import { useDelayedReady } from '../../hooks/useDelayedReady'
import { useTableControls } from '../../hooks/useTableControls'
import { isWithin, resolveRange } from '../../utils/analytics'
import { downloadCSV } from '../../utils/csv'
import { formatDate, formatDateTime } from '../../utils/format'
import { cn } from '../../utils/cn'

const paymentIcons = { cash: Banknote, qr: QrCode, card: CreditCard }
const paymentTones = { cash: 'indigo', qr: 'emerald', card: 'violet' }
const rangeKeys = ['all', 'today', 'last7', 'last30', 'thisMonth']

export function Payments() {
  const { t } = useTranslation()
  const money = useCurrency()
  const payments = useDataStore((state) => state.payments)
  const sales = useDataStore((state) => state.sales)
  const ready = useDelayedReady(260)

  const [tab, setTab] = useState('all')
  const [range, setRange] = useState('all')
  const [viewingId, setViewingId] = useState(null)
  const [receiptSale, setReceiptSale] = useState(null)

  const { query, setQuery, filters, setFilter, resetFilters } = useTableControls({
    method: 'all',
  })

  const rangePayments = useMemo(() => {
    if (range === 'all') return payments
    const window = resolveRange(range)
    return payments.filter((payment) => isWithin(payment.createdAt, window))
  }, [payments, range])

  const salesById = useMemo(
    () => new Map(sales.map((sale) => [sale.id, sale])),
    [sales],
  )

  const stats = useMemo(() => {
    const collected = rangePayments.filter((payment) => payment.status === 'completed')
    const pending = rangePayments.filter((payment) => payment.status === 'pending')
    const refunded = rangePayments.filter((payment) => payment.status === 'refunded')
    const sum = (list) => list.reduce((total, payment) => total + Number(payment.amount || 0), 0)
    return {
      collected: sum(collected),
      collectedCount: collected.length,
      pending: sum(pending),
      pendingCount: pending.length,
      refunded: sum(refunded),
      refundedCount: refunded.length,
      count: rangePayments.length,
      average: collected.length ? sum(collected) / collected.length : 0,
    }
  }, [rangePayments])

  const rows = useMemo(() => {
    const term = query.trim().toLowerCase()
    return rangePayments
      .filter(
        (payment) =>
          !term ||
          payment.transactionId.toLowerCase().includes(term) ||
          payment.saleNumber.toLowerCase().includes(term) ||
          String(payment.customerName || '').toLowerCase().includes(term),
      )
      .filter((payment) => tab === 'all' || payment.status === tab)
      .filter((payment) => filters.method === 'all' || payment.method === filters.method)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [rangePayments, query, tab, filters])

  const viewing = payments.find((payment) => payment.id === viewingId) || null
  const viewingSale = viewing ? salesById.get(viewing.saleId) : null

  const tabs = [
    { key: 'all', label: t('common.all'), count: rangePayments.length },
    {
      key: 'completed',
      label: t('status.completed'),
      count: rangePayments.filter((payment) => payment.status === 'completed').length,
    },
    {
      key: 'pending',
      label: t('status.pending'),
      count: rangePayments.filter((payment) => payment.status === 'pending').length,
    },
    {
      key: 'refunded',
      label: t('status.refunded'),
      count: rangePayments.filter((payment) => payment.status === 'refunded').length,
    },
  ]

  function exportCSV() {
    downloadCSV(
      'smartpos-payments',
      [
        { label: t('payments.transaction'), key: 'transactionId' },
        { label: t('sales.invoice'), key: 'saleNumber' },
        { label: t('common.customer'), key: 'customerName' },
        { label: t('payment.method'), value: (row) => t(`payment.${row.method}`) },
        { label: t('common.amount'), key: 'amount' },
        { label: t('common.status'), value: (row) => t(`status.${row.status}`) },
        { label: t('common.date'), value: (row) => formatDateTime(row.createdAt) },
      ],
      rows,
    )
    toast.success(t('common.exported'))
  }

  const columns = [
    {
      key: 'transactionId',
      header: t('payments.transaction'),
      sortable: true,
      render: (payment) => (
        <div>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            {payment.transactionId}
          </p>
          <p className="text-[10px] text-slate-400">{payment.saleNumber}</p>
        </div>
      ),
    },
    {
      key: 'customerName',
      header: t('common.customer'),
      sortable: true,
      render: (payment) => (
        <span className="max-w-[190px] truncate text-xs font-medium text-slate-700 dark:text-slate-200">
          {payment.customerName}
        </span>
      ),
    },
    {
      key: 'method',
      header: t('payment.method'),
      sortable: true,
      render: (payment) => {
        const Icon = paymentIcons[payment.method] || CreditCard
        return (
          <Badge tone={paymentTones[payment.method] || 'slate'}>
            <Icon className="h-3 w-3" />
            {t(`payment.${payment.method}`)}
          </Badge>
        )
      },
    },
    {
      key: 'amount',
      header: t('common.amount'),
      align: 'right',
      sortable: true,
      render: (payment) => (
        <span
          className={cn(
            'text-sm font-bold',
            payment.status === 'refunded'
              ? 'text-rose-600 line-through dark:text-rose-400'
              : 'text-slate-800 dark:text-slate-100',
          )}
        >
          {money(payment.amount)}
        </span>
      ),
    },
    {
      key: 'status',
      header: t('common.status'),
      sortable: true,
      render: (payment) => (
        <StatusBadge status={payment.status}>{t(`status.${payment.status}`)}</StatusBadge>
      ),
    },
    {
      key: 'createdAt',
      header: t('common.date'),
      sortable: true,
      render: (payment) => (
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {formatDate(payment.createdAt)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (payment) => (
        <Dropdown
          width="w-48"
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
          {(close) => {
            const sale = salesById.get(payment.saleId)
            return (
              <div>
                <DropdownItem
                  icon={Eye}
                  onClick={() => {
                    setViewingId(payment.id)
                    close()
                  }}
                >
                  {t('common.viewDetails')}
                </DropdownItem>
                {sale && (
                  <DropdownItem
                    icon={Printer}
                    onClick={() => {
                      setReceiptSale(sale)
                      close()
                    }}
                  >
                    {t('common.printReceipt')}
                  </DropdownItem>
                )}
              </div>
            )
          }}
        </Dropdown>
      ),
    },
  ]

  return (
    <div className="space-y-5">
      <PageHeader
        title={t('payments.title')}
        description={t('payments.subtitle')}
        badge={<Badge tone="emerald">{t('common.countItems', { count: payments.length })}</Badge>}
        actions={
          <Button variant="outline" leftIcon={Download} onClick={exportCSV} disabled={!rows.length}>
            {t('common.export')}
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard
          label={t('payments.collected')}
          value={money(stats.collected)}
          icon={ArrowDownLeft}
          tone="emerald"
          hint={t('payments.completedCount', { count: stats.collectedCount })}
          loading={!ready}
        />
        <StatCard
          label={t('payments.pending')}
          value={money(stats.pending)}
          icon={Clock3}
          tone="amber"
          hint={t('payments.pendingCount', { count: stats.pendingCount })}
          loading={!ready}
        />
        <StatCard
          label={t('payments.refunded')}
          value={money(stats.refunded)}
          icon={ArrowUpRight}
          tone="rose"
          hint={t('payments.refundedCount', { count: stats.refundedCount })}
          loading={!ready}
        />
        <StatCard
          label={t('payments.averagePayment')}
          value={money(stats.average)}
          icon={Wallet}
          tone="indigo"
          hint={t('payments.transactionsCount', { count: stats.count })}
          loading={!ready}
        />
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white px-3.5 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
        <Tabs items={tabs} value={tab} onChange={setTab} className="overflow-x-auto" />
        <Select
          value={range}
          onChange={(event) => setRange(event.target.value)}
          aria-label={t('payments.dateRange')}
          className="h-9 min-w-[150px] text-xs"
          options={rangeKeys.map((key) => ({ value: key, label: t(`range.${key}`) }))}
        />
      </div>

      <Card>
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 dark:border-slate-800 lg:flex-row lg:items-center">
          <SearchInput
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('payments.searchPlaceholder')}
            className="lg:max-w-sm"
          />
          <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
            <Select
              value={filters.method}
              onChange={(event) => setFilter('method', event.target.value)}
              aria-label={t('payment.method')}
              className="h-10 min-w-[150px] text-xs"
              options={[
                { value: 'all', label: t('payment.allMethods') },
                { value: 'cash', label: t('payment.cash') },
                { value: 'qr', label: t('payment.qr') },
                { value: 'card', label: t('payment.card') },
              ]}
            />
            <Button
              variant="ghost"
              size="sm"
              leftIcon={SearchX}
              onClick={resetFilters}
              disabled={!query && filters.method === 'all'}
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
          initialSort={{ key: 'createdAt', dir: 'desc' }}
          onRowClick={(payment) => setViewingId(payment.id)}
          emptyIcon={CreditCard}
          emptyTitle={t('payments.noPayments')}
          emptyDescription={t('payments.noPaymentsHint')}
        />
      </Card>

      <Modal
        open={Boolean(viewing)}
        onClose={() => setViewingId(null)}
        title={viewing?.transactionId || t('payments.paymentDetails')}
        description={viewing ? formatDateTime(viewing.createdAt) : undefined}
        icon={ReceiptText}
        size="md"
        footer={
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
            <Button variant="outline" onClick={() => setViewingId(null)}>
              {t('common.close')}
            </Button>
            {viewingSale && (
              <Button leftIcon={Printer} onClick={() => setReceiptSale(viewingSale)}>
                {t('common.printReceipt')}
              </Button>
            )}
          </div>
        }
      >
        {viewing && (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/30">
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    'flex h-11 w-11 items-center justify-center rounded-xl',
                    viewing.method === 'cash' &&
                      'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300',
                    viewing.method === 'qr' &&
                      'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300',
                    viewing.method === 'card' &&
                      'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300',
                  )}
                >
                  {(() => {
                    const Icon = paymentIcons[viewing.method] || CreditCard
                    return <Icon className="h-5 w-5" />
                  })()}
                </span>
                <div>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">
                    {money(viewing.amount)}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {t(`payment.${viewing.method}`)} · {viewing.customerName}
                  </p>
                </div>
              </div>
              <StatusBadge status={viewing.status}>{t(`status.${viewing.status}`)}</StatusBadge>
            </div>

            <div className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 text-xs dark:divide-slate-800 dark:border-slate-800">
              {[
                { label: t('payments.transaction'), value: viewing.transactionId },
                {
                  label: t('sales.invoice'),
                  value: viewing.saleNumber,
                  icon: ReceiptText,
                },
                { label: t('common.customer'), value: viewing.customerName },
                { label: t('sales.cashier'), value: viewing.cashierName },
                { label: t('payment.method'), value: t(`payment.${viewing.method}`) },
                {
                  label: t('common.status'),
                  value: t(`status.${viewing.status}`),
                },
                { label: t('common.date'), value: formatDateTime(viewing.createdAt) },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <div
                    key={item.label}
                    className="flex items-center justify-between gap-4 px-3.5 py-2.5"
                  >
                    <span className="flex items-center gap-1.5 text-slate-400">
                      {Icon && <Icon className="h-3.5 w-3.5" />}
                      {item.label}
                    </span>
                    <span className="truncate font-medium text-slate-700 dark:text-slate-200">
                      {item.value}
                    </span>
                  </div>
                )
              })}
            </div>

            {viewingSale ? (
              <div>
                <p className="mb-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
                  {t('payments.linkedSale')}
                </p>
                <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-400 dark:bg-slate-800/50">
                      <tr>
                        <th className="px-3 py-2 font-semibold">{t('sales.item')}</th>
                        <th className="px-3 py-2 text-center font-semibold">{t('sales.qty')}</th>
                        <th className="px-3 py-2 text-right font-semibold">{t('common.total')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {(viewingSale.items || []).map((item) => (
                        <tr key={`${item.productId}-${item.name}`}>
                          <td className="px-3 py-2">
                            <span className="mr-1.5">{item.emoji || '📦'}</span>
                            {item.name}
                          </td>
                          <td className="px-3 py-2 text-center tabular-nums text-slate-500">
                            {item.qty}
                          </td>
                          <td className="px-3 py-2 text-right font-semibold text-slate-700 dark:text-slate-200">
                            {money(Number(item.price) * Number(item.qty))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-2 flex items-center justify-between rounded-xl bg-slate-50 px-3.5 py-2.5 text-xs dark:bg-slate-800/50">
                  <span className="text-slate-500 dark:text-slate-400">{t('payments.saleTotal')}</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {money(viewingSale.total)}
                  </span>
                </div>
              </div>
            ) : (
              <p className="rounded-xl border border-dashed border-slate-200 px-4 py-5 text-center text-xs text-slate-400 dark:border-slate-800">
                {t('payments.saleUnavailable')}
              </p>
            )}

            <p className="rounded-xl bg-indigo-50/70 px-3.5 py-3 text-[11px] leading-relaxed text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
              {t('payments.ledgerNote')}
            </p>
          </div>
        )}
      </Modal>

      <ReceiptModal
        open={Boolean(receiptSale)}
        onClose={() => setReceiptSale(null)}
        sale={receiptSale}
      />
    </div>
  )
}
