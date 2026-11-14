import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import {
  BarChart3,
  Crown,
  Download,
  DollarSign,
  Layers,
  Percent,
  Printer,
  Receipt,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { PageHeader } from '../../components/ui/PageHeader'
import { StatCard } from '../../components/ui/StatCard'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Tabs } from '../../components/ui/Tabs'
import { EmptyState } from '../../components/ui/EmptyState'
import { ChartSkeleton } from '../../components/ui/Skeleton'
import { ChartTooltip } from '../../components/charts/ChartTooltip'
import { useDataStore } from '../../store/useDataStore'
import { useAppStore } from '../../store/useAppStore'
import { useCurrency } from '../../hooks/useCurrency'
import { useDelayedReady } from '../../hooks/useDelayedReady'
import {
  REPORT_RANGES,
  buildSeries,
  completedSales,
  filterByRange,
  getCategoryPerformance,
  getKpis,
  getPaymentBreakdown,
  getTopProducts,
  percentageChange,
  previousRange,
  resolveRange,
} from '../../utils/analytics'
import { downloadCSV } from '../../utils/csv'
import {
  formatCompactCurrency,
  formatDate,
  formatNumber,
  formatPercent,
} from '../../utils/format'
import { cn } from '../../utils/cn'

const paymentColors = { cash: '#6366f1', qr: '#10b981', card: '#8b5cf6' }
const palette = ['#6366f1', '#10b981', '#8b5cf6', '#f59e0b', '#0ea5e9', '#f43f5e', '#14b8a6']

export function Reports() {
  const { t } = useTranslation()
  const money = useCurrency()
  const currency = useAppStore((state) => state.settings.currency)
  const sales = useDataStore((state) => state.sales)
  const products = useDataStore((state) => state.products)
  const categories = useDataStore((state) => state.categories)
  const ready = useDelayedReady(300)

  const [range, setRange] = useState('last30')
  const [granularity, setGranularity] = useState('daily')

  const rangeSales = useMemo(() => filterByRange(sales, range), [sales, range])
  const previousSales = useMemo(
    () => filterByRange(sales, previousRange(range)),
    [sales, range],
  )

  const kpis = useMemo(() => getKpis(rangeSales), [rangeSales])
  const prevKpis = useMemo(() => getKpis(previousSales), [previousSales])
  const series = useMemo(
    () => buildSeries(rangeSales, resolveRange(range), granularity),
    [rangeSales, range, granularity],
  )
  const payments = useMemo(() => getPaymentBreakdown(rangeSales), [rangeSales])
  const topProducts = useMemo(() => getTopProducts(rangeSales, 6), [rangeSales])
  const categoryPerformance = useMemo(
    () => getCategoryPerformance(rangeSales, products, categories).slice(0, 6),
    [rangeSales, products, categories],
  )

  const topCustomers = useMemo(() => {
    const map = new Map()
    completedSales(rangeSales).forEach((sale) => {
      const key = sale.customerId || sale.customerName
      const entry = map.get(key) || {
        name: sale.customerName,
        orders: 0,
        total: 0,
        items: 0,
      }
      entry.orders += 1
      entry.total += Number(sale.total || 0)
      entry.items += (sale.items || []).reduce((sum, item) => sum + Number(item.qty || 0), 0)
      map.set(key, entry)
    })
    return Array.from(map.values())
      .filter((entry) => entry.name && entry.name !== 'Walk-in Customer')
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
  }, [rangeSales])

  const summary = useMemo(() => {
    const completed = completedSales(rangeSales)
    return {
      subtotal: completed.reduce((sum, sale) => sum + Number(sale.subtotal || 0), 0),
      discount: completed.reduce((sum, sale) => sum + Number(sale.discount || 0), 0),
      tax: completed.reduce((sum, sale) => sum + Number(sale.tax || 0), 0),
      profit: completed.reduce((sum, sale) => sum + Number(sale.profit || 0), 0),
      items: completed.reduce(
        (sum, sale) =>
          sum + (sale.items || []).reduce((qty, item) => qty + Number(item.qty || 0), 0),
        0,
      ),
    }
  }, [rangeSales])

  const paymentTotal = payments.reduce((sum, entry) => sum + entry.amount, 0)
  const paymentChartData = payments.map((entry, index) => ({
    ...entry,
    name: t(`payment.${entry.method}`),
    value: entry.amount,
    color: paymentColors[entry.method] || palette[index % palette.length],
  }))

  const categoryChartData = categoryPerformance.map((entry, index) => ({
    ...entry,
    shortName: entry.name.length > 18 ? `${entry.name.slice(0, 17)}…` : entry.name,
    color: palette[index % palette.length],
  }))

  const bestDay = series.reduce(
    (best, point) => (point.revenue > (best?.revenue || 0) ? point : best),
    null,
  )
  const margin = kpis.revenue ? (kpis.profit / kpis.revenue) * 100 : 0
  const revenueDelta = percentageChange(kpis.revenue, prevKpis.revenue)
  const profitDelta = percentageChange(kpis.profit, prevKpis.profit)
  const ordersDelta = percentageChange(kpis.orders, prevKpis.orders)
  const averageDelta = percentageChange(kpis.averageOrder, prevKpis.averageOrder)
  const totalCustomers = new Set(
    completedSales(rangeSales).map((sale) => sale.customerId || sale.customerName),
  ).size

  const rangeItems = REPORT_RANGES.map((key) => ({ key, label: t(`range.${key}`) }))
  const granularityItems = ['daily', 'weekly', 'monthly'].map((key) => ({
    key,
    label: t(`common.${key}`),
  }))

  function exportCSV() {
    const rows = rangeSales
      .slice()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    downloadCSV(
      `smartpos-report-${range}`,
      [
        { label: t('sales.invoice'), key: 'number' },
        { label: t('common.date'), value: (row) => formatDate(row.createdAt) },
        { label: t('common.customer'), key: 'customerName' },
        { label: t('sales.cashier'), key: 'cashierName' },
        {
          label: t('sales.itemsSold'),
          value: (row) =>
            (row.items || []).reduce((sum, item) => sum + Number(item.qty || 0), 0),
        },
        { label: t('receipt.subtotal'), key: 'subtotal' },
        { label: t('receipt.discount'), key: 'discount' },
        { label: t('receipt.tax'), key: 'tax' },
        { label: t('common.total'), key: 'total' },
        { label: t('sales.profit'), key: 'profit' },
        { label: t('payment.method'), value: (row) => t(`payment.${row.paymentMethod}`) },
        { label: t('common.status'), value: (row) => t(`status.${row.status}`) },
      ],
      rows,
    )
    toast.success(t('common.exported'))
  }

  return (
    <div className="print-area space-y-5">
      <PageHeader
        title={t('reports.title')}
        description={t('reports.subtitle')}
        badge={<Badge tone="violet">{t(`range.${range}`)}</Badge>}
        actions={
          <div className="no-print flex flex-wrap items-center gap-2">
            <Button variant="outline" leftIcon={Printer} onClick={() => window.print()}>
              {t('reports.printReport')}
            </Button>
            <Button
              variant="outline"
              leftIcon={Download}
              onClick={exportCSV}
              disabled={!rangeSales.length}
            >
              {t('common.export')}
            </Button>
          </div>
        }
      />

      <div className="no-print flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white px-3.5 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-200">
            {t('reports.period', {
              from: formatDate(resolveRange(range).start),
              to: formatDate(resolveRange(range).end),
            })}
          </p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500">
            {t('reports.generated', { date: formatDate(new Date()) })}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Tabs items={rangeItems} value={range} onChange={setRange} />
          <Tabs items={granularityItems} value={granularity} onChange={setGranularity} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard
          label={t('dashboard.totalRevenue')}
          value={money(kpis.revenue)}
          icon={DollarSign}
          tone="indigo"
          delta={revenueDelta}
          hint={t('reports.vsPreviousRange')}
          loading={!ready}
        />
        <StatCard
          label={t('dashboard.totalProfit')}
          value={money(kpis.profit)}
          icon={TrendingUp}
          tone="emerald"
          delta={profitDelta}
          hint={t('dashboard.margin', { value: margin.toFixed(1) })}
          loading={!ready}
        />
        <StatCard
          label={t('dashboard.totalSales')}
          value={formatNumber(kpis.orders)}
          icon={ShoppingBag}
          tone="violet"
          delta={ordersDelta}
          hint={t('reports.itemsSold', { count: formatNumber(kpis.items) })}
          loading={!ready}
        />
        <StatCard
          label={t('dashboard.avgOrder')}
          value={money(kpis.averageOrder)}
          icon={Receipt}
          tone="amber"
          delta={averageDelta}
          hint={t('reports.customersServed', { count: totalCustomers })}
          loading={!ready}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader
            title={t('reports.revenueTrend')}
            subtitle={t('reports.revenueTrendHint')}
            icon={BarChart3}
          />
          <div className="p-4 sm:p-5">
            {!ready ? (
              <ChartSkeleton height="h-[300px]" />
            ) : series.every((point) => point.revenue === 0) ? (
              <EmptyState
                icon={BarChart3}
                title={t('reports.noData')}
                description={t('reports.noDataHint')}
                compact
              />
            ) : (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="reportRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity={0.28} />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="reportProfit" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.2} />
                        <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#94a3b8"
                      strokeOpacity={0.18}
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10, fill: '#94a3b8' }}
                      axisLine={false}
                      tickLine={false}
                      minTickGap={26}
                      dy={8}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: '#94a3b8' }}
                      axisLine={false}
                      tickLine={false}
                      width={56}
                      tickFormatter={(value) => formatCompactCurrency(value, currency)}
                    />
                    <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#c7d2fe' }} />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      name={t('dashboard.revenue')}
                      stroke="#6366f1"
                      strokeWidth={2.5}
                      fill="url(#reportRevenue)"
                      activeDot={{ r: 4, strokeWidth: 2, stroke: '#fff' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="profit"
                      name={t('dashboard.profit')}
                      stroke="#10b981"
                      strokeWidth={1.8}
                      fill="url(#reportProfit)"
                      activeDot={{ r: 3, strokeWidth: 2, stroke: '#fff' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader
            title={t('dashboard.paymentMethods')}
            subtitle={t('reports.paymentMixHint')}
            icon={Percent}
          />
          <CardBody>
            {!ready ? (
              <ChartSkeleton height="h-[250px]" />
            ) : paymentChartData.length === 0 ? (
              <EmptyState
                icon={Receipt}
                title={t('dashboard.noPayments')}
                description={t('dashboard.noPaymentsHint')}
                compact
              />
            ) : (
              <>
                <div className="relative mx-auto h-[190px] w-full max-w-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={paymentChartData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={56}
                        outerRadius={82}
                        paddingAngle={4}
                        stroke="none"
                      >
                        {paymentChartData.map((entry) => (
                          <Cell key={entry.method} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<ChartTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                      {t('reports.totalCollected')}
                    </span>
                    <span className="text-lg font-bold text-slate-900 dark:text-white">
                      {money(paymentTotal)}
                    </span>
                  </div>
                </div>
                <div className="mt-3 space-y-2.5">
                  {paymentChartData.map((entry) => {
                    const share = paymentTotal ? (entry.amount / paymentTotal) * 100 : 0
                    return (
                      <div key={entry.method} className="flex items-center gap-2.5">
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: entry.color }}
                        />
                        <span className="flex-1 text-xs font-medium text-slate-600 dark:text-slate-300">
                          {entry.name}
                        </span>
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                          {money(entry.amount)}
                        </span>
                        <span className="w-9 text-right text-[10px] text-slate-400">
                          {share.toFixed(0)}%
                        </span>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader
            title={t('reports.topProducts')}
            subtitle={t('reports.topProductsHint')}
            icon={Crown}
          />
          <CardBody>
            {!ready ? (
              <ChartSkeleton height="h-[280px]" />
            ) : topProducts.length === 0 ? (
              <EmptyState
                icon={Crown}
                title={t('reports.noProductSales')}
                description={t('reports.noProductSalesHint')}
                compact
              />
            ) : (
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topProducts.map((product) => ({
                      ...product,
                      shortName:
                        product.name.length > 20
                          ? `${product.name.slice(0, 19)}…`
                          : product.name,
                    }))}
                    layout="vertical"
                    margin={{ top: 4, right: 12, left: 8, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      horizontal={false}
                      stroke="#94a3b8"
                      strokeOpacity={0.18}
                    />
                    <XAxis
                      type="number"
                      tick={{ fontSize: 10, fill: '#94a3b8' }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value) => formatCompactCurrency(value, currency)}
                    />
                    <YAxis
                      type="category"
                      dataKey="shortName"
                      tick={{ fontSize: 10, fill: '#94a3b8' }}
                      axisLine={false}
                      tickLine={false}
                      width={112}
                    />
                    <Tooltip content={<ChartTooltip />} cursor={{ fill: '#6366f1', opacity: 0.05 }} />
                    <Bar dataKey="revenue" name={t('dashboard.revenue')} radius={[0, 6, 6, 0]} maxBarSize={22}>
                      {topProducts.map((product, index) => (
                        <Cell key={product.productId} fill={palette[index % palette.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title={t('reports.insights')}
            subtitle={t('reports.insightsHint')}
            icon={Sparkles}
          />
          <CardBody className="space-y-3">
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/70 p-3.5 dark:border-indigo-500/20 dark:bg-indigo-500/10">
              <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-indigo-600 dark:text-indigo-300">
                <Sparkles className="h-3.5 w-3.5" />
                {t('reports.bestDay')}
              </p>
              <p className="mt-1.5 text-sm font-bold text-slate-900 dark:text-white">
                {bestDay?.name || '—'}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {t('reports.bestDayValue', {
                  amount: money(bestDay?.revenue || 0),
                  orders: bestDay?.orders || 0,
                })}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-200/80 p-3 dark:border-slate-800">
                <p className="text-[10px] uppercase tracking-wide text-slate-400">
                  {t('receipt.subtotal')}
                </p>
                <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                  {money(summary.subtotal)}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200/80 p-3 dark:border-slate-800">
                <p className="text-[10px] uppercase tracking-wide text-slate-400">
                  {t('receipt.discount')}
                </p>
                <p className="mt-1 text-sm font-bold text-rose-600 dark:text-rose-400">
                  −{money(summary.discount)}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200/80 p-3 dark:border-slate-800">
                <p className="text-[10px] uppercase tracking-wide text-slate-400">
                  {t('receipt.tax')}
                </p>
                <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                  {money(summary.tax)}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200/80 p-3 dark:border-slate-800">
                <p className="text-[10px] uppercase tracking-wide text-slate-400">
                  {t('reports.unitsSold')}
                </p>
                <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                  {formatNumber(summary.items)}
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-emerald-50/80 px-3.5 py-3 text-[11px] leading-relaxed text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
              {t('reports.marginNote', {
                margin: margin.toFixed(1),
                delta: formatPercent(profitDelta),
              })}
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader
            title={t('reports.categoryPerformance')}
            subtitle={t('reports.categoryPerformanceHint')}
            icon={Layers}
          />
          <CardBody>
            {categoryChartData.length === 0 ? (
              <EmptyState
                icon={Layers}
                title={t('reports.noCategoryData')}
                description={t('reports.noCategoryDataHint')}
                compact
              />
            ) : (
              <div className="space-y-4">
                {categoryChartData.map((entry) => {
                  const share = summary.subtotal ? (entry.revenue / summary.subtotal) * 100 : 0
                  return (
                    <div key={entry.id}>
                      <div className="flex items-center justify-between gap-3 text-xs">
                        <span className="flex min-w-0 items-center gap-2 font-medium text-slate-700 dark:text-slate-200">
                          <span
                            className="h-2 w-2 shrink-0 rounded-full"
                            style={{ backgroundColor: entry.color }}
                          />
                          <span className="truncate">{entry.name}</span>
                          <span className="text-[10px] text-slate-400">
                            {t('reports.unitsCount', { count: entry.qty })}
                          </span>
                        </span>
                        <span className="flex shrink-0 items-center gap-2">
                          <span className="font-semibold text-slate-800 dark:text-slate-100">
                            {money(entry.revenue)}
                          </span>
                          <span className="w-9 text-right text-[10px] text-slate-400">
                            {share.toFixed(0)}%
                          </span>
                        </span>
                      </div>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${share}%`, backgroundColor: entry.color }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title={t('reports.topCustomers')}
            subtitle={t('reports.topCustomersHint')}
            icon={Users}
          />
          <CardBody>
            {topCustomers.length === 0 ? (
              <EmptyState
                icon={Users}
                title={t('reports.noCustomerData')}
                description={t('reports.noCustomerDataHint')}
                compact
              />
            ) : (
              <div className="space-y-1">
                {topCustomers.map((customer, index) => (
                  <div
                    key={`${customer.name}-${index}`}
                    className="flex items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <span
                      className={cn(
                        'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold',
                        index === 0
                          ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300'
                          : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
                      )}
                    >
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-slate-800 dark:text-slate-100">
                        {customer.name}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {t('reports.orderCount', { count: customer.orders })}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                      {money(customer.total)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      <p className="print-only text-[10px] text-slate-500">
        SmartPOS · {t('reports.generated', { date: formatDate(new Date()) })}
      </p>
    </div>
  )
}
