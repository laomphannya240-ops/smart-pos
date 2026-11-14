import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import {
  CalendarDays,
  Download,
  Eye,
  Mail,
  MapPin,
  MoreHorizontal,
  Pencil,
  Phone,
  Plus,
  SearchX,
  ShoppingBag,
  Trash2,
  UserPlus,
  Users,
  Wallet,
} from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { StatCard } from '../../components/ui/StatCard'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge, StatusBadge } from '../../components/ui/Badge'
import { SearchInput, Select } from '../../components/ui/Input'
import { Avatar } from '../../components/ui/Avatar'
import { Dropdown, DropdownItem } from '../../components/ui/Dropdown'
import { Modal } from '../../components/ui/Modal'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { DataTable } from '../../components/tables/DataTable'
import { CustomerFormModal } from '../../components/forms/CustomerForm'
import { useDataStore } from '../../store/useDataStore'
import { useAppStore } from '../../store/useAppStore'
import { useCurrency } from '../../hooks/useCurrency'
import { useDelayedReady } from '../../hooks/useDelayedReady'
import { useTableControls } from '../../hooks/useTableControls'
import { customerStats } from '../../utils/analytics'
import { downloadCSV } from '../../utils/csv'
import { formatDate } from '../../utils/format'

export function Customers() {
  const { t } = useTranslation()
  const money = useCurrency()
  const role = useAppStore((state) => state.session?.role)
  const canManage = role !== 'cashier'
  const customers = useDataStore((state) => state.customers)
  const sales = useDataStore((state) => state.sales)
  const deleteCustomer = useDataStore((state) => state.deleteCustomer)
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
    return customers
      .filter(
        (customer) =>
          !term ||
          customer.name.toLowerCase().includes(term) ||
          customer.phone.includes(term) ||
          String(customer.email || '').toLowerCase().includes(term),
      )
      .filter((customer) => filters.status === 'all' || customer.status === filters.status)
      .map((customer) => {
        const stats = customerStats(sales, customer.id)
        return { ...customer, stats }
      })
  }, [customers, sales, query, filters])

  const stats = useMemo(() => {
    const withStats = customers.map((customer) => customerStats(sales, customer.id))
    const spent = withStats.reduce((sum, entry) => sum + entry.totalSpent, 0)
    const orders = withStats.reduce((sum, entry) => sum + entry.orders, 0)
    return {
      active: customers.filter((customer) => customer.status === 'active').length,
      spent,
      orders,
      avg: orders ? spent / orders : 0,
    }
  }, [customers, sales])

  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }

  function confirmDelete() {
    if (!deleting) return
    deleteCustomer(deleting.id)
    toast.success(t('customers.deleted', { name: deleting.name }))
    setDeleting(null)
  }

  function exportCSV() {
    downloadCSV(
      'smartpos-customers',
      [
        { label: t('common.fullName'), key: 'name' },
        { label: t('common.phone'), key: 'phone' },
        { label: t('common.email'), key: 'email' },
        { label: t('common.address'), key: 'address' },
        { label: t('customers.orders'), value: (row) => row.stats.orders },
        { label: t('customers.totalSpent'), value: (row) => row.stats.totalSpent },
        { label: t('common.status'), value: (row) => t(`common.${row.status}`) },
      ],
      rows,
    )
    toast.success(t('common.exported'))
  }

  const columns = [
    {
      key: 'name',
      header: t('common.customer'),
      sortable: true,
      render: (customer) => (
        <div className="flex items-center gap-3">
          <Avatar name={customer.name} size="sm" />
          <div className="min-w-0">
            <p className="max-w-[200px] truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
              {customer.name}
            </p>
            <p className="max-w-[220px] truncate text-[11px] text-slate-400">
              {customer.email || t('customers.noEmail')}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'phone',
      header: t('common.phone'),
      render: (customer) => (
        <span className="text-xs text-slate-600 dark:text-slate-300">{customer.phone}</span>
      ),
    },
    {
      key: 'orders',
      header: t('customers.orders'),
      align: 'center',
      sortable: true,
      sortValue: (customer) => customer.stats.orders,
      render: (customer) => (
        <Badge tone="indigo">{customer.stats.orders}</Badge>
      ),
    },
    {
      key: 'totalSpent',
      header: t('customers.totalSpent'),
      align: 'right',
      sortable: true,
      sortValue: (customer) => customer.stats.totalSpent,
      render: (customer) => (
        <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
          {money(customer.stats.totalSpent)}
        </span>
      ),
    },
    {
      key: 'lastPurchase',
      header: t('customers.lastPurchase'),
      sortable: true,
      sortValue: (customer) => customer.stats.lastPurchase || '',
      render: (customer) => (
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {customer.stats.lastPurchase ? formatDate(customer.stats.lastPurchase) : t('customers.noPurchases')}
        </span>
      ),
    },
    {
      key: 'status',
      header: t('common.status'),
      sortable: true,
      render: (customer) => (
        <StatusBadge status={customer.status}>{t(`common.${customer.status}`)}</StatusBadge>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (customer) => (
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
                  setViewing(customer)
                  close()
                }}
              >
                {t('common.viewDetails')}
              </DropdownItem>
              {canManage && (
                <>
                  <DropdownItem
                    icon={Pencil}
                    onClick={() => {
                      setEditing(customer)
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
                      setDeleting(customer)
                      close()
                    }}
                  >
                    {t('common.delete')}
                  </DropdownItem>
                </>
              )}
            </div>
          )}
        </Dropdown>
      ),
    },
  ]

  const viewingStats = viewing ? customerStats(sales, viewing.id) : null

  return (
    <div className="space-y-5">
      <PageHeader
        title={t('customers.title')}
        description={canManage ? t('customers.subtitle') : t('customers.subtitleReadOnly')}
        badge={<Badge tone="emerald">{t('common.countItems', { count: customers.length })}</Badge>}
        actions={
          <>
            <Button variant="outline" leftIcon={Download} onClick={exportCSV} disabled={!rows.length}>
              {t('common.export')}
            </Button>
            {canManage && (
              <Button leftIcon={Plus} onClick={openCreate}>
                {t('customers.addCustomer')}
              </Button>
            )}
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard
          label={t('customers.totalCustomers')}
          value={customers.length}
          icon={Users}
          tone="emerald"
          hint={t('customers.activeCount', { count: stats.active })}
          loading={!ready}
        />
        <StatCard
          label={t('customers.totalSpent')}
          value={money(stats.spent)}
          icon={Wallet}
          tone="indigo"
          hint={t('customers.lifetimeValue')}
          loading={!ready}
        />
        <StatCard
          label={t('customers.completedOrders')}
          value={stats.orders}
          icon={ShoppingBag}
          tone="violet"
          hint={t('customers.acrossCustomers')}
          loading={!ready}
        />
        <StatCard
          label={t('dashboard.avgOrder')}
          value={money(stats.avg)}
          icon={UserPlus}
          tone="amber"
          hint={t('customers.avgHint')}
          loading={!ready}
        />
      </div>

      <Card>
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 dark:border-slate-800 lg:flex-row lg:items-center">
          <SearchInput
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('customers.searchPlaceholder')}
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
          initialSort={{ key: 'totalSpent', dir: 'desc' }}
          onRowClick={(customer) => setViewing(customer)}
          emptyIcon={Users}
          emptyTitle={t('customers.noCustomers')}
          emptyDescription={t('customers.noCustomersHint')}
        />
      </Card>

      <Modal
        open={Boolean(viewing)}
        onClose={() => setViewing(null)}
        title={viewing?.name || t('customers.customerDetails')}
        description={viewing?.email}
        icon={Users}
        size="lg"
        footer={
          <div className="flex justify-between gap-2">
            <Button variant="outline" onClick={() => setViewing(null)}>
              {t('common.close')}
            </Button>
            {canManage && (
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
            <div className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/30">
              <Avatar name={viewing.name} size="xl" status="online" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {viewing.name}
                  </h3>
                  <StatusBadge status={viewing.status}>{t(`common.${viewing.status}`)}</StatusBadge>
                </div>
                <div className="mt-2 space-y-1 text-xs text-slate-500 dark:text-slate-400">
                  <p className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5" /> {viewing.phone}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" /> {viewing.email || t('customers.noEmail')}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" /> {viewing.address || t('customers.noAddress')}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: t('customers.orders'), value: viewingStats.orders },
                { label: t('customers.totalSpent'), value: money(viewingStats.totalSpent) },
                {
                  label: t('dashboard.avgOrder'),
                  value: money(viewingStats.orders ? viewingStats.totalSpent / viewingStats.orders : 0),
                },
                {
                  label: t('customers.lastPurchase'),
                  value: viewingStats.lastPurchase ? formatDate(viewingStats.lastPurchase) : '—',
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-slate-200/80 px-3 py-2.5 dark:border-slate-800"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    {item.label}
                  </p>
                  <p className="mt-1 truncate text-sm font-bold text-slate-800 dark:text-slate-100">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            {viewing.notes && (
              <div className="rounded-xl bg-amber-50/80 px-3.5 py-3 text-xs leading-relaxed text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                {viewing.notes}
              </div>
            )}

            <div>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
                <CalendarDays className="h-3.5 w-3.5" />
                {t('customers.recentPurchases')}
              </p>
              {viewingStats.sales.length === 0 ? (
                <p className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-center text-xs text-slate-400 dark:border-slate-800">
                  {t('customers.noPurchasesHint')}
                </p>
              ) : (
                <div className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
                  {viewingStats.sales.slice(0, 5).map((sale) => (
                    <div key={sale.id} className="flex items-center justify-between gap-3 px-3.5 py-2.5">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                          {sale.number}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {formatDate(sale.createdAt)} · {t(`payment.${sale.paymentMethod}`)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                          {money(sale.total)}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {t('sales.itemCount', { count: sale.items?.length || 0 })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {canManage && (
        <CustomerFormModal
          open={formOpen}
          onClose={() => setFormOpen(false)}
          customer={editing}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        title={t('customers.deleteTitle')}
        description={t('customers.deleteDescription', { name: deleting?.name || '' })}
        confirmLabel={t('common.delete')}
      />
    </div>
  )
}
