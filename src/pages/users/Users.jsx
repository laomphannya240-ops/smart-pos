import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import {
  Download,
  Eye,
  Mail,
  MoreHorizontal,
  Pencil,
  Phone,
  SearchX,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserCog,
  UserRound,
  UserRoundX,
  Users as UsersIcon,
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
import { Tabs } from '../../components/ui/Tabs'
import { UserFormModal } from '../../components/forms/UserForm'
import { useDataStore } from '../../store/useDataStore'
import { useAppStore } from '../../store/useAppStore'
import { useCurrency } from '../../hooks/useCurrency'
import { useDelayedReady } from '../../hooks/useDelayedReady'
import { useTableControls } from '../../hooks/useTableControls'
import { completedSales } from '../../utils/analytics'
import { downloadCSV } from '../../utils/csv'
import { formatDate, formatNumber } from '../../utils/format'

const roleTones = { admin: 'indigo', manager: 'violet', cashier: 'emerald' }
const roleIcons = { admin: ShieldCheck, manager: UserCog, cashier: UserRound }

export function Users() {
  const { t } = useTranslation()
  const money = useCurrency()
  const session = useAppStore((state) => state.session)
  const users = useDataStore((state) => state.users)
  const sales = useDataStore((state) => state.sales)
  const updateUser = useDataStore((state) => state.updateUser)
  const deleteUser = useDataStore((state) => state.deleteUser)
  const ready = useDelayedReady(260)

  const [tab, setTab] = useState('all')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [viewing, setViewing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [toggling, setToggling] = useState(null)

  const { query, setQuery, filters, setFilter, resetFilters } = useTableControls({
    status: 'all',
  })

  const stats = useMemo(() => {
    const active = users.filter((user) => user.status === 'active')
    return {
      total: users.length,
      active: active.length,
      admins: users.filter((user) => user.role === 'admin').length,
      managers: users.filter((user) => user.role === 'manager').length,
      cashiers: users.filter((user) => user.role === 'cashier').length,
    }
  }, [users])

  const advisorCount = stats.admins + stats.managers

  const rows = useMemo(() => {
    const term = query.trim().toLowerCase()
    return users
      .filter(
        (user) =>
          !term ||
          user.name.toLowerCase().includes(term) ||
          user.email.toLowerCase().includes(term) ||
          String(user.phone || '').includes(term),
      )
      .filter((user) => tab === 'all' || user.role === tab)
      .filter((user) => filters.status === 'all' || user.status === filters.status)
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [users, query, tab, filters])

  const viewingStats = useMemo(() => {
    if (!viewing) return null
    const own = completedSales(sales).filter((sale) => sale.cashierId === viewing.id)
    return {
      orders: own.length,
      revenue: own.reduce((sum, sale) => sum + Number(sale.total || 0), 0),
      lastSale: own.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0] || null,
    }
  }, [viewing, sales])

  const tabs = [
    { key: 'all', label: t('common.all'), count: users.length },
    { key: 'admin', label: t('role.admin'), count: stats.admins },
    { key: 'manager', label: t('role.manager'), count: stats.managers },
    { key: 'cashier', label: t('role.cashier'), count: stats.cashiers },
  ]

  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }

  function confirmDelete() {
    if (!deleting) return
    if (deleting.id === session?.id) {
      toast.error(t('users.cannotDeleteSelf'))
      setDeleting(null)
      return
    }
    if (deleting.role === 'admin' && stats.admins <= 1) {
      toast.error(t('users.lastAdmin'))
      setDeleting(null)
      return
    }
    deleteUser(deleting.id)
    if (viewing?.id === deleting.id) setViewing(null)
    toast.success(t('users.deleted', { name: deleting.name }))
    setDeleting(null)
  }

  function confirmToggle() {
    if (!toggling) return
    const nextStatus = toggling.status === 'active' ? 'inactive' : 'active'
    updateUser(toggling.id, { status: nextStatus })
    toast.success(
      t(nextStatus === 'active' ? 'users.activated' : 'users.deactivated', {
        name: toggling.name,
      }),
    )
    setToggling(null)
  }

  function exportCSV() {
    downloadCSV(
      'smartpos-users',
      [
        { label: t('common.fullName'), key: 'name' },
        { label: t('common.email'), key: 'email' },
        { label: t('common.phone'), key: 'phone' },
        { label: t('users.role'), value: (row) => t(`role.${row.role}`) },
        { label: t('common.status'), value: (row) => t(`common.${row.status}`) },
        { label: t('users.joined'), value: (row) => formatDate(row.createdAt) },
      ],
      rows,
    )
    toast.success(t('common.exported'))
  }

  const columns = [
    {
      key: 'name',
      header: t('users.user'),
      sortable: true,
      render: (user) => {
        const RoleIcon = roleIcons[user.role] || UserRound
        return (
          <div className="flex items-center gap-3">
            <Avatar name={user.name} size="sm" status={user.status === 'active' ? 'online' : undefined} />
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-800 dark:text-slate-100">
                <span className="truncate">{user.name}</span>
                {user.id === session?.id && (
                  <span className="rounded bg-slate-100 px-1 text-[9px] font-bold uppercase text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                    {t('users.you')}
                  </span>
                )}
              </p>
              <p className="flex items-center gap-1 truncate text-[11px] text-slate-400">
                <Mail className="h-3 w-3" />
                {user.email}
              </p>
            </div>
            <RoleIcon className="ml-1 hidden h-4 w-4 text-slate-300 dark:text-slate-600 sm:block" />
          </div>
        )
      },
    },
    {
      key: 'role',
      header: t('users.role'),
      sortable: true,
      render: (user) => (
        <Badge tone={roleTones[user.role] || 'slate'}>{t(`role.${user.role}`)}</Badge>
      ),
    },
    {
      key: 'phone',
      header: t('common.phone'),
      render: (user) => (
        <span className="text-xs text-slate-600 dark:text-slate-300">{user.phone || '—'}</span>
      ),
    },
    {
      key: 'createdAt',
      header: t('users.joined'),
      sortable: true,
      render: (user) => (
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {formatDate(user.createdAt)}
        </span>
      ),
    },
    {
      key: 'status',
      header: t('common.status'),
      sortable: true,
      render: (user) => (
        <StatusBadge status={user.status}>{t(`common.${user.status}`)}</StatusBadge>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (user) => {
        const isSelf = user.id === session?.id
        return (
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
                    setViewing(user)
                    close()
                  }}
                >
                  {t('common.viewDetails')}
                </DropdownItem>
                <DropdownItem
                  icon={Pencil}
                  onClick={() => {
                    setEditing(user)
                    setFormOpen(true)
                    close()
                  }}
                >
                  {t('common.edit')}
                </DropdownItem>
                {!isSelf && (
                  <DropdownItem
                    icon={user.status === 'active' ? UserRoundX : UserCheck}
                    onClick={() => {
                      setToggling(user)
                      close()
                    }}
                  >
                    {t(user.status === 'active' ? 'users.deactivate' : 'users.activate')}
                  </DropdownItem>
                )}
                {!isSelf && !(user.role === 'admin' && stats.admins <= 1) && (
                  <DropdownItem
                    icon={Trash2}
                    danger
                    onClick={() => {
                      setDeleting(user)
                      close()
                    }}
                  >
                    {t('common.delete')}
                  </DropdownItem>
                )}
              </div>
            )}
          </Dropdown>
        )
      },
    },
  ]

  return (
    <div className="space-y-5">
      <PageHeader
        title={t('users.title')}
        description={t('users.subtitle')}
        badge={<Badge tone="indigo">{t('common.countItems', { count: users.length })}</Badge>}
        actions={
          <>
            <Button variant="outline" leftIcon={Download} onClick={exportCSV} disabled={!rows.length}>
              {t('common.export')}
            </Button>
            <Button leftIcon={UserCog} onClick={openCreate}>
              {t('users.addUser')}
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard
          label={t('users.totalUsers')}
          value={formatNumber(stats.total)}
          icon={UsersIcon}
          tone="indigo"
          hint={t('users.seatsHint')}
          loading={!ready}
        />
        <StatCard
          label={t('users.activeUsers')}
          value={formatNumber(stats.active)}
          icon={UserCheck}
          tone="emerald"
          hint={t('users.activeHint')}
          loading={!ready}
        />
        <StatCard
          label={t('users.management')}
          value={formatNumber(advisorCount)}
          icon={ShieldCheck}
          tone="violet"
          hint={t('users.managementHint')}
          loading={!ready}
        />
        <StatCard
          label={t('role.cashier')}
          value={formatNumber(stats.cashiers)}
          icon={UserRound}
          tone="amber"
          hint={t('users.cashierHint')}
          loading={!ready}
        />
      </div>

      <Tabs items={tabs} value={tab} onChange={setTab} />

      <Card>
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 dark:border-slate-800 lg:flex-row lg:items-center">
          <SearchInput
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('users.searchPlaceholder')}
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
          initialSort={{ key: 'name', dir: 'asc' }}
          onRowClick={(user) => setViewing(user)}
          emptyIcon={UsersIcon}
          emptyTitle={t('users.noUsers')}
          emptyDescription={t('users.noUsersHint')}
        />
      </Card>

      <Modal
        open={Boolean(viewing)}
        onClose={() => setViewing(null)}
        title={viewing?.name || t('users.userDetails')}
        description={viewing?.email}
        icon={UserCog}
        size="md"
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
            <div className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/30">
              <Avatar
                name={viewing.name}
                size="xl"
                status={viewing.status === 'active' ? 'online' : undefined}
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {viewing.name}
                  </h3>
                  <Badge tone={roleTones[viewing.role] || 'slate'}>
                    {t(`role.${viewing.role}`)}
                  </Badge>
                  <StatusBadge status={viewing.status}>
                    {t(`common.${viewing.status}`)}
                  </StatusBadge>
                </div>
                <div className="mt-2 space-y-1 text-xs text-slate-500 dark:text-slate-400">
                  <p className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" /> {viewing.email}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5" /> {viewing.phone || t('users.noPhone')}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: t('users.orders'), value: formatNumber(viewingStats.orders) },
                { label: t('users.revenue'), value: money(viewingStats.revenue) },
                {
                  label: t('users.lastSale'),
                  value: viewingStats.lastSale
                    ? formatDate(viewingStats.lastSale.createdAt)
                    : '—',
                },
                { label: t('users.joined'), value: formatDate(viewing.createdAt) },
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

            <div className="rounded-xl border border-slate-200/80 px-3.5 py-3 text-xs dark:border-slate-800">
              <p className="flex items-center justify-between gap-3">
                <span className="text-slate-400">{t('users.accessScope')}</span>
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  {t(`users.scope.${viewing.role}`)}
                </span>
              </p>
            </div>

            {viewing.id === session?.id && (
              <p className="rounded-xl bg-indigo-50/70 px-3.5 py-3 text-[11px] leading-relaxed text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
                {t('users.selfNote')}
              </p>
            )}
          </div>
        )}
      </Modal>

      <UserFormModal open={formOpen} onClose={() => setFormOpen(false)} user={editing} />

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        title={t('users.deleteTitle')}
        description={t('users.deleteDescription', { name: deleting?.name || '' })}
        confirmLabel={t('common.delete')}
      />

      <ConfirmDialog
        open={Boolean(toggling)}
        onClose={() => setToggling(null)}
        onConfirm={confirmToggle}
        title={t(
          toggling?.status === 'active' ? 'users.deactivateTitle' : 'users.activateTitle',
        )}
        description={t(
          toggling?.status === 'active'
            ? 'users.deactivateDescription'
            : 'users.activateDescription',
          { name: toggling?.name || '' },
        )}
        confirmLabel={t(toggling?.status === 'active' ? 'users.deactivate' : 'users.activate')}
        tone={toggling?.status === 'active' ? 'danger' : 'primary'}
      />
    </div>
  )
}
