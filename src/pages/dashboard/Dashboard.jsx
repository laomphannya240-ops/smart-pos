import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  AlertTriangle,
  Banknote,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  DollarSign,
  Package,
  Plus,
  QrCode,
  ShoppingBag,
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
import { Card, CardHeader } from '../../components/ui/Card'
import { Tabs } from '../../components/ui/Tabs'
import { Badge, StatusBadge } from '../../components/ui/Badge'
import { ProductThumb } from '../../components/ui/ProductThumb'
import { EmptyState } from '../../components/ui/EmptyState'
import { ChartSkeleton } from '../../components/ui/Skeleton'
import { ChartTooltip } from '../../components/charts/ChartTooltip'
import { ActivityItem } from '../../components/common/ActivityItem'
import { useDataStore } from '../../store/useDataStore'
import { useAppStore } from '../../store/useAppStore'
import { useCurrency } from '../../hooks/useCurrency'
import { useDelayedReady } from '../../hooks/useDelayedReady'
import {
  DASHBOARD_RANGES,
  buildSeries,
  filterByRange,
  getKpis,
  getPaymentBreakdown,
  getTopProducts,
  isWithin,
  percentageChange,
  previousRange,
  resolveRange,
} from '../../utils/analytics'
import {
  formatCompactCurrency,
  formatDate,
  formatDateTime,
  formatTime,
} from '../../utils/format'
import { buttonStyles } from '../../components/ui/Button'

const paymentIcons = { cash: Banknote, qr: QrCode, card: CreditCard }
const paymentColors = { cash: '#6366f1', qr: '#10b981', card: '#8b5cf6' }
const donutColors = ['#6366f1', '#10b981', '#8b5cf6', '#f59e0b']

export function Dashboard() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const money = useCurrency()
  const session = useAppStore((state) => state.session)
  const currency = useAppStore((state) => state.settings.currency)
  const sales = useDataStore((state) => state.sales)
  const products = useDataStore((state) => state.products)
  const customers = useDataStore((state) => state.customers)
  const activities = useDataStore((state) => state.activities)

  const [range, setRange] = useState('last7')
  const [granularity, setGranularity] = useState('daily')
  const [metric, setMetric] = useState('revenue')
  const ready = useDelayedReady(320)

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
  const topProducts = useMemo(() => getTopProducts(rangeSales, 5), [rangeSales])
  const lowStock = useMemo(
    () =>
      products
        .filter((product) => product.status === 'active' && product.stock <= product.minStock)
        .sort((a, b) => a.stock - b.stock),
    [products],
  )
  const outOfStock = lowStock.filter((product) => product.stock === 0)
  const recentSales = useMemo(
    () =>
      [...rangeSales].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6),
    [rangeSales],
  )
  const newCustomers = customers.filter((customer) =>
    isWithin(customer.createdAt, resolveRange('thisMonth')),
  ).length

  const greeting =
    new Date().getHours() < 12
      ? 'morning'
      : new Date().getHours() < 18
        ? 'afternoon'
        : 'evening'

  const revenueDelta = percentageChange(kpis.revenue, prevKpis.revenue)
  const ordersDelta = percentageChange(kpis.orders, prevKpis.orders)
  const profitDelta = percentageChange(kpis.profit, prevKpis.profit)
  const margin = kpis.revenue ? (kpis.profit / kpis.revenue) * 100 : 0
  const paymentTotal = payments.reduce((sum, item) => sum + item.amount, 0)

  const paymentChartData = payments.map((entry) => ({
    ...entry,
    name: t(`payment.${entry.method}`),
    value: entry.amount,
    color: paymentColors[entry.method] || '#94a3b8',
  }))

  const topChartData = topProducts.map((product) => ({
    ...product,
    shortName:
      product.name.length > 17 ? `${product.name.slice(0, 16)}…` : product.name,
  }))

  const rangeItems = DASHBOARD_RANGES.map((key) => ({
    key,
    label: t(`range.${key}`),
  }))

  const granularityItems = ['daily', 'weekly', 'monthly'].map((key) => ({
    key,
    label: t(`common.${key}`),
  }))

  return (
    <div className="space-y-5">
      <PageHeader
        title={t(`dashboard.greeting.${greeting}`, {
          name: session?.name?.split(' ')[0] || '',
        })}
        description={`${new Intl.DateTimeFormat(i18n.language === 'km' ? 'km-KH' : 'en-GB', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }).format(new Date())} · ${t('dashboard.subtitle')}`}
        actions={
          <>
            <Link
              to="/reports"
              className={buttonStyles({ variant: 'outline', size: 'md' })}
            >
              <BarChart3 className="h-4 w-4" />
              {t('dashboard.viewReports')}
            </Link>
            <Link to="/pos" className={buttonStyles({ variant: 'primary', size: 'md' })}>
              <Plus className="h-4 w-4" />
              {t('dashboard.newSale')}
            </Link>
          </>
        }
      />

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white px-3.5 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
            <CalendarDays className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-200">
              {t('dashboard.rangeLabel')}
            </p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">
              {formatDate(resolveRange(range).start)} —{' '}
              {formatDate(resolveRange(range).end)}
            </p>
          </div>
        </div>
        <Tabs items={rangeItems} value={range} onChange={setRange} />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          label={t('dashboard.totalRevenue')}
          value={money(kpis.revenue)}
          icon={DollarSign}
          tone="indigo"
          delta={revenueDelta}
          hint={t('dashboard.vsPrevious')}
          loading={!ready}
        />
        <StatCard
          label={t('dashboard.totalSales')}
          value={kpis.orders}
          icon={ShoppingBag}
          tone="violet"
          delta={ordersDelta}
          hint={t('dashboard.avgOrder', { amount: money(kpis.averageOrder) })}
          loading={!ready}
        />
        <StatCard
          label={t('dashboard.totalProducts')}
          value={products.length}
          icon={Package}
          tone="sky"
          hint={t('dashboard.activeCatalog')}
          loading={!ready}
        />
        <StatCard
          label={t('dashboard.totalCustomers')}
          value={customers.length}
          icon={Users}
          tone="emerald"
          hint={t('dashboard.newThisMonth', { count: newCustomers })}
          loading={!ready}
        />
        <StatCard
          label={t('dashboard.lowStockProducts')}
          value={lowStock.length}
          icon={AlertTriangle}
          tone="amber"
          hint={t('dashboard.outOfStockCount', { count: outOfStock.length })}
          loading={!ready}
          onClick={() => navigate('/inventory')}
        />
        <StatCard
          label={t('dashboard.totalProfit')}
          value={money(kpis.profit)}
          icon={TrendingUp}
          tone="orange"
          delta={profitDelta}
          hint={t('dashboard.margin', { value: margin.toFixed(1) })}
          loading={!ready}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader
            title={t('dashboard.revenueOverview')}
            subtitle={t('dashboard.revenueOverviewHint')}
            action={
              <div className="flex flex-wrap items-center gap-2">
                <Tabs
                  items={[
                    { key: 'revenue', label: t('dashboard.seriesRevenue') },
                    { key: 'orders', label: t('dashboard.seriesOrders') },
                  ]}
                  value={metric}
                  onChange={setMetric}
                />
                <Tabs
                  items={granularityItems}
                  value={granularity}
                  onChange={setGranularity}
                />
              </div>
            }
          />
          <div className="p-4 sm:p-5">
            {!ready ? (
              <ChartSkeleton height="h-[290px]" />
            ) : (
              <div className="h-[290px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  {metric === 'revenue' ? (
                    <AreaChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#6366f1" stopOpacity={0.25} />
                          <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="profitFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity={0.16} />
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
                        width={54}
                        tickFormatter={(value) =>
                          formatCompactCurrency(value, currency)
                        }
                      />
                      <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#c7d2fe' }} />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        name={t('dashboard.revenue')}
                        stroke="#6366f1"
                        strokeWidth={2.5}
                        fill="url(#revenueFill)"
                        activeDot={{ r: 4, strokeWidth: 2, stroke: '#fff' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="profit"
                        name={t('dashboard.profit')}
                        stroke="#10b981"
                        strokeWidth={1.8}
                        fill="url(#profitFill)"
                        activeDot={{ r: 3, strokeWidth: 2, stroke: '#fff' }}
                      />
                    </AreaChart>
                  ) : (
                    <BarChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
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
                        width={32}
                        allowDecimals={false}
                      />
                      <Tooltip content={<ChartTooltip />} cursor={{ fill: '#6366f1', opacity: 0.06 }} />
                      <Bar
                        dataKey="orders"
                        name={t('dashboard.orders')}
                        fill="#6366f1"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={34}
                      />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader
            title={t('dashboard.paymentMethods')}
            subtitle={t('dashboard.paymentMethodsHint')}
          />
          <div className="p-5">
            {!ready ? (
              <ChartSkeleton height="h-[250px]" />
            ) : paymentChartData.length === 0 ? (
              <EmptyState
                icon={CreditCard}
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
                        innerRadius={58}
                        outerRadius={82}
                        paddingAngle={4}
                        stroke="none"
                      >
                        {paymentChartData.map((entry, index) => (
                          <Cell
                            key={entry.method}
                            fill={entry.color || donutColors[index % donutColors.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<ChartTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                      {t('dashboard.total')}
                    </span>
                    <span className="text-lg font-bold text-slate-900 dark:text-white">
                      {money(paymentTotal)}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {t('dashboard.ordersCount', { count: kpis.orders })}
                    </span>
                  </div>
                </div>

                <div className="mt-3 space-y-2.5">
                  {paymentChartData.map((entry) => {
                    const Icon = paymentIcons[entry.method] || CreditCard
                    const share = paymentTotal ? (entry.amount / paymentTotal) * 100 : 0
                    return (
                      <div key={entry.method} className="flex items-center gap-2.5">
                        <span
                          className="flex h-8 w-8 items-center justify-center rounded-lg"
                          style={{
                            backgroundColor: `${entry.color}18`,
                            color: entry.color,
                          }}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-medium text-slate-600 dark:text-slate-300">
                              {entry.name}
                            </span>
                            <span className="font-semibold text-slate-900 dark:text-white">
                              {money(entry.amount)}
                            </span>
                          </div>
                          <div className="mt-1 flex items-center gap-2">
                            <div className="h-1 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${share}%`,
                                  backgroundColor: entry.color,
                                }}
                              />
                            </div>
                            <span className="text-[10px] text-slate-400">
                              {share.toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader
            title={t('dashboard.recentTransactions')}
            subtitle={t('dashboard.recentTransactionsHint')}
            action={
              <Link
                to="/sales"
                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
              >
                {t('dashboard.viewAll')}
              </Link>
            }
          />
          {recentSales.length === 0 ? (
            <EmptyState
              icon={ShoppingBag}
              title={t('dashboard.noSales')}
              description={t('dashboard.noSalesHint')}
              compact
            />
          ) : (
            <>
              <div className="divide-y divide-slate-100 md:hidden dark:divide-slate-800">
                {recentSales.map((sale) => {
                  const Icon = paymentIcons[sale.paymentMethod] || CreditCard
                  return (
                    <button
                      key={sale.id}
                      type="button"
                      onClick={() => navigate('/sales')}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left transition active:bg-slate-50 dark:active:bg-slate-800/40"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-slate-800 dark:text-slate-100">
                          {sale.number}
                        </p>
                        <p className="truncate text-[10px] text-slate-400 dark:text-slate-500">
                          {sale.customerName} · {formatTime(sale.createdAt)}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-xs font-semibold text-slate-900 dark:text-white">
                          {money(sale.total)}
                        </p>
                        <div className="mt-1 flex justify-end">
                          <StatusBadge status={sale.status}>
                            {t(`status.${sale.status}`)}
                          </StatusBadge>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>

              <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[560px]">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:text-slate-500">
                    <th className="py-2.5 pl-5 pr-3 font-semibold">{t('sales.invoice')}</th>
                    <th className="px-3 py-2.5 font-semibold">{t('common.customer')}</th>
                    <th className="px-3 py-2.5 font-semibold">{t('payment.method')}</th>
                    <th className="px-3 py-2.5 text-right font-semibold">{t('common.total')}</th>
                    <th className="px-3 py-2.5 font-semibold">{t('common.status')}</th>
                    <th className="py-2.5 pl-3 pr-5 text-right font-semibold">
                      {t('common.time')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {recentSales.map((sale) => {
                    const Icon = paymentIcons[sale.paymentMethod] || CreditCard
                    return (
                      <tr
                        key={sale.id}
                        onClick={() => navigate('/sales')}
                        className="cursor-pointer transition hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                      >
                        <td className="py-3 pl-5 pr-3">
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                            {sale.number}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {formatDate(sale.createdAt)}
                          </p>
                        </td>
                        <td className="max-w-[150px] truncate px-3 py-3 text-xs text-slate-600 dark:text-slate-300">
                          {sale.customerName}
                        </td>
                        <td className="px-3 py-3">
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                            <Icon className="h-3.5 w-3.5" />
                            {t(`payment.${sale.paymentMethod}`)}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-right text-xs font-semibold text-slate-900 dark:text-white">
                          {money(sale.total)}
                        </td>
                        <td className="px-3 py-3">
                          <StatusBadge status={sale.status}>
                            {t(`status.${sale.status}`)}
                          </StatusBadge>
                        </td>
                        <td className="py-3 pl-3 pr-5 text-right text-[10px] text-slate-400">
                          {formatTime(sale.createdAt)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              </div>
            </>
          )}
        </Card>

        <Card>
          <CardHeader
            title={t('dashboard.lowStockAlerts')}
            subtitle={t('dashboard.lowStockHint', { count: lowStock.length })}
            action={
              <Link
                to="/inventory"
                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
              >
                {t('dashboard.manage')}
              </Link>
            }
          />
          {lowStock.length === 0 ? (
            <EmptyState
              icon={CheckCircle2}
              title={t('dashboard.allStocked')}
              description={t('dashboard.allStockedHint')}
              compact
            />
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {lowStock.slice(0, 5).map((product) => {
                const percent = Math.max(
                  6,
                  Math.min(100, (product.stock / Math.max(product.minStock, 1)) * 100),
                )
                return (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => navigate('/inventory')}
                    className="flex w-full items-center gap-3 px-5 py-3 text-left transition hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                  >
                    <ProductThumb product={product} size="sm" tone="amber" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-xs font-semibold text-slate-800 dark:text-slate-100">
                          {product.name}
                        </p>
                        <Badge tone={product.stock === 0 ? 'rose' : 'amber'} dot>
                          {product.stock === 0
                            ? t('inventory.outOfStock')
                            : t('inventory.low')}
                        </Badge>
                      </div>
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="h-1 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                          <div
                            className={
                              product.stock === 0
                                ? 'h-full rounded-full bg-rose-500'
                                : 'h-full rounded-full bg-amber-500'
                            }
                            style={{ width: `${product.stock === 0 ? 100 : percent}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-medium text-slate-400">
                          {t('dashboard.stockOf', {
                            stock: product.stock,
                            min: product.minStock,
                          })}
                        </span>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader
            title={t('dashboard.topProducts')}
            subtitle={t('dashboard.topProductsHint')}
            action={
              <Link
                to="/reports"
                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
              >
                {t('dashboard.viewReport')}
              </Link>
            }
          />
          <div className="p-4 sm:p-5">
            {!ready ? (
              <ChartSkeleton height="h-[250px]" />
            ) : topChartData.length === 0 ? (
              <EmptyState
                icon={Package}
                title={t('dashboard.noProductSales')}
                description={t('dashboard.noProductSalesHint')}
                compact
              />
            ) : (
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topChartData}
                    layout="vertical"
                    margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      horizontal={false}
                      stroke="#94a3b8"
                      strokeOpacity={0.16}
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
                      width={120}
                      tick={{ fontSize: 10, fill: '#94a3b8' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<ChartTooltip />} cursor={{ fill: '#6366f1', opacity: 0.05 }} />
                    <Bar
                      dataKey="revenue"
                      name={t('dashboard.revenue')}
                      fill="#6366f1"
                      radius={[0, 5, 5, 0]}
                      barSize={16}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader
            title={t('dashboard.recentActivities')}
            subtitle={t('dashboard.recentActivitiesHint')}
          />
          <div className="space-y-4 p-5">
            {activities.slice(0, 5).map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        </Card>
      </div>

      <p className="text-center text-[10px] text-slate-400 dark:text-slate-600">
        {t('dashboard.lastUpdated', { time: formatDateTime(new Date()) })}
      </p>
    </div>
  )
}
