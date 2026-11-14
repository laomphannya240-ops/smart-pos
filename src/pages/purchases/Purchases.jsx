import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import {
  CheckCircle2,
  ClipboardList,
  Download,
  Eye,
  MoreHorizontal,
  PackageCheck,
  Plus,
  SearchX,
  Trash2,
  Truck,
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
import { PurchaseFormModal } from '../../components/forms/PurchaseForm'
import { useDataStore } from '../../store/useDataStore'
import { useCurrency } from '../../hooks/useCurrency'
import { useDelayedReady } from '../../hooks/useDelayedReady'
import { useTableControls } from '../../hooks/useTableControls'
import { downloadCSV } from '../../utils/csv'
import { formatDate, formatDateTime, formatNumber } from '../../utils/format'
import { cn } from '../../utils/cn'

export function Purchases() {
  const { t } = useTranslation()
  const money = useCurrency()
  const purchases = useDataStore((state) => state.purchases)
  const suppliers = useDataStore((state) => state.suppliers)
  const receivePurchase = useDataStore((state) => state.receivePurchase)
  const deletePurchase = useDataStore((state) => state.deletePurchase)
  const ready = useDelayedReady(260)

  const [tab, setTab] = useState('all')
  const [formOpen, setFormOpen] = useState(false)
  const [viewingId, setViewingId] = useState(null)
  const [receiving, setReceiving] = useState(null)
  const [deleting, setDeleting] = useState(null)

  const { query, setQuery, filters, setFilter, resetFilters } = useTableControls({
    supplierId: 'all',
  })

  const viewing = purchases.find((purchase) => purchase.id === viewingId) || null
  const supplierMap = useMemo(
    () => new Map(suppliers.map((supplier) => [supplier.id, supplier])),
    [suppliers],
  )

  const stats = useMemo(() => {
    const received = purchases.filter((purchase) => purchase.status === 'received')
    const pending = purchases.filter((purchase) => purchase.status !== 'received')
    const units = purchases.reduce(
      (sum, purchase) => sum + purchase.items.reduce((qty, item) => qty + Number(item.qty || 0), 0),
      0,
    )
    return {
      value: purchases.reduce((sum, purchase) => sum + Number(purchase.total || 0), 0),
      receivedValue: received.reduce((sum, purchase) => sum + Number(purchase.total || 0), 0),
      pendingValue: pending.reduce((sum, purchase) => sum + Number(purchase.total || 0), 0),
      units,
      received: received.length,
      pending: pending.length,
    }
  }, [purchases])

  const rows = useMemo(() => {
    const term = query.trim().toLowerCase()
    return purchases
      .filter(
        (purchase) =>
          !term ||
          purchase.number.toLowerCase().includes(term) ||
          purchase.supplierName.toLowerCase().includes(term),
      )
      .filter((purchase) => tab === 'all' || purchase.status === tab)
      .filter((purchase) => filters.supplierId === 'all' || purchase.supplierId === filters.supplierId)
  }, [purchases, query, tab, filters])

  const tabs = [
    { key: 'all', label: t('common.all'), count: purchases.length },
    {
      key: 'draft',
      label: t('status.draft'),
      count: purchases.filter((purchase) => purchase.status === 'draft').length,
    },
    {
      key: 'ordered',
      label: t('status.ordered'),
      count: purchases.filter((purchase) => purchase.status === 'ordered').length,
    },
    {
      key: 'received',
      label: t('status.received'),
      count: purchases.filter((purchase) => purchase.status === 'received').length,
    },
  ]

  function handleReceive() {
    if (!receiving) return
    const result = receivePurchase(receiving.id)
    if (result) {
      toast.success(t('purchases.receivedToast', { number: result.number }))
    }
    setReceiving(null)
  }

  function handleDelete() {
    if (!deleting) return
    deletePurchase(deleting.id)
    if (viewingId === deleting.id) setViewingId(null)
    toast.success(t('purchases.deleted', { number: deleting.number }))
    setDeleting(null)
  }

  function exportCSV() {
    downloadCSV(
      'smartpos-purchases',
      [
        { label: t('purchases.poNumber'), key: 'number' },
        { label: t('purchases.supplier'), key: 'supplierName' },
        { label: t('common.date'), value: (row) => formatDate(row.createdAt) },
        { label: t('purchases.items'), value: (row) => row.items.length },
        {
          label: t('purchases.units'),
          value: (row) => row.items.reduce((sum, item) => sum + Number(item.qty || 0), 0),
        },
        { label: t('common.total'), key: 'total' },
        { label: t('common.status'), value: (row) => t(`status.${row.status}`) },
        { label: t('purchases.receivedAt'), value: (row) => (row.receivedAt ? formatDate(row.receivedAt) : '—') },
      ],
      rows,
    )
    toast.success(t('common.exported'))
  }

  const columns = [
    {
      key: 'number',
      header: t('purchases.poNumber'),
      sortable: true,
      render: (purchase) => (
        <div>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            {purchase.number}
          </p>
          <p className="text-[10px] text-slate-400">{formatDate(purchase.createdAt)}</p>
        </div>
      ),
    },
    {
      key: 'supplierName',
      header: t('purchases.supplier'),
      sortable: true,
      render: (purchase) => (
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400">
            <Truck className="h-4 w-4" />
          </span>
          <span className="max-w-[200px] truncate text-xs font-medium text-slate-700 dark:text-slate-200">
            {purchase.supplierName || supplierMap.get(purchase.supplierId)?.name || '—'}
          </span>
        </div>
      ),
    },
    {
      key: 'items',
      header: t('purchases.items'),
      align: 'center',
      sortable: true,
      sortValue: (purchase) =>
        purchase.items.reduce((sum, item) => sum + Number(item.qty || 0), 0),
      render: (purchase) => (
        <Badge tone="slate">
          {t('purchases.itemLines', { count: purchase.items.length })}
        </Badge>
      ),
    },
    {
      key: 'total',
      header: t('common.total'),
      align: 'right',
      sortable: true,
      render: (purchase) => (
        <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
          {money(purchase.total)}
        </span>
      ),
    },
    {
      key: 'status',
      header: t('common.status'),
      sortable: true,
      render: (purchase) => (
        <StatusBadge status={purchase.status}>{t(`status.${purchase.status}`)}</StatusBadge>
      ),
    },
    {
      key: 'receivedAt',
      header: t('purchases.receivedAt'),
      sortable: true,
      sortValue: (purchase) => purchase.receivedAt || '',
      render: (purchase) => (
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {purchase.receivedAt ? formatDate(purchase.receivedAt) : '—'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (purchase) => (
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
                  setViewingId(purchase.id)
                  close()
                }}
              >
                {t('common.viewDetails')}
              </DropdownItem>
              {purchase.status !== 'received' && (
                <DropdownItem
                  icon={PackageCheck}
                  onClick={() => {
                    setReceiving(purchase)
                    close()
                  }}
                >
                  {t('purchases.receiveStock')}
                </DropdownItem>
              )}
              <DropdownItem
                icon={Trash2}
                danger
                onClick={() => {
                  setDeleting(purchase)
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

  const viewingUnits = viewing
    ? viewing.items.reduce((sum, item) => sum + Number(item.qty || 0), 0)
    : 0

  return (
    <div className="space-y-5">
      <PageHeader
        title={t('purchases.title')}
        description={t('purchases.subtitle')}
        badge={<Badge tone="sky">{t('common.countItems', { count: purchases.length })}</Badge>}
        actions={
          <>
            <Button variant="outline" leftIcon={Download} onClick={exportCSV} disabled={!rows.length}>
              {t('common.export')}
            </Button>
            <Button leftIcon={Plus} onClick={() => setFormOpen(true)}>
              {t('purchases.addPurchase')}
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard
          label={t('purchases.totalPurchaseValue')}
          value={money(stats.value)}
          icon={Wallet}
          tone="indigo"
          hint={t('purchases.allTime')}
          loading={!ready}
        />
        <StatCard
          label={t('purchases.receivedValue')}
          value={money(stats.receivedValue)}
          icon={CheckCircle2}
          tone="emerald"
          hint={t('purchases.receivedOrders', { count: stats.received })}
          loading={!ready}
        />
        <StatCard
          label={t('purchases.pendingValue')}
          value={money(stats.pendingValue)}
          icon={Truck}
          tone="amber"
          hint={t('purchases.pendingHint', { count: stats.pending })}
          loading={!ready}
        />
        <StatCard
          label={t('purchases.totalUnits')}
          value={formatNumber(stats.units)}
          icon={ClipboardList}
          tone="violet"
          hint={t('purchases.unitsHint')}
          loading={!ready}
        />
      </div>

      <Tabs items={tabs} value={tab} onChange={setTab} />

      <Card>
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 dark:border-slate-800 lg:flex-row lg:items-center">
          <SearchInput
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('purchases.searchPlaceholder')}
            className="lg:max-w-sm"
          />
          <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
            <Select
              value={filters.supplierId}
              onChange={(event) => setFilter('supplierId', event.target.value)}
              aria-label={t('purchases.supplier')}
              className="h-10 min-w-[170px] text-xs"
              options={[
                { value: 'all', label: t('purchases.allSuppliers') },
                ...suppliers.map((supplier) => ({ value: supplier.id, label: supplier.name })),
              ]}
            />
            <Button
              variant="ghost"
              size="sm"
              leftIcon={SearchX}
              onClick={resetFilters}
              disabled={!query && filters.supplierId === 'all'}
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
          onRowClick={(purchase) => setViewingId(purchase.id)}
          emptyIcon={ClipboardList}
          emptyTitle={t('purchases.noPurchases')}
          emptyDescription={t('purchases.noPurchasesHint')}
        />
      </Card>

      <PurchaseFormModal open={formOpen} onClose={() => setFormOpen(false)} />

      <Modal
        open={Boolean(viewing)}
        onClose={() => setViewingId(null)}
        title={viewing?.number || t('purchases.purchaseDetails')}
        description={viewing ? `${viewing.supplierName} · ${formatDateTime(viewing.createdAt)}` : undefined}
        icon={ClipboardList}
        size="lg"
        footer={
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
            <Button variant="outline" onClick={() => setViewingId(null)}>
              {t('common.close')}
            </Button>
            <div className="flex gap-2">
              {viewing && viewing.status !== 'received' && (
                <Button
                  variant="success"
                  leftIcon={PackageCheck}
                  onClick={() => setReceiving(viewing)}
                >
                  {t('purchases.receiveStock')}
                </Button>
              )}
              {viewing && (
                <Button
                  variant="ghost"
                  leftIcon={Trash2}
                  onClick={() => setDeleting(viewing)}
                >
                  {t('common.delete')}
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
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400">
                  <Truck className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {viewing.supplierName}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {t('purchases.unitsOrdered', { count: viewingUnits })} ·{' '}
                    {t('purchases.linesCount', { count: viewing.items.length })}
                  </p>
                </div>
              </div>
              <StatusBadge status={viewing.status}>{t(`status.${viewing.status}`)}</StatusBadge>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-400 dark:bg-slate-800/50">
                  <tr>
                    <th className="px-3.5 py-2 font-semibold">{t('purchases.product')}</th>
                    <th className="px-3 py-2 text-center font-semibold">{t('purchases.qty')}</th>
                    <th className="px-3 py-2 text-right font-semibold">{t('purchases.unitCost')}</th>
                    <th className="px-3.5 py-2 text-right font-semibold">{t('common.total')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {viewing.items.map((item) => (
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
                        {money(item.cost)}
                      </td>
                      <td className="px-3.5 py-2.5 text-right font-semibold text-slate-800 dark:text-slate-100">
                        {money(Number(item.cost) * Number(item.qty))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-end justify-between rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-800/50">
              <div>
                <p className="text-[10px] uppercase tracking-wide text-slate-400">
                  {t('purchases.orderedOn')}
                </p>
                <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  {formatDate(viewing.createdAt)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wide text-slate-400">
                  {t('common.grandTotal')}
                </p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">
                  {money(viewing.total)}
                </p>
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
                viewing.status === 'received'
                  ? 'bg-emerald-50/80 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
                  : 'bg-slate-100/80 text-slate-500 dark:bg-slate-800/50 dark:text-slate-400',
              )}
            >
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              {viewing.status === 'received'
                ? t('purchases.receivedNote', { date: formatDateTime(viewing.receivedAt) })
                : t('purchases.notReceivedNote')}
            </p>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(receiving)}
        onClose={() => setReceiving(null)}
        onConfirm={handleReceive}
        title={t('purchases.receiveTitle')}
        description={t('purchases.receiveDescription', { number: receiving?.number || '' })}
        confirmLabel={t('purchases.receiveStock')}
        tone="primary"
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title={t('purchases.deleteTitle')}
        description={t('purchases.deleteDescription', { number: deleting?.number || '' })}
        confirmLabel={t('common.delete')}
      />
    </div>
  )
}
