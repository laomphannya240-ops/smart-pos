import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import {
  AlertTriangle,
  Boxes,
  Download,
  Eye,
  MoreHorizontal,
  Package,
  PackagePlus,
  Pencil,
  Plus,
  SearchX,
  Trash2,
  TrendingUp,
} from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { StatCard } from '../../components/ui/StatCard'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge, StatusBadge } from '../../components/ui/Badge'
import { SearchInput, Select } from '../../components/ui/Input'
import { ProductThumb } from '../../components/ui/ProductThumb'
import { Dropdown, DropdownItem } from '../../components/ui/Dropdown'
import { Modal } from '../../components/ui/Modal'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { DataTable } from '../../components/tables/DataTable'
import { ProductFormModal } from '../../components/forms/ProductForm'
import { useDataStore } from '../../store/useDataStore'
import { useCurrency } from '../../hooks/useCurrency'
import { useDelayedReady } from '../../hooks/useDelayedReady'
import { useTableControls } from '../../hooks/useTableControls'
import { downloadCSV } from '../../utils/csv'
import { formatDate } from '../../utils/format'

export function Products() {
  const { t } = useTranslation()
  const money = useCurrency()
  const products = useDataStore((state) => state.products)
  const categories = useDataStore((state) => state.categories)
  const deleteProduct = useDataStore((state) => state.deleteProduct)
  const ready = useDelayedReady(260)

  const { query, setQuery, filters, setFilter, resetFilters } = useTableControls({
    categoryId: 'all',
    status: 'all',
  })

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [viewing, setViewing] = useState(null)
  const [deleting, setDeleting] = useState(null)

  const categoryMap = useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    [categories],
  )

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    return products
      .filter(
        (product) =>
          !term ||
          product.name.toLowerCase().includes(term) ||
          product.sku.toLowerCase().includes(term) ||
          String(product.barcode).toLowerCase().includes(term),
      )
      .filter(
        (product) =>
          filters.categoryId === 'all' || product.categoryId === filters.categoryId,
      )
      .filter((product) => filters.status === 'all' || product.status === filters.status)
  }, [products, query, filters])

  const stats = useMemo(() => {
    const active = products.filter((product) => product.status === 'active')
    const low = products.filter(
      (product) => product.status === 'active' && product.stock <= product.minStock,
    )
    return {
      active: active.length,
      low: low.length,
      out: low.filter((product) => product.stock === 0).length,
      value: products.reduce(
        (sum, product) => sum + Number(product.costPrice || 0) * Number(product.stock || 0),
        0,
      ),
      units: products.reduce((sum, product) => sum + Number(product.stock || 0), 0),
    }
  }, [products])

  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(product) {
    setEditing(product)
    setFormOpen(true)
  }

  function confirmDelete() {
    if (!deleting) return
    deleteProduct(deleting.id)
    toast.success(t('products.deleted', { name: deleting.name }))
    setDeleting(null)
  }

  function exportCSV() {
    downloadCSV(
      'smartpos-products',
      [
        { label: t('products.productName'), key: 'name' },
        { label: t('products.sku'), key: 'sku' },
        { label: t('common.barcode'), key: 'barcode' },
        { label: t('common.category'), value: (row) => categoryMap.get(row.categoryId)?.name || '—' },
        { label: t('products.costPrice'), key: 'costPrice' },
        { label: t('products.sellingPrice'), key: 'price' },
        { label: t('products.stockQuantity'), key: 'stock' },
        { label: t('products.minimumStock'), key: 'minStock' },
        { label: t('common.status'), value: (row) => t(`common.${row.status}`) },
      ],
      filtered,
    )
    toast.success(t('common.exported'))
  }

  const columns = [
    {
      key: 'name',
      header: t('products.product'),
      sortable: true,
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
                {product.sku} · {product.barcode}
              </p>
            </div>
          </div>
        )
      },
    },
    {
      key: 'category',
      header: t('common.category'),
      sortable: true,
      sortValue: (product) => categoryMap.get(product.categoryId)?.name || '',
      render: (product) => {
        const category = categoryMap.get(product.categoryId)
        return category ? (
          <Badge tone={category.color}>{category.emoji} {category.name}</Badge>
        ) : (
          <span className="text-xs text-slate-400">—</span>
        )
      },
    },
    {
      key: 'price',
      header: t('products.sellingPrice'),
      align: 'right',
      sortable: true,
      render: (product) => (
        <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
          {money(product.price)}
        </span>
      ),
    },
    {
      key: 'costPrice',
      header: t('products.costPrice'),
      align: 'right',
      sortable: true,
      render: (product) => (
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {money(product.costPrice)}
        </span>
      ),
    },
    {
      key: 'stock',
      header: t('common.stock'),
      align: 'center',
      sortable: true,
      render: (product) => {
        const out = product.stock === 0
        const low = !out && product.stock <= product.minStock
        return (
          <Badge tone={out ? 'rose' : low ? 'amber' : 'emerald'} dot>
            {out
              ? t('inventory.outOfStock')
              : low
                ? t('inventory.low', { count: product.stock })
                : t('inventory.inStock', { count: product.stock })}
          </Badge>
        )
      },
    },
    {
      key: 'status',
      header: t('common.status'),
      sortable: true,
      render: (product) => (
        <StatusBadge status={product.status}>
          {t(`common.${product.status}`)}
        </StatusBadge>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (product) => (
        <Dropdown
          width="w-44"
          trigger={({ toggle }) => (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                toggle()
              }}
              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
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
                  setViewing(product)
                  close()
                }}
              >
                {t('common.viewDetails')}
              </DropdownItem>
              <DropdownItem
                icon={Pencil}
                onClick={() => {
                  openEdit(product)
                  close()
                }}
              >
                {t('common.edit')}
              </DropdownItem>
              <DropdownItem
                icon={Trash2}
                danger
                onClick={() => {
                  setDeleting(product)
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
        title={t('products.title')}
        description={t('products.subtitle')}
        badge={<Badge tone="indigo">{t('common.countItems', { count: products.length })}</Badge>}
        actions={
          <>
            <Button variant="outline" leftIcon={Download} onClick={exportCSV} disabled={!filtered.length}>
              {t('common.export')}
            </Button>
            <Button leftIcon={Plus} onClick={openCreate}>
              {t('products.addProduct')}
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard
          label={t('products.totalProducts')}
          value={products.length}
          icon={Package}
          tone="indigo"
          hint={t('products.unitsInStock', { count: stats.units })}
          loading={!ready}
        />
        <StatCard
          label={t('products.activeProducts')}
          value={stats.active}
          icon={PackagePlus}
          tone="emerald"
          hint={t('products.activeHint')}
          loading={!ready}
        />
        <StatCard
          label={t('products.lowStock')}
          value={stats.low}
          icon={AlertTriangle}
          tone="amber"
          hint={t('products.outOfStockCount', { count: stats.out })}
          loading={!ready}
        />
        <StatCard
          label={t('products.inventoryValue')}
          value={money(stats.value)}
          icon={Boxes}
          tone="violet"
          hint={t('products.inventoryValueHint')}
          loading={!ready}
        />
      </div>

      <Card>
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 dark:border-slate-800 lg:flex-row lg:items-center">
          <SearchInput
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('products.searchPlaceholder')}
            className="lg:max-w-sm"
          />
          <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
            <Select
              value={filters.categoryId}
              onChange={(event) => setFilter('categoryId', event.target.value)}
              aria-label={t('common.category')}
              className="h-10 min-w-[150px] text-xs"
              options={[
                { value: 'all', label: t('common.allCategories') },
                ...categories.map((category) => ({ value: category.id, label: category.name })),
              ]}
            />
            <Select
              value={filters.status}
              onChange={(event) => setFilter('status', event.target.value)}
              aria-label={t('common.status')}
              className="h-10 min-w-[130px] text-xs"
              options={[
                { value: 'all', label: t('common.allStatuses') },
                { value: 'active', label: t('common.active') },
                { value: 'inactive', label: t('common.inactive') },
              ]}
            />
            <Button
              variant="ghost"
              size="sm"
              leftIcon={SearchX}
              onClick={resetFilters}
              disabled={!query && filters.categoryId === 'all' && filters.status === 'all'}
            >
              {t('common.resetFilters')}
            </Button>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={filtered}
          pageSize={8}
          loading={!ready}
          initialSort={{ key: 'name', dir: 'asc' }}
          onRowClick={(product) => setViewing(product)}
          emptyIcon={Package}
          emptyTitle={t('products.noProducts')}
          emptyDescription={t('products.noProductsHint')}
        />
      </Card>

      <ProductFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        product={editing}
      />

      <Modal
        open={Boolean(viewing)}
        onClose={() => setViewing(null)}
        title={viewing?.name || t('products.productDetails')}
        description={viewing ? `${viewing.sku} · ${viewing.barcode}` : undefined}
        icon={Package}
        size="lg"
        footer={
          <div className="flex justify-between gap-2">
            <p className="text-[11px] text-slate-400">
              {viewing && t('products.addedOn', { date: formatDate(viewing.createdAt) })}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setViewing(null)}>
                {t('common.close')}
              </Button>
              <Button
                leftIcon={Pencil}
                onClick={() => {
                  openEdit(viewing)
                  setViewing(null)
                }}
              >
                {t('common.edit')}
              </Button>
            </div>
          </div>
        }
      >
        {viewing && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/30">
              <ProductThumb
                product={viewing}
                size="xl"
                tone={categoryMap.get(viewing.categoryId)?.color}
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={categoryMap.get(viewing.categoryId)?.color || 'slate'}>
                    {categoryMap.get(viewing.categoryId)?.emoji}{' '}
                    {categoryMap.get(viewing.categoryId)?.name || t('common.uncategorized')}
                  </Badge>
                  <StatusBadge status={viewing.status}>{t(`common.${viewing.status}`)}</StatusBadge>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  {viewing.description || t('products.noDescription')}
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { label: t('products.sellingPrice'), value: money(viewing.price) },
                { label: t('products.costPrice'), value: money(viewing.costPrice) },
                {
                  label: t('products.margin'),
                  value: viewing.price
                    ? `${(((viewing.price - viewing.costPrice) / viewing.price) * 100).toFixed(1)}%`
                    : '—',
                },
                { label: t('common.stock'), value: `${viewing.stock} / ${viewing.minStock}` },
                { label: t('products.barcode'), value: viewing.barcode || '—' },
                { label: t('common.category'), value: categoryMap.get(viewing.categoryId)?.name || '—' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-slate-200/80 px-3.5 py-3 dark:border-slate-800"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    {item.label}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex items-start gap-2 rounded-xl bg-indigo-50/70 px-3.5 py-3 text-[11px] leading-relaxed text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
              <TrendingUp className="mt-0.5 h-4 w-4 shrink-0" />
              {t('products.profitPerUnit', {
                amount: money(Number(viewing.price) - Number(viewing.costPrice)),
              })}
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        title={t('products.deleteTitle')}
        description={t('products.deleteDescription', { name: deleting?.name || '' })}
        confirmLabel={t('common.delete')}
      />
    </div>
  )
}
