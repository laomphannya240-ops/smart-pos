import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import {
  CalendarDays,
  KeyRound,
  Mail,
  Phone,
  Receipt,
  Save,
  Settings as SettingsIcon,
  ShieldCheck,
  ShoppingBag,
  Store,
  TrendingUp,
  User,
  Wallet,
} from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { StatCard } from '../../components/ui/StatCard'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge, StatusBadge } from '../../components/ui/Badge'
import { Input } from '../../components/ui/Input'
import { Avatar } from '../../components/ui/Avatar'
import { EmptyState } from '../../components/ui/EmptyState'
import { useAppStore } from '../../store/useAppStore'
import { useDataStore } from '../../store/useDataStore'
import { useCurrency } from '../../hooks/useCurrency'
import { completedSales } from '../../utils/analytics'
import { formatDate, formatNumber } from '../../utils/format'
import { canAccess } from '../../utils/permissions'

const roleTones = { admin: 'indigo', manager: 'violet', cashier: 'emerald' }

export function Profile() {
  const { t } = useTranslation()
  const money = useCurrency()
  const session = useAppStore((state) => state.session)
  const updateProfile = useAppStore((state) => state.updateProfile)
  const users = useDataStore((state) => state.users)
  const sales = useDataStore((state) => state.sales)
  const settings = useAppStore((state) => state.settings)

  const user = users.find((entry) => entry.id === session?.id)
  const [form, setForm] = useState({
    name: session?.name || '',
    email: session?.email || '',
    phone: session?.phone || '',
  })

  useEffect(() => {
    setForm({
      name: session?.name || '',
      email: session?.email || '',
      phone: session?.phone || '',
    })
  }, [session])

  const ownSales = useMemo(
    () =>
      completedSales(sales).filter((sale) => sale.cashierId === session?.id),
    [sales, session?.id],
  )

  const stats = useMemo(() => {
    const revenue = ownSales.reduce((sum, sale) => sum + Number(sale.total || 0), 0)
    return {
      orders: ownSales.length,
      revenue,
      average: ownSales.length ? revenue / ownSales.length : 0,
      items: ownSales.reduce(
        (sum, sale) =>
          sum + (sale.items || []).reduce((qty, item) => qty + Number(item.qty || 0), 0),
        0,
      ),
    }
  }, [ownSales])

  const recentSales = useMemo(
    () =>
      ownSales
        .slice()
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5),
    [ownSales],
  )

  const dirty =
    form.name !== (session?.name || '') ||
    form.email !== (session?.email || '') ||
    form.phone !== (session?.phone || '')

  function handleSave(event) {
    event.preventDefault()
    const name = form.name.trim()
    const email = form.email.trim().toLowerCase()
    const phone = form.phone.trim()

    if (!name) {
      toast.error(t('validation.nameRequired'))
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error(t('validation.emailInvalid'))
      return
    }
    const duplicate = users.find(
      (entry) => entry.id !== session?.id && entry.email.toLowerCase() === email,
    )
    if (duplicate) {
      toast.error(t('users.duplicateEmail'))
      return
    }

    updateProfile({ name, email, phone })
    toast.success(t('profile.updated'))
  }

  if (!session) return null

  return (
    <div className="space-y-5">
      <PageHeader
        title={t('profile.title')}
        description={t('profile.subtitle')}
        badge={<Badge tone={roleTones[session.role] || 'slate'}>{t(`role.${session.role}`)}</Badge>}
        actions={
          <>
            <Link to="/change-password">
              <Button variant="outline" leftIcon={KeyRound}>
                {t('profile.changePassword')}
              </Button>
            </Link>
            {canAccess(session.role, 'settings') && (
              <Link to="/settings">
                <Button variant="outline" leftIcon={SettingsIcon}>
                  {t('nav.settings')}
                </Button>
              </Link>
            )}
            {canAccess(session.role, 'pos') && (
              <Link to="/pos">
                <Button leftIcon={Store}>{t('profile.openRegister')}</Button>
              </Link>
            )}
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-1">
          <CardBody className="text-center">
            <div className="flex justify-center">
              <Avatar name={session.name} size="xl" status="online" className="ring-4 ring-indigo-50 dark:ring-indigo-500/10" />
            </div>
            <h2 className="mt-3 text-lg font-bold text-slate-900 dark:text-white">
              {session.name}
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500">{session.email}</p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              <Badge tone={roleTones[session.role] || 'slate'}>
                {t(`role.${session.role}`)}
              </Badge>
              <StatusBadge status={user?.status || 'active'}>
                {t(`common.${user?.status || 'active'}`)}
              </StatusBadge>
            </div>

            <div className="mt-5 space-y-2 rounded-2xl border border-slate-200/80 p-3.5 text-left text-xs dark:border-slate-800">
              <p className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <Mail className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{session.email}</span>
              </p>
              <p className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <Phone className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{session.phone || t('users.noPhone')}</span>
              </p>
              <p className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                <span>
                  {t('profile.joinedOn', { date: formatDate(user?.createdAt) })}
                </span>
              </p>
              <p className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                <span>{t(`users.scope.${session.role}`)}</span>
              </p>
            </div>

            <div className="mt-4 rounded-2xl bg-indigo-50/70 p-3.5 text-left dark:bg-indigo-500/10">
              <p className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-700 dark:text-indigo-300">
                <Store className="h-3.5 w-3.5" />
                {settings.storeName}
              </p>
              <p className="mt-1 text-[10px] leading-relaxed text-indigo-600/70 dark:text-indigo-300/70">
                {t('profile.storeNote')}
              </p>
            </div>
          </CardBody>
        </Card>

        <div className="space-y-4 xl:col-span-2">
          <Card>
            <CardHeader
              title={t('profile.personalInfo')}
              subtitle={t('profile.personalInfoHint')}
              icon={User}
            />
            <CardBody>
              <form onSubmit={handleSave} className="space-y-4" noValidate>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label={t('common.fullName')}
                    value={form.name}
                    onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                    icon={User}
                    required
                  />
                  <Input
                    label={t('common.phone')}
                    value={form.phone}
                    onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                    icon={Phone}
                    placeholder="+855 12 000 000"
                  />
                  <Input
                    label={t('common.email')}
                    type="email"
                    value={form.email}
                    onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                    icon={Mail}
                    containerClassName="sm:col-span-2"
                    required
                  />
                </div>
                <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3.5 py-3 dark:bg-slate-800/50">
                  <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                    {t('profile.emailNote')}
                  </p>
                  <Button type="submit" leftIcon={Save} disabled={!dirty}>
                    {t('common.saveChanges')}
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
              label={t('profile.mySales')}
              value={formatNumber(stats.orders)}
              icon={ShoppingBag}
              tone="indigo"
            />
            <StatCard
              label={t('sales.revenue')}
              value={money(stats.revenue)}
              icon={Wallet}
              tone="emerald"
            />
            <StatCard
              label={t('dashboard.avgOrder')}
              value={money(stats.average)}
              icon={TrendingUp}
              tone="violet"
            />
            <StatCard
              label={t('sales.itemsSold')}
              value={formatNumber(stats.items)}
              icon={Receipt}
              tone="amber"
            />
          </div>
        </div>
      </div>

      <Card>
        <CardHeader
          title={t('profile.recentSales')}
          subtitle={t('profile.recentSalesHint')}
          icon={Receipt}
          action={
            canAccess(session.role, 'sales') && (
              <Link to="/sales">
                <Button variant="outline" size="sm">
                  {t('common.viewAll')}
                </Button>
              </Link>
            )
          }
        />
        {recentSales.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title={t('profile.noSales')}
            description={t('profile.noSalesHint')}
            compact
          />
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentSales.map((sale) => (
              <div
                key={sale.id}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
                    <Receipt className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                      {sale.number}
                    </p>
                    <p className="truncate text-[10px] text-slate-400">
                      {sale.customerName} · {formatDate(sale.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge tone="slate">{t(`payment.${sale.paymentMethod}`)}</Badge>
                  <StatusBadge status={sale.status}>{t(`status.${sale.status}`)}</StatusBadge>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    {money(sale.total)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
