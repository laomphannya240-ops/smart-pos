import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpDown,
  ArrowUpRight,
  Boxes,
  Download,
  PackageSearch,
  RefreshCw,
  SearchX,
  SlidersHorizontal,
  Warehouse,
} from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { StatCard } from '../../components/ui/StatCard'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge, StatusBadge } from '../../components/ui/Badge'
import { Input, SearchInput, Select, Textarea } from '../../components/ui/Input'
import { ProductThumb } from '../../components/ui/ProductThumb'
import { Modal } from '../../components/ui/Modal'
import { DataTable } from '../../components/tables/DataTable'
import { Tabs } from '../../components/ui/Tabs'
import { useDataStore } from '../../store/useDataStore'
import { useCurrency } from '../../hooks/useCurrency'
import { useDelayedReady } from '../../hooks/useDelayedReady'
import { useTableControls } from '../../hooks/useTableControls'
import { downloadCSV } from '../../utils/csv'
import { formatDateTime } from '../../utils/format'
import { cn } from '../../utils/cn'

function stockState(product) {
  if (product.stock === 0) return 'out'
  if (product.stock <= product.minStock) return 'low'
  return 'in'
}

const stockTone = { out: 'rose', low: 'amber', in: 'emerald' }

export function Inventory() {
  const { t } = useTranslation()
  const money = useCurrency()
  const products = useDataStore((state) => state.products)
  const categories = useDataStore((state) => state.categories)
  const movements = useDataStore((state) => state.movements)
  const adjustStock = useDataStore((state) => state.adjustStock)
  const ready = useDelayedReady(260)

  const [tab, setTab] = useState('stock')
  const [adjusting, setAdjusting] = useState(null)
  const [adjustForm, setAdjustForm] = useState({ type: 'in', quantity: 1, note: '' })
  const [adjustError, setAdjustError] = useState('')

  const stockControls = useTableControls({ state: 'all', categoryId: 'all' })
  const movementControls = useTableControls({ type: 'all' })

  const categoryMap = useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    [categories],
  )

  const stats = useMemo(() => {
    const low = products.filter((product) => stockState(product) === 'low')
    const out = products.filter((product) => product.stock === 0)
    return {
      units: products.reduce((sum, product) => sum + Number(product.stock || 0), 0),
      value: products.reduce(
        (sum, product) => sum + Number(product.costPrice || 0) * Number(product.stock || 0),
        0,
      ),
      retail: products.reduce(
        (sum, product) => sum + Number(product.price || 0) * Number(product.stock || 0),
        0,
      ),
      low: low.length,
      out: out.length,
    }
  }, [products])

  const stockRows = useMemo(() => {
    const term = stockControls.query.trim().toLowerCase()
    return products
      .filter(
        (product) =>
          !term ||
          product.name.toLowerCase().includes(term) ||
          product.sku.toLowerCase().includes(term),
      )
      .filter(
        (product) =>
          stockControls.filters.categoryId === 'all' ||
          product.categoryId === stockControls.filters.categoryId,
      )
      .filter(
        (product) =>
          stockControls.filters.state === 'all' ||
          stockState(product) === stockControls.filters.state,
      )
  }, [products, stockControls.query, stockControls.filters])

  const movementRows = useMemo(() => {
    const term = movementControls.query.trim().toLowerCase()
    return movements
      .filter(
        (movement) =>
          !term ||
          movement.productName.toLowerCase().includes(term) ||
          String(movement.sku || '').toLowerCase().includes(term),
      )
      .filter(
        (movement) =>
          movementControls.filters.type === 'all' ||
          movement.type === movementControls.filters.type,
      )
  }, [movements, movementControls.query, movementControls.filters])

  useEffect(() => {
    if (!adjusting) return
    setAdjustForm({
      type: stockState(adjusting) === 'out' ? 'in' : 'in',
      quantity: 1,
      note: '',
    })
    setAdjustError('')
  }, [adjusting])

  const preview = useMemo(() => {
    if (!adjusting) return { before: 0, after: 0, change: 0 }
    const qty = Number(adjustForm.quantity) || 0
    const before = Number(adjusting.stock) || 0
    let after = before
    if (adjustForm.type === 'in') after = before + qty
    else if (adjustForm.type === 'out') after = Math.max(0, before - qty)
    else after = Math.max(0, qty)
    return { before, after, change: after - before }
  }, [adjusting, adjustForm])

  function submitAdjust() {
    const qty = Number(adjustForm.quantity)
    if (!Number.isFinite(qty) || qty < 0 || (adjustForm.type !== 'set' && qty <= 0)) {
      setAdjustError(t('inventory.quantityInvalid'))
      return
    }
    adjustStock({
      productId: adjusting.id,
      type: adjustForm.type,
      quantity: qty,
      note: adjustForm.note.trim(),
    })
    toast.success(t('inventory.adjusted', { name: adjusting.name }))
    setAdjusting(null)
  }

  function exportMovements() {
    downloadCSV(
      'smartpos-stock-movements',
      [
        { label: t('inventory.date'), value: (row) => formatDateTime(row.createdAt) },
        { label: t('products.productName'), key: 'productName' },
        { label: t('products.sku'), key: 'sku' },
        { label: t('inventory.type'), value: (row) => t(`inventory.types.${row.type}`) },
        { label: t('inventory.change'), key: 'change' },
        { label: t('inventory.before'), key: 'before' },
        { label: t('inventory.after'), key: 'after' },
        { label: t('common.notes'), key: 'note' },
      ],
      movementRows,
    )
    toast.success(t('common.exported'))
  }

  const stockColumns = [
    {
      key: 'productName',
      header: t('products.product'),
      sortable: true,
      sortValue: (product) => product.name,
      render: (product) => {
        const category = categoryMap.get(product.categoryId)
        return (
          <div className="flex items-center gap-3">
            <ProductThumb product={product} tone={category?.color} size="sm" />
            <div className="min-w-0">
              <p className="max-w-[240px] truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                {product.name}
              </p>
              <p className="text-[11px] text-slate-400">
                {product.sku} · {category?.name || t('common.uncategorized')}
              </p>
            </div>
          </div>
        )
      },
    },
    {
      key: 'stock',
      header: t('inventory.onHand'),
      align: 'center',
      sortable: true,
      render: (product) => {
        const state = stockState(product)
        return (
          <Badge tone={stockTone[state]} dot>
            {product.stock} {t('inventory.unitsShort')}
          </Badge>
        )
      },
    },
    {
      key: 'minStock',
      header: t('inventory.reorderLevel'),
      align: 'center',
      sortable: true,
      render: (product) => (
        <span className="text-xs text-slate-500 dark:text-slate-400">{product.minStock}</span>
      ),
    },
    {
      key: 'value',
      header: t('inventory.stockValue'),
      align: 'right',
      sortable: true,
      sortValue: (product) => Number(product.costPrice) * Number(product.stock),
      render: (product) => (
        <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
          {money(Number(product.costPrice) * Number(product.stock))}
        </span>
      ),
    },
    {
      key: 'retail',
      header: t('inventory.retailValue'),
      align: 'right',
      render: (product) => (
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {money(Number(product.price) * Number(product.stock))}
        </span>
      ),
    },
    {
      key: 'state',
      header: t('common.status'),
      align: 'center',
      sortable: true,
      sortValue: (product) => stockState(product),
      render: (product) => {
        const state = stockState(product)
        return (
          <StatusBadge status={state}>
            {t(`inventory.${state === 'in' ? 'inStockLabel' : state}`)}
          </StatusBadge>
        )
      },
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (product) => (
        <Button
          size="xs"
          variant="soft"
          leftIcon={SlidersHorizontal}
          onClick={(event) => {
            event.stopPropagation()
            setAdjusting(product)
          }}
        >
          {t('inventory.adjust')}
        </Button>
      ),
    },
  ]

  const movementColumns = [
    {
      key: 'createdAt',
      header: t('inventory.date'),
      sortable: true,
      render: (movement) => (
        <div>
          <p className="text-xs font-medium text-slate-700 dark:text-slate-200">
            {formatDateTime(movement.createdAt)}
          </p>
          <p className="text-[10px] text-slate-400">{movement.reference || '—'}</p>
        </div>
      ),
    },
    {
      key: 'productName',
      header: t('products.product'),
      sortable: true,
      render: (movement) => (
        <div className="flex items-center gap-2.5">
          <span
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-lg',
              movement.type === 'in'
                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                : movement.type === 'out'
                  ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'
                  : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400',
            )}
          >
            {movement.type === 'in' ? (
              <ArrowDownLeft className="h-4 w-4" />
            ) : movement.type === 'out' ? (
              <ArrowUpRight className="h-4 w-4" />
            ) : (
              <ArrowUpDown className="h-4 w-4" />
            )}
          </span>
          <div className="min-w-0">
            <p className="max-w-[220px] truncate text-xs font-semibold text-slate-800 dark:text-slate-100">
              {movement.productName}
            </p>
            <p className="text-[10px] text-slate-400">{movement.sku}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      header: t('inventory.type'),
      sortable: true,
      render: (movement) => (
        <StatusBadge status={movement.type}>
          {t(`inventory.types.${movement.type}`)}
        </StatusBadge>
      ),
    },
    {
      key: 'change',
      header: t('inventory.change'),
      align: 'right',
      sortable: true,
      render: (movement) => (
        <span
          className={cn(
            'text-sm font-bold tabular-nums',
            movement.change > 0
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-rose-600 dark:text-rose-400',
          )}
        >
          {movement.change > 0 ? '+' : ''}
          {movement.change}
        </span>
      ),
    },
    {
      key: 'before',
      header: t('inventory.before'),
      align: 'center',
      render: (movement) => (
        <span className="text-xs text-slate-400 tabular-nums">{movement.before}</span>
      ),
    },
    {
      key: 'after',
      header: t('inventory.after'),
      align: 'center',
      render: (movement) => (
        <span className="text-xs font-semibold text-slate-700 tabular-nums dark:text-slate-200">
          {movement.after}
        </span>
      ),
    },
    {
      key: 'note',
      header: t('common.notes'),
      render: (movement) => (
        <span className="block max-w-[200px] truncate text-xs text-slate-500 dark:text-slate-400">
          {movement.note || '—'}
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-5">
      <PageHeader
        title={t('inventory.title')}
        description={t('inventory.subtitle')}
        badge={<Badge tone="amber">{t('inventory.alertsCount', { count: stats.low + stats.out })}</Badge>}
        actions={
          <Button
            variant="outline"
            leftIcon={Download}
            onClick={exportMovements}
            disabled={!movementRows.length}
          >
            {t('inventory.exportMovements')}
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard
          label={t('inventory.totalUnits')}
          value={stats.units}
          icon={Boxes}
          tone="indigo"
          hint={t('inventory.acrossProducts', { count: products.length })}
          loading={!ready}
        />
        <StatCard
          label={t('inventory.stockValue')}
          value={money(stats.value)}
          icon={Warehouse}
          tone="violet"
          hint={t('inventory.atCost')}
          loading={!ready}
        />
        <StatCard
          label={t('inventory.retailValue')}
          value={money(stats.retail)}
          icon={RefreshCw}
          tone="emerald"
          hint={t('inventory.potentialRevenue')}
          loading={!ready}
        />
        <StatCard
          label={t('inventory.stockAlerts')}
          value={stats.low + stats.out}
          icon={AlertTriangle}
          tone="amber"
          hint={t('inventory.outOfStockCount', { count: stats.out })}
          loading={!ready}
        />
      </div>

      <Tabs
        items={[
          { key: 'stock', label: t('inventory.stockLevels'), count: products.length },
          { key: 'movements', label: t('inventory.movements'), count: movements.length },
        ]}
        value={tab}
        onChange={setTab}
      />

      {tab === 'stock' ? (
        <Card>
          <div className="flex flex-col gap-3 border-b border-slate-100 p-4 dark:border-slate-800 lg:flex-row lg:items-center">
            <SearchInput
              value={stockControls.query}
              onChange={(event) => stockControls.setQuery(event.target.value)}
              placeholder={t('inventory.searchStock')}
              className="lg:max-w-sm"
            />
            <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
              <Select
                value={stockControls.filters.categoryId}
                onChange={(event) => stockControls.setFilter('categoryId', event.target.value)}
                aria-label={t('common.category')}
                className="h-10 min-w-[150px] text-xs"
                options={[
                  { value: 'all', label: t('common.allCategories') },
                  ...categories.map((category) => ({ value: category.id, label: category.name })),
                ]}
              />
              <Select
                value={stockControls.filters.state}
                onChange={(event) => stockControls.setFilter('state', event.target.value)}
                aria-label={t('common.status')}
                className="h-10 min-w-[140px] text-xs"
                options={[
                  { value: 'all', label: t('inventory.allLevels') },
                  { value: 'in', label: t('inventory.inStockLabel') },
                  { value: 'low', label: t('inventory.low') },
                  { value: 'out', label: t('inventory.outOfStock') },
                ]}
              />
              <Button
                variant="ghost"
                size="sm"
                leftIcon={SearchX}
                onClick={stockControls.resetFilters}
                disabled={
                  !stockControls.query &&
                  stockControls.filters.categoryId === 'all' &&
                  stockControls.filters.state === 'all'
                }
              >
                {t('common.resetFilters')}
              </Button>
            </div>
          </div>
          <DataTable
            columns={stockColumns}
            data={stockRows}
            pageSize={8}
            loading={!ready}
            initialSort={{ key: 'stock', dir: 'asc' }}
            emptyIcon={PackageSearch}
            emptyTitle={t('inventory.noStockRows')}
            emptyDescription={t('inventory.noStockRowsHint')}
          />
        </Card>
      ) : (
        <Card>
          <div className="flex flex-col gap-3 border-b border-slate-100 p-4 dark:border-slate-800 lg:flex-row lg:items-center">
            <SearchInput
              value={movementControls.query}
              onChange={(event) => movementControls.setQuery(event.target.value)}
              placeholder={t('inventory.searchMovements')}
              className="lg:max-w-sm"
            />
            <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
              <Select
                value={movementControls.filters.type}
                onChange={(event) => movementControls.setFilter('type', event.target.value)}
                aria-label={t('inventory.type')}
                className="h-10 min-w-[150px] text-xs"
                options={[
                  { value: 'all', label: t('inventory.allTypes') },
                  { value: 'in', label: t('inventory.types.in') },
                  { value: 'out', label: t('inventory.types.out') },
                  { value: 'adjustment', label: t('inventory.types.adjustment') },
                ]}
              />
              <Button
                variant="ghost"
                size="sm"
                leftIcon={SearchX}
                onClick={movementControls.resetFilters}
                disabled={!movementControls.query && movementControls.filters.type === 'all'}
              >
                {t('common.resetFilters')}
              </Button>
            </div>
          </div>
          <DataTable
            columns={movementColumns}
            data={movementRows}
            pageSize={10}
            loading={!ready}
            initialSort={{ key: 'createdAt', dir: 'desc' }}
            emptyIcon={ArrowUpDown}
            emptyTitle={t('inventory.noMovements')}
            emptyDescription={t('inventory.noMovementsHint')}
          />
        </Card>
      )}

      <Modal
        open={Boolean(adjusting)}
        onClose={() => setAdjusting(null)}
        title={t('inventory.adjustStock')}
        description={adjusting?.name}
        icon={SlidersHorizontal}
        size="md"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setAdjusting(null)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={submitAdjust}>{t('inventory.applyAdjustment')}</Button>
          </div>
        }
      >
        {adjusting && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-3.5 dark:border-slate-800 dark:bg-slate-800/30">
              <ProductThumb
                product={adjusting}
                size="md"
                tone={categoryMap.get(adjusting.categoryId)?.color}
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {adjusting.name}
                </p>
                <p className="text-[11px] text-slate-400">
                  {adjusting.sku} · {t('inventory.currentStock', { count: adjusting.stock })}
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label={t('inventory.adjustmentType')}
                value={adjustForm.type}
                onChange={(event) =>
                  setAdjustForm((current) => ({ ...current, type: event.target.value }))
                }
                options={[
                  { value: 'in', label: t('inventory.addStock') },
                  { value: 'out', label: t('inventory.removeStock') },
                  { value: 'set', label: t('inventory.setStock') },
                ]}
              />
              <Input
                label={t('inventory.quantity')}
                type="number"
                min="0"
                value={adjustForm.quantity}
                onChange={(event) =>
                  setAdjustForm((current) => ({ ...current, quantity: event.target.value }))
                }
                error={adjustError}
              />
            </div>

            <div className="grid grid-cols-3 gap-2 rounded-xl bg-slate-50 p-3 text-center dark:bg-slate-800/50">
              <div>
                <p className="text-[10px] uppercase tracking-wide text-slate-400">
                  {t('inventory.before')}
                </p>
                <p className="text-lg font-bold text-slate-700 dark:text-slate-200">
                  {preview.before}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wide text-slate-400">
                  {t('inventory.change')}
                </p>
                <p
                  className={cn(
                    'text-lg font-bold',
                    preview.change > 0
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : preview.change < 0
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-slate-500',
                  )}
                >
                  {preview.change > 0 ? '+' : ''}
                  {preview.change}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wide text-slate-400">
                  {t('inventory.after')}
                </p>
                <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                  {preview.after}
                </p>
              </div>
            </div>

            <Textarea
              label={t('inventory.reason')}
              placeholder={t('inventory.reasonPlaceholder')}
              rows={2}
              value={adjustForm.note}
              onChange={(event) =>
                setAdjustForm((current) => ({ ...current, note: event.target.value }))
              }
            />
          </div>
        )}
      </Modal>
    </div>
  )
}
