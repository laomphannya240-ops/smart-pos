import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import {
  Building2,
  ClipboardList,
  Download,
  Eye,
  Mail,
  MapPin,
  MoreHorizontal,
  Pencil,
  Phone,
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
import { SupplierFormModal } from '../../components/forms/SupplierForm'
import { useDataStore } from '../../store/useDataStore'
import { useCurrency } from '../../hooks/useCurrency'
import { useDelayedReady } from '../../hooks/useDelayedReady'
import { useTableControls } from '../../hooks/useTableControls'
import { downloadCSV } from '../../utils/csv'
import { formatDate, formatNumber } from '../../utils/format'

export function Suppliers() {
  const { t } = useTranslation()
  const money = useCurrency()
  const suppliers = useDataStore((state) => state.suppliers)
  const purchases = useDataStore((state) => state.purchases)
  const deleteSupplier = useDataStore((state) => state.deleteSupplier)
  const ready = useDelayedReady(260)

  const { query, setQuery, filters, setFilter, resetFilters } = useTableControls({
    status: 'all',
  })

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [viewing, setViewing] = useState(null)
  const [deleting, setDeleting] = useState(null)

  const rows = useMemo(() => {
    const term = query.trim().toLowerCase()
    return suppliers
      .filter(
        (supplier) =>
          !term ||
          supplier.name.toLowerCase().includes(term) ||
          String(supplier.contactName || '').toLowerCase().includes(term) ||
          String(supplier.email || '').toLowerCase().includes(term),
      )
      .filter((supplier) => filters.status === 'all' || supplier.status === filters.status)
      .map((supplier) => {
        const own = purchases.filter((purchase) => purchase.supplierId === supplier.id)
        return {
          ...supplier,
          purchaseCount: own.length,
          totalPurchased: own.reduce((sum, purchase) => sum + Number(purchase.total || 0), 0),
          lastPurchase: own[0]?.createdAt || null,
        }
      })
  }, [suppliers, purchases, query, filters])

  const stats = useMemo(() => {
    const received = purchases.filter((purchase) => purchase.status === 'received')
    return {
      active: suppliers.filter((supplier) => supplier.status === 'active').length,
      value: purchases.reduce((sum, purchase) => sum + Number(purchase.total || 0), 0),
      received: received.length,
      pending: purchases.length - received.length,
    }
  }, [suppliers, purchases])

  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }

  function confirmDelete() {
    if (!deleting) return
    deleteSupplier(deleting.id)
    toast.success(t('suppliers.deleted', { name: deleting.name }))
    setDeleting(null)
  }

  function exportCSV() {
    downloadCSV(
      'smartpos-suppliers',
      [
        { label: t('suppliers.companyName'), key: 'name' },
        { label: t('suppliers.contactPerson'), key: 'contactName' },
        { label: t('common.phone'), key: 'phone' },
        { label: t('common.email'), key: 'email' },
        { label: t('common.address'), key: 'address' },
        { label: t('suppliers.purchaseOrders'), value: (row) => row.purchaseCount },
        { label: t('suppliers.totalPurchased'), value: (row) => row.totalPurchased },
        { label: t('common.status'), value: (row) => t(`common.${row.status}`) },
      ],
      rows,
    )
    toast.success(t('common.exported'))
  }

  const columns = [
    {
      key: 'name',
      header: t('suppliers.companyName'),
      sortable: true,
      render: (supplier) => (
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
            <Building2 className="h-4.5 w-4.5" />
          </span>
          <div className="min-w-0">
            <p className="max-w-[220px] truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
              {supplier.name}
            </p>
            <p className="text-[11px] text-slate-400">
              {supplier.code || t('suppliers.noCode')} · {supplier.contactName}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'phone',
      header: t('common.contact'),
      render: (supplier) => (
        <div className="text-xs">
          <p className="text-slate-600 dark:text-slate-300">{supplier.phone}</p>
          <p className="max-w-[190px] truncate text-[10px] text-slate-400">
            {supplier.email || t('customers.noEmail')}
          </p>
        </div>
      ),
    },
    {
      key: 'purchaseCount',
      header: t('suppliers.purchaseOrders'),
      align: 'center',
      sortable: true,
      render: (supplier) => <Badge tone="sky">{formatNumber(supplier.purchaseCount)}</Badge>,
    },
    {
      key: 'totalPurchased',
      header: t('suppliers.totalPurchased'),
      align: 'right',
      sortable: true,
      render: (supplier) => (
        <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
          {money(supplier.totalPurchased)}
        </span>
      ),
    },
    {
      key: 'lastPurchase',
      header: t('customers.lastPurchase'),
      sortable: true,
      sortValue: (supplier) => supplier.lastPurchase || '',
      render: (supplier) => (
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {supplier.lastPurchase ? formatDate(supplier.lastPurchase) : '—'}
        </span>
      ),
    },
    {
      key: 'status',
      header: t('common.status'),
      sortable: true,
      render: (supplier) => (
        <StatusBadge status={supplier.status}>{t(`common.${supplier.status}`)}</StatusBadge>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (supplier) => (
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
                  setViewing(supplier)
                  close()
                }}
              >
                {t('common.viewDetails')}
              </DropdownItem>
              <DropdownItem
                icon={Pencil}
                onClick={() => {
                  setEditing(supplier)
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
                  setDeleting(supplier)
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

  const supplierPurchases = viewing
    ? purchases.filter((purchase) => purchase.supplierId === viewing.id)
    : []

  return (
    <div className="space-y-5">
      <PageHeader
        title={t('suppliers.title')}
        description={t('suppliers.subtitle')}
        badge={<Badge tone="sky">{t('common.countItems', { count: suppliers.length })}</Badge>}
        actions={
          <>
            <Button variant="outline" leftIcon={Download} onClick={exportCSV} disabled={!rows.length}>
              {t('common.export')}
            </Button>
            <Button leftIcon={Plus} onClick={openCreate}>
              {t('suppliers.addSupplier')}
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard
          label={t('suppliers.totalSuppliers')}
          value={suppliers.length}
          icon={Truck}
          tone="sky"
          hint={t('suppliers.activeCount', { count: stats.active })}
          loading={!ready}
        />
        <StatCard
          label={t('suppliers.totalPurchased')}
          value={money(stats.value)}
          icon={Wallet}
          tone="violet"
          hint={t('suppliers.allTime')}
          loading={!ready}
        />
        <StatCard
          label={t('suppliers.receivedOrders')}
          value={stats.received}
          icon={ClipboardList}
          tone="emerald"
          hint={t('suppliers.stockAdded')}
          loading={!ready}
        />
        <StatCard
          label={t('suppliers.pendingOrders')}
          value={stats.pending}
          icon={Truck}
          tone="amber"
          hint={t('suppliers.awaitingReceipt')}
          loading={!ready}
        />
      </div>

      <Card>
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 dark:border-slate-800 lg:flex-row lg:items-center">
          <SearchInput
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('suppliers.searchPlaceholder')}
            className="lg:max-w-sm"
          />
          <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
            <Select
              value={filters.status}
              onChange={(event) => setFilter('status', event.target.value)}
              aria-label={t('common.status')}
              className="h-10 min-w-[140px] text-xs"
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
              disabled={!query && filters.status === 'all'}
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
          initialSort={{ key: 'totalPurchased', dir: 'desc' }}
          onRowClick={(supplier) => setViewing(supplier)}
          emptyIcon={Truck}
          emptyTitle={t('suppliers.noSuppliers')}
          emptyDescription={t('suppliers.noSuppliersHint')}
        />
      </Card>

      <Modal
        open={Boolean(viewing)}
        onClose={() => setViewing(null)}
        title={viewing?.name || t('suppliers.supplierDetails')}
        description={viewing?.code}
        icon={Truck}
        size="lg"
        footer={
          <div className="flex justify-between gap-2">
            <Button variant="outline" onClick={() => setViewing(null)}>
              {t('common.close')}
            </Button>
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
          </div>
        }
      >
        {viewing && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/30">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                <Building2 className="h-6 w-6" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {viewing.name}
                  </h3>
                  <StatusBadge status={viewing.status}>{t(`common.${viewing.status}`)}</StatusBadge>
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {viewing.contactName} · {viewing.code}
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200/80 px-3.5 py-3 dark:border-slate-800">
                <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  <Phone className="h-3 w-3" /> {t('common.phone')}
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {viewing.phone}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200/80 px-3.5 py-3 dark:border-slate-800">
                <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  <Mail className="h-3 w-3" /> {t('common.email')}
                </p>
                <p className="mt-1 truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {viewing.email || '—'}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200/80 px-3.5 py-3 dark:border-slate-800 sm:col-span-2">
                <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  <MapPin className="h-3 w-3" /> {t('common.address')}
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {viewing.address || '—'}
                </p>
              </div>
            </div>

            <div>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
                <ClipboardList className="h-3.5 w-3.5" />
                {t('suppliers.recentOrders')}
              </p>
              {supplierPurchases.length === 0 ? (
                <p className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-center text-xs text-slate-400 dark:border-slate-800">
                  {t('suppliers.noOrders')}
                </p>
              ) : (
                <div className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
                  {supplierPurchases.slice(0, 5).map((purchase) => (
                    <div key={purchase.id} className="flex items-center justify-between gap-3 px-3.5 py-2.5">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                          {purchase.number}
                        </p>
                        <p className="text-[10px] text-slate-400">{formatDate(purchase.createdAt)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={purchase.status}>
                          {t(`status.${purchase.status}`)}
                        </StatusBadge>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                          {money(purchase.total)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      <SupplierFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        supplier={editing}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        title={t('suppliers.deleteTitle')}
        description={t('suppliers.deleteDescription', { name: deleting?.name || '' })}
        confirmLabel={t('common.delete')}
      />
    </div>
  )
}
