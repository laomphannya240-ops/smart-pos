import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import {
  Banknote,
  CreditCard,
  Download,
  Eye,
  MoreHorizontal,
  Printer,
  QrCode,
  Receipt,
  ReceiptText,
  RotateCcw,
  SearchX,
  ShoppingBag,
  TrendingUp,
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
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { DataTable } from '../../components/tables/DataTable'
import { Tabs } from '../../components/ui/Tabs'
import { ReceiptModal } from '../../components/pos/ReceiptModal'
import { useDataStore } from '../../store/useDataStore'
import { useAppStore } from '../../store/useAppStore'
import { useCurrency } from '../../hooks/useCurrency'
import { useDelayedReady } from '../../hooks/useDelayedReady'
import { useTableControls } from '../../hooks/useTableControls'
import { getKpis, isWithin, resolveRange } from '../../utils/analytics'
import { downloadCSV } from '../../utils/csv'
import { formatDate, formatDateTime, formatNumber, formatTime } from '../../utils/format'
import { cn } from '../../utils/cn'

const paymentIcons = { cash: Banknote, qr: QrCode, card: CreditCard }
const rangeKeys = ['all', 'today', 'last7', 'last30', 'thisMonth']

export function Sales() {
  const { t } = useTranslation()
  const money = useCurrency()
  const session = useAppStore((state) => state.session)
  const sales = useDataStore((state) => state.sales)
  const refundSale = useDataStore((state) => state.refundSale)
  const ready = useDelayedReady(260)

  const canRefund = session?.role === 'admin' || session?.role === 'manager'
  const canSeeAll = session?.role !== 'cashier'

  const [tab, setTab] = useState('all')
  const [range, setRange] = useState('all')
  const [viewingId, setViewingId] = useState(null)
  const [receiptSale, setReceiptSale] = useState(null)
  const [refunding, setRefunding] = useState(null)

  const { query, setQuery, filters, setFilter, resetFilters } = useTableControls({
    paymentMethod: 'all',
  })

  const scopedSales = useMemo(
    () =>
      canSeeAll
        ? sales
        : sales.filter((sale) => sale.cashierId === session?.id),
    [sales, canSeeAll, session?.id],
  )

  const rangeSales = useMemo(() => {
    if (range === 'all') return scopedSales
    const window = resolveRange(range)
    return scopedSales.filter((sale) => isWithin(sale.createdAt, window))
  }, [scopedSales, range])

  const stats = useMemo(() => {
    const kpis = getKpis(rangeSales)
    const refunded = rangeSales.filter((sale) => sale.status === 'refunded')
    const pending = rangeSales.filter((sale) => sale.status === 'pending')
    return {
      ...kpis,
      refundedAmount: refunded.reduce((sum, sale) => sum + Number(sale.total || 0), 0),
      refundedCount: refunded.length,
      pendingCount: pending.length,
      totalCount: rangeSales.length,
    }
  }, [rangeSales])

  const rows = useMemo(() => {
    const term = query.trim().toLowerCase()
    return rangeSales
      .filter(
        (sale) =>
          !term ||
          sale.number.toLowerCase().includes(term) ||
          String(sale.customerName || '').toLowerCase().includes(term) ||
          String(sale.cashierName || '').toLowerCase().includes(term),
      )
      .filter((sale) => tab === 'all' || sale.status === tab)
      .filter(
        (sale) =>
          filters.paymentMethod === 'all' || sale.paymentMethod === filters.paymentMethod,
      )
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [rangeSales, query, tab, filters])

  const viewing = sales.find((sale) => sale.id === viewingId) || null
  const viewingItems = viewing?.items?.length || 0

  const tabs = [
    { key: 'all', label: t('common.all'), count: rangeSales.length },
    {
      key: 'completed',
      label: t('status.completed'),
      count: rangeSales.filter((sale) => sale.status === 'completed').length,
    },
    {
      key: 'refunded',
      label: t('status.refunded'),
      count: rangeSales.filter((sale) => sale.status === 'refunded').length,
    },
    {
      key: 'pending',
      label: t('status.pending'),
      count: rangeSales.filter((sale) => sale.status === 'pending').length,
    },
  ]

  function handleRefund() {
    if (!refunding) return
    const result = refundSale(refunding.id)
    if (result) toast.success(t('sales.refundedToast', { number: result.number }))
    setReceiptSale(null)
    setRefunding(null)
  }

  function exportCSV() {
    downloadCSV(
      'smartpos-sales',
      [
        { label: t('sales.invoice'), key: 'number' },
        { label: t('common.date'), value: (row) => formatDateTime(row.createdAt) },
        { label: t('common.customer'), key: 'customerName' },
        { label: t('sales.cashier'), key: 'cashierName' },
        { label: t('payment.method'), value: (row) => t(`payment.${row.paymentMethod}`) },
        {
          label: t('sales.itemsSold'),
          value: (row) =>
            (row.items || []).reduce((sum, item) => sum + Number(item.qty || 0), 0),
        },
        { label: t('receipt.subtotal'), key: 'subtotal' },
        { label: t('receipt.discount'), key: 'discount' },
        { label: t('receipt.tax'), key: 'tax' },
        { label: t('common.total'), key: 'total' },
        { label: t('common.status'), value: (row) => t(`status.${row.status}`) },
      ],
      rows,
    )
    toast.success(t('common.exported'))
  }

  const columns = [
    {
      key: 'number',
      header: t('sales.invoice'),
      sortable: true,
      render: (sale) => (
        <div>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            {sale.number}
          </p>
          <p className="text-[10px] text-slate-400">
            {formatDate(sale.createdAt)} · {formatTime(sale.createdAt)}
          </p>
        </div>
      ),
    },
    {
      key: 'customerName',
      header: t('common.customer'),
      sortable: true,
      render: (sale) => (
        <div className="max-w-[190px]">
          <p className="truncate text-xs font-medium text-slate-700 dark:text-slate-200">
            {sale.customerName}
          </p>
          <p className="truncate text-[10px] text-slate-400">{sale.cashierName}</p>
        </div>
      ),
    },
    {
      key: 'items',
      header: t('sales.items'),
      align: 'center',
      sortable: true,
      sortValue: (sale) =>
        (sale.items || []).reduce((sum, item) => sum + Number(item.qty || 0), 0),
      render: (sale) => (
        <Badge tone="slate">
          {t('sales.itemCount', { count: (sale.items || []).reduce((sum, item) => sum + Number(item.qty || 0), 0) })}
        </Badge>
      ),
    },
    {
      key: 'paymentMethod',
      header: t('payment.method'),
      sortable: true,
      render: (sale) => {
        const Icon = paymentIcons[sale.paymentMethod] || CreditCard
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
            <Icon className="h-3.5 w-3.5 text-slate-400" />
            {t(`payment.${sale.paymentMethod}`)}
          </span>
        )
      },
    },
    {
      key: 'total',
      header: t('common.total'),
      align: 'right',
      sortable: true,
      render: (sale) => (
        <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
          {money(sale.total)}
        </span>
      ),
    },
    {
      key: 'status',
      header: t('common.status'),
      sortable: true,
      render: (sale) => (
        <StatusBadge status={sale.status}>{t(`status.${sale.status}`)}</StatusBadge>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (sale) => (
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
          {(close) => (
            <div>
              <DropdownItem
                icon={Eye}
                onClick={() => {
                  setViewingId(sale.id)
                  close()
                }}
              >
                {t('common.viewDetails')}
              </DropdownItem>
              <DropdownItem
                icon={Printer}
                onClick={() => {
                  setReceiptSale(sale)
                  close()
                }}
              >
                {t('common.printReceipt')}
              </DropdownItem>
              {canRefund && sale.status === 'completed' && (
                <DropdownItem
                  icon={RotateCcw}
                  danger
                  onClick={() => {
                    setRefunding(sale)
                    close()
                  }}
                >
                  {t('sales.refundSale')}
                </DropdownItem>
              )}
            </div>
          )}
        </Dropdown>
      ),
    },
  ]

  return (
    <div className="space-y-5">
      <PageHeader
        title={t('sales.title')}
        description={canSeeAll ? t('sales.subtitle') : t('sales.subtitleCashier')}
        badge={
          <Badge tone="indigo">
            {t('common.countItems', { count: scopedSales.length })}
          </Badge>
        }
        actions={
          <Button variant="outline" leftIcon={Download} onClick={exportCSV} disabled={!rows.length}>
            {t('common.export')}
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard
          label={t('sales.revenue')}
          value={money(stats.revenue)}
          icon={Wallet}
          tone="indigo"
          hint={t('sales.completedOrders', { count: stats.orders })}
          loading={!ready}
        />
        <StatCard
          label={t('sales.itemsSold')}
          value={formatNumber(stats.items)}
          icon={ShoppingBag}
          tone="emerald"
          hint={t('sales.averageOrder', { amount: money(stats.averageOrder) })}
          loading={!ready}
        />
        <StatCard
          label={t('sales.totalProfit')}
          value={money(stats.profit)}
          icon={TrendingUp}
          tone="violet"
          hint={t('sales.marginHint', {
            value: stats.revenue ? ((stats.profit / stats.revenue) * 100).toFixed(1) : '0.0',
          })}
          loading={!ready}
        />
        <StatCard
          label={t('sales.refundedAmount')}
          value={money(stats.refundedAmount)}
          icon={RotateCcw}
          tone="rose"
          hint={t('sales.refundedHint', { count: stats.refundedCount })}
          loading={!ready}
        />
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white px-3.5 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
        <Tabs
          items={tabs}
          value={tab}
          onChange={setTab}
          className="overflow-x-auto"
        />
        <Select
          value={range}
          onChange={(event) => setRange(event.target.value)}
          aria-label={t('sales.dateRange')}
          className="h-9 min-w-[150px] text-xs"
          options={rangeKeys.map((key) => ({ value: key, label: t(`range.${key}`) }))}
        />
      </div>

      <Card>
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 dark:border-slate-800 lg:flex-row lg:items-center">
          <SearchInput
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('sales.searchPlaceholder')}
            className="lg:max-w-sm"
          />
          <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
            <Select
              value={filters.paymentMethod}
              onChange={(event) => setFilter('paymentMethod', event.target.value)}
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
              disabled={!query && filters.paymentMethod === 'all'}
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
          initialSort={{ key: 'number', dir: 'desc' }}
          onRowClick={(sale) => setViewingId(sale.id)}
          emptyIcon={Receipt}
          emptyTitle={t('sales.noSales')}
          emptyDescription={t('sales.noSalesHint')}
        />
      </Card>

      <Modal
        open={Boolean(viewing)}
        onClose={() => setViewingId(null)}
        title={viewing?.number || t('sales.saleDetails')}
        description={
          viewing
            ? `${viewing.customerName} · ${formatDateTime(viewing.createdAt)}`
            : undefined
        }
        icon={ReceiptText}
        size="lg"
        footer={
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
            <Button variant="outline" onClick={() => setViewingId(null)}>
              {t('common.close')}
            </Button>
            <div className="flex flex-wrap gap-2">
              {canRefund && viewing?.status === 'completed' && (
                <Button
                  variant="ghost"
                  leftIcon={RotateCcw}
                  onClick={() => setRefunding(viewing)}
                >
                  {t('sales.refundSale')}
                </Button>
              )}
              {viewing && (
                <Button leftIcon={Printer} onClick={() => setReceiptSale(viewing)}>
                  {t('common.printReceipt')}
                </Button>
              )}
            </div>
          </div>
        }
      >
        {viewing && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/30">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
                  <ReceiptText className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {viewing.customerName}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {t('sales.byCashier', { name: viewing.cashierName })} ·{' '}
                    {t('sales.itemCount', { count: viewingItems })}
                  </p>
                </div>
              </div>
              <StatusBadge status={viewing.status}>{t(`status.${viewing.status}`)}</StatusBadge>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-400 dark:bg-slate-800/50">
                  <tr>
                    <th className="px-3.5 py-2 font-semibold">{t('sales.item')}</th>
                    <th className="px-3 py-2 text-center font-semibold">{t('sales.qty')}</th>
                    <th className="px-3 py-2 text-right font-semibold">{t('sales.price')}</th>
                    <th className="px-3.5 py-2 text-right font-semibold">{t('common.total')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {(viewing.items || []).map((item) => (
                    <tr key={`${item.productId}-${item.name}`}>
                      <td className="px-3.5 py-2.5">
                        <span className="flex items-center gap-2">
                          <span className="text-base leading-none">{item.emoji || '📦'}</span>
                          <span className="font-medium text-slate-700 dark:text-slate-200">
                            {item.name}
                          </span>
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-center tabular-nums text-slate-500 dark:text-slate-400">
                        {item.qty}
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-slate-500 dark:text-slate-400">
                        {money(item.price)}
                      </td>
                      <td className="px-3.5 py-2.5 text-right font-semibold text-slate-800 dark:text-slate-100">
                        {money(Number(item.price) * Number(item.qty))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5 rounded-xl border border-slate-200/80 px-3.5 py-3 text-xs dark:border-slate-800">
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>{t('receipt.subtotal')}</span>
                  <span className="tabular-nums">{money(viewing.subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>{t('receipt.discount')}</span>
                  <span className="tabular-nums">−{money(viewing.discount)}</span>
                </div>
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>
                    {t('receipt.tax')} ({viewing.taxRate ?? 0}%)
                  </span>
                  <span className="tabular-nums">{money(viewing.tax)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-100 pt-1.5 text-sm font-bold text-slate-900 dark:border-slate-800 dark:text-white">
                  <span>{t('common.total')}</span>
                  <span className="tabular-nums">{money(viewing.total)}</span>
                </div>
              </div>

              <div className="space-y-1.5 rounded-xl bg-slate-50 px-3.5 py-3 text-xs dark:bg-slate-800/50">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span>{t('payment.method')}</span>
                  <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-200">
                    {(() => {
                      const Icon = paymentIcons[viewing.paymentMethod] || CreditCard
                      return <Icon className="h-3.5 w-3.5" />
                    })()}
                    {t(`payment.${viewing.paymentMethod}`)}
                  </span>
                </div>
                {viewing.paymentMethod === 'cash' && (
                  <>
                    <div className="flex justify-between text-slate-500 dark:text-slate-400">
                      <span>{t('receipt.cashReceived')}</span>
                      <span className="tabular-nums">{money(viewing.cashReceived)}</span>
                    </div>
                    <div className="flex justify-between text-slate-500 dark:text-slate-400">
                      <span>{t('receipt.change')}</span>
                      <span className="tabular-nums">{money(viewing.change)}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>{t('common.date')}</span>
                  <span>{formatDate(viewing.createdAt)}</span>
                </div>
                {viewing.refundedAt && (
                  <div className="flex justify-between text-rose-600 dark:text-rose-400">
                    <span>{t('sales.refundedOn')}</span>
                    <span>{formatDate(viewing.refundedAt)}</span>
                  </div>
                )}
              </div>
            </div>

            {viewing.note && (
              <p className="rounded-xl bg-amber-50/80 px-3.5 py-3 text-xs leading-relaxed text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                {viewing.note}
              </p>
            )}

            <p
              className={cn(
                'flex items-start gap-2 rounded-xl px-3.5 py-3 text-[11px] leading-relaxed',
                viewing.status === 'completed'
                  ? 'bg-emerald-50/80 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
                  : viewing.status === 'refunded'
                    ? 'bg-rose-50/80 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300'
                    : 'bg-amber-50/80 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
              )}
            >
              <ReceiptText className="mt-0.5 h-4 w-4 shrink-0" />
              {t(`sales.statusNote.${viewing.status}`)}
            </p>
          </div>
        )}
      </Modal>

      <ReceiptModal
        open={Boolean(receiptSale)}
        onClose={() => setReceiptSale(null)}
        sale={receiptSale}
      />

      <ConfirmDialog
        open={Boolean(refunding)}
        onClose={() => setRefunding(null)}
        onConfirm={handleRefund}
        title={t('sales.refundTitle')}
        description={t('sales.refundDescription', {
          number: refunding?.number || '',
          amount: money(refunding?.total || 0),
        })}
        confirmLabel={t('sales.refundSale')}
      />
    </div>
  )
}
