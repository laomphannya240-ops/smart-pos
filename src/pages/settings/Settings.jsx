import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import {
  AlertTriangle,
  Check,
  Database,
  Download,
  Languages,
  Moon,
  Palette,
  ReceiptText,
  RotateCcw,
  Save,
  SlidersHorizontal,
  Store,
  Sun,
  Trash2,
  Upload,
} from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Input, Select, Switch, Textarea } from '../../components/ui/Input'
import { Tabs } from '../../components/ui/Tabs'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { useAppStore } from '../../store/useAppStore'
import { useDataStore } from '../../store/useDataStore'
import { useCurrency } from '../../hooks/useCurrency'
import { formatNumber } from '../../utils/format'
import { cn } from '../../utils/cn'

const tabs = [
  { key: 'store', labelKey: 'settings.storeTab', icon: Store },
  { key: 'receipt', labelKey: 'settings.receiptTab', icon: ReceiptText },
  { key: 'preferences', labelKey: 'settings.preferencesTab', icon: SlidersHorizontal },
  { key: 'data', labelKey: 'settings.dataTab', icon: Database },
]

export function Settings() {
  const { t } = useTranslation()
  const money = useCurrency()
  const settings = useAppStore((state) => state.settings)
  const updateSettings = useAppStore((state) => state.updateSettings)
  const resetSettings = useAppStore((state) => state.resetSettings)
  const theme = useAppStore((state) => state.theme)
  const setTheme = useAppStore((state) => state.setTheme)
  const language = useAppStore((state) => state.language)
  const setLanguage = useAppStore((state) => state.setLanguage)
  const sidebarCollapsed = useAppStore((state) => state.sidebarCollapsed)
  const setSidebarCollapsed = useAppStore((state) => state.setSidebarCollapsed)
  const resetData = useDataStore((state) => state.resetData)
  const products = useDataStore((state) => state.products)
  const sales = useDataStore((state) => state.sales)
  const customers = useDataStore((state) => state.customers)
  const payments = useDataStore((state) => state.payments)
  const purchases = useDataStore((state) => state.purchases)
  const expenses = useDataStore((state) => state.expenses)
  const users = useDataStore((state) => state.users)
  const movements = useDataStore((state) => state.movements)

  const [tab, setTab] = useState('store')
  const [draft, setDraft] = useState(settings)
  const [confirming, setConfirming] = useState(null)
  const fileRef = useRef(null)

  useEffect(() => {
    setDraft(settings)
  }, [settings])

  const dirty = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(settings),
    [draft, settings],
  )

  const storage = useMemo(() => {
    const counts = [
      { label: t('nav.products'), value: products.length },
      { label: t('nav.sales'), value: sales.length },
      { label: t('nav.payments'), value: payments.length },
      { label: t('nav.purchases'), value: purchases.length },
      { label: t('nav.expenses'), value: expenses.length },
      { label: t('nav.customers'), value: customers.length },
      { label: t('nav.users'), value: users.length },
      { label: t('nav.inventory'), value: movements.length },
    ]
    let bytes = 0
    try {
      for (let index = 0; index < localStorage.length; index += 1) {
        const key = localStorage.key(index)
        if (!key) continue
        bytes += key.length + String(localStorage.getItem(key) || '').length
      }
    } catch {
      bytes = 0
    }
    return { counts, bytes }
  }, [products, sales, payments, purchases, expenses, customers, users, movements, t])

  const tabItems = tabs.map((item) => ({
    key: item.key,
    label: t(item.labelKey),
    icon: item.icon,
  }))

  function set(key, value) {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  function handleLogoFile(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error(t('settings.invalidImage'))
      return
    }
    if (file.size > 700 * 1024) {
      toast.error(t('settings.imageTooLarge'))
      return
    }
    const reader = new FileReader()
    reader.onload = () => set('logoImage', String(reader.result || ''))
    reader.readAsDataURL(file)
  }

  function handleSave() {
    const name = String(draft.storeName || '').trim()
    if (!name) {
      toast.error(t('validation.storeNameRequired'))
      setTab('store')
      return
    }
    const taxRate = Number(draft.taxRate)
    if (!Number.isFinite(taxRate) || taxRate < 0 || taxRate > 100) {
      toast.error(t('validation.taxRateRange'))
      setTab('receipt')
      return
    }
    updateSettings({
      ...draft,
      storeName: name,
      taxRate,
      email: String(draft.email || '').trim(),
      phone: String(draft.phone || '').trim(),
    })
    toast.success(t('settings.saved'))
  }

  function handleResetDraft() {
    setDraft(settings)
    toast.success(t('settings.discarded'))
  }

  function handleResetData() {
    resetData()
    setConfirming(null)
    toast.success(t('settings.dataResetToast'))
  }

  function handleResetSettings() {
    resetSettings()
    setConfirming(null)
    toast.success(t('settings.settingsResetToast'))
  }

  function exportBackup() {
    const payload = {
      exportedAt: new Date().toISOString(),
      app: 'SmartPOS',
      settings,
      data: {
        products,
        customers,
        users,
        sales,
        payments,
        purchases,
        expenses,
        movements,
      },
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json;charset=utf-8;',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `smartpos-backup-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast.success(t('settings.backupDownloaded'))
  }

  const logoPreview = (
    <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-indigo-600 text-3xl text-white shadow-lg shadow-indigo-600/25">
      {draft.logoImage ? (
        <img src={draft.logoImage} alt={draft.storeName} className="h-full w-full object-cover" />
      ) : (
        <span className="leading-none">{draft.logo || '🛍️'}</span>
      )}
    </span>
  )

  return (
    <div className="space-y-5">
      <PageHeader
        title={t('settings.title')}
        description={t('settings.subtitle')}
        badge={
          dirty ? <Badge tone="amber">{t('settings.unsaved')}</Badge> : <Badge tone="emerald">{t('settings.synced')}</Badge>
        }
        actions={
          <>
            {dirty && (
              <Button variant="outline" leftIcon={RotateCcw} onClick={handleResetDraft}>
                {t('settings.discard')}
              </Button>
            )}
            <Button leftIcon={Save} onClick={handleSave} disabled={!dirty}>
              {t('common.saveChanges')}
            </Button>
          </>
        }
      />

      <Tabs items={tabItems} value={tab} onChange={setTab} variant="underline" />

      {tab === 'store' && (
        <div className="grid gap-4 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardHeader
              title={t('settings.storeProfile')}
              subtitle={t('settings.storeProfileHint')}
              icon={Store}
            />
            <CardBody className="space-y-5">
              <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/30 sm:flex-row sm:items-center">
                {logoPreview}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                    {t('settings.storeLogo')}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-slate-400 dark:text-slate-500">
                    {t('settings.storeLogoHint')}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      leftIcon={Upload}
                      onClick={() => fileRef.current?.click()}
                    >
                      {t('settings.uploadLogo')}
                    </Button>
                    {draft.logoImage && (
                      <Button
                        size="sm"
                        variant="ghost"
                        leftIcon={Trash2}
                        onClick={() => set('logoImage', '')}
                      >
                        {t('settings.removeLogo')}
                      </Button>
                    )}
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoFile}
                    />
                  </div>
                </div>
                <div className="w-full sm:w-32">
                  <Input
                    label={t('settings.logoEmoji')}
                    value={draft.logo}
                    maxLength={4}
                    onChange={(event) => set('logo', event.target.value)}
                    className="text-center text-lg"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label={t('settings.storeName')}
                  value={draft.storeName}
                  onChange={(event) => set('storeName', event.target.value)}
                  placeholder="SmartPOS Market"
                  required
                />
                <Input
                  label={t('settings.website')}
                  value={draft.website}
                  onChange={(event) => set('website', event.target.value)}
                  placeholder="www.smartpos.com"
                />
                <Input
                  label={t('common.email')}
                  type="email"
                  value={draft.email}
                  onChange={(event) => set('email', event.target.value)}
                  placeholder="hello@smartpos.com"
                />
                <Input
                  label={t('common.phone')}
                  value={draft.phone}
                  onChange={(event) => set('phone', event.target.value)}
                  placeholder="+855 23 456 789"
                />
                <Textarea
                  label={t('common.address')}
                  value={draft.address}
                  onChange={(event) => set('address', event.target.value)}
                  rows={3}
                  containerClassName="sm:col-span-2"
                />
              </div>
            </CardBody>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader
                title={t('settings.livePreview')}
                subtitle={t('settings.livePreviewHint')}
                icon={Palette}
              />
              <CardBody>
                <div className="rounded-2xl border border-slate-100 bg-white p-4 text-center shadow-sm dark:border-slate-800">
                  <div className="flex justify-center">{logoPreview}</div>
                  <p className="mt-2 text-sm font-extrabold text-slate-900">{draft.storeName}</p>
                  <p className="mt-0.5 line-clamp-2 text-[10px] text-slate-500">{draft.address}</p>
                  <p className="text-[10px] text-slate-500">{draft.phone}</p>
                  <div className="my-3 border-t border-dashed border-slate-200" />
                  <div className="space-y-1 text-[10px]">
                    <div className="flex justify-between text-slate-500">
                      <span>{t('settings.sampleItem')}</span>
                      <span>{money(12)}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>
                        {t('receipt.tax')} ({draft.taxRate || 0}%)
                      </span>
                      <span>{money((12 * (Number(draft.taxRate) || 0)) / 100)}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-200 pt-1 text-xs font-bold text-slate-900">
                      <span>{t('common.total')}</span>
                      <span>{money(12 + (12 * (Number(draft.taxRate) || 0)) / 100)}</span>
                    </div>
                  </div>
                  <div className="my-3 border-t border-dashed border-slate-200" />
                  <p className="text-[9px] font-semibold text-slate-600">{draft.receiptFooter}</p>
                  <p className="mt-0.5 text-[8px] text-slate-400">{draft.receiptNote}</p>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">{t('settings.workspace')}</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">SmartPOS v1.0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">{t('settings.account')}</span>
                  <Badge tone="indigo">{t('role.admin')}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">{t('settings.storageMode')}</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    {t('settings.localBrowser')}
                  </span>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      )}

      {tab === 'receipt' && (
        <div className="grid gap-4 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardHeader
              title={t('settings.receiptSettings')}
              subtitle={t('settings.receiptSettingsHint')}
              icon={ReceiptText}
            />
            <CardBody className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <Select
                  label={t('settings.currency')}
                  value={draft.currency}
                  onChange={(event) => set('currency', event.target.value)}
                  hint={t('settings.currencyHint')}
                >
                  <option value="USD">USD — US Dollar</option>
                  <option value="KHR">KHR — Cambodian Riel</option>
                </Select>
                <Input
                  label={t('settings.taxRate')}
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={draft.taxRate}
                  onChange={(event) => set('taxRate', event.target.value)}
                  suffix="%"
                  hint={t('settings.taxRateHint')}
                />
              </div>

              <div className="rounded-xl border border-slate-200/80 p-3.5 dark:border-slate-800">
                <Switch
                  checked={Boolean(draft.showLogo)}
                  onChange={(value) => set('showLogo', value)}
                  label={t('settings.showLogo')}
                  description={t('settings.showLogoHint')}
                />
              </div>

              <Textarea
                label={t('settings.receiptFooter')}
                value={draft.receiptFooter}
                onChange={(event) => set('receiptFooter', event.target.value)}
                rows={2}
                hint={t('settings.receiptFooterHint')}
              />
              <Textarea
                label={t('settings.receiptNote')}
                value={draft.receiptNote}
                onChange={(event) => set('receiptNote', event.target.value)}
                rows={2}
                hint={t('settings.receiptNoteHint')}
              />

              <div className="rounded-xl bg-indigo-50/70 px-3.5 py-3 text-[11px] leading-relaxed text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
                {t('settings.receiptApplied')}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title={t('settings.receiptPreview')} subtitle={t('settings.receiptPreviewHint')} />
            <CardBody>
              <div className="mx-auto max-w-[280px] rounded-xl border border-slate-200 bg-white px-4 py-5 text-center shadow-sm">
                {draft.showLogo && <div className="flex justify-center">{logoPreview}</div>}
                <p className="mt-2 text-sm font-extrabold text-slate-900">{draft.storeName}</p>
                <p className="mt-0.5 text-[9px] leading-relaxed text-slate-500">{draft.address}</p>
                <p className="text-[9px] text-slate-500">
                  {draft.phone} · {draft.email}
                </p>
                <div className="my-3 border-t border-dashed border-slate-300" />
                <div className="space-y-1 text-left text-[9px]">
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-700">{t('settings.sampleProduct')}</span>
                    <span className="font-semibold text-slate-900">{money(12)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>{t('receipt.subtotal')}</span>
                    <span>{money(12)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>
                      {t('receipt.tax')} ({draft.taxRate || 0}%)
                    </span>
                    <span>{money((12 * (Number(draft.taxRate) || 0)) / 100)}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-300 pt-1 text-[10px] font-extrabold text-slate-900">
                    <span>{t('receipt.total')}</span>
                    <span>{money(12 + (12 * (Number(draft.taxRate) || 0)) / 100)}</span>
                  </div>
                </div>
                <div className="my-3 border-t border-dashed border-slate-300" />
                <p className="text-[9px] font-semibold text-slate-700">{draft.receiptFooter}</p>
                <p className="mt-0.5 text-[8px] leading-relaxed text-slate-400">{draft.receiptNote}</p>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {tab === 'preferences' && (
        <div className="grid gap-4 xl:grid-cols-2">
          <Card>
            <CardHeader
              title={t('settings.appearance')}
              subtitle={t('settings.appearanceHint')}
              icon={Palette}
            />
            <CardBody className="space-y-5">
              <div>
                <p className="mb-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                  {t('settings.theme')}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: 'light', label: t('settings.light'), icon: Sun },
                    { key: 'dark', label: t('settings.dark'), icon: Moon },
                  ].map((option) => {
                    const Icon = option.icon
                    const active = theme === option.key
                    return (
                      <button
                        key={option.key}
                        type="button"
                        onClick={() => setTheme(option.key)}
                        className={cn(
                          'flex items-center gap-3 rounded-xl border p-3.5 text-left transition',
                          active
                            ? 'border-indigo-400 bg-indigo-50/70 ring-4 ring-indigo-500/10 dark:border-indigo-500/60 dark:bg-indigo-500/10'
                            : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600',
                        )}
                      >
                        <span
                          className={cn(
                            'flex h-9 w-9 items-center justify-center rounded-lg',
                            active
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
                          )}
                        >
                          <Icon className="h-4.5 w-4.5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold text-slate-800 dark:text-slate-100">
                            {option.label}
                          </span>
                          <span className="block text-[10px] text-slate-400">
                            {t(`settings.themeHint.${option.key}`)}
                          </span>
                        </span>
                        {active && <Check className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200/80 p-3.5 dark:border-slate-800">
                <Switch
                  checked={sidebarCollapsed}
                  onChange={setSidebarCollapsed}
                  label={t('settings.collapseSidebar')}
                  description={t('settings.collapseSidebarHint')}
                />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title={t('settings.languageRegion')}
              subtitle={t('settings.languageRegionHint')}
              icon={Languages}
            />
            <CardBody className="space-y-5">
              <div>
                <p className="mb-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                  {t('settings.language')}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { code: 'en', label: 'English', sub: 'EN' },
                    { code: 'km', label: 'ខ្មែរ', sub: 'KM', khmer: true },
                  ].map((option) => {
                    const active = language === option.code
                    return (
                      <button
                        key={option.code}
                        type="button"
                        onClick={() => setLanguage(option.code)}
                        className={cn(
                          'flex items-center gap-3 rounded-xl border p-3.5 text-left transition',
                          active
                            ? 'border-indigo-400 bg-indigo-50/70 ring-4 ring-indigo-500/10 dark:border-indigo-500/60 dark:bg-indigo-500/10'
                            : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600',
                        )}
                      >
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-[11px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                          {option.sub}
                        </span>
                        <span className={cn('min-w-0 flex-1 text-sm font-semibold text-slate-800 dark:text-slate-100', option.khmer && 'font-khmer')}>
                          {option.label}
                        </span>
                        {active && <Check className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Select
                  label={t('settings.currency')}
                  value={draft.currency}
                  onChange={(event) => set('currency', event.target.value)}
                  hint={t('settings.currencyHint')}
                >
                  <option value="USD">USD — US Dollar</option>
                  <option value="KHR">KHR — Cambodian Riel</option>
                </Select>
                <Input
                  label={t('settings.taxRate')}
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={draft.taxRate}
                  onChange={(event) => set('taxRate', event.target.value)}
                  suffix="%"
                />
              </div>
              <p className="rounded-xl bg-slate-50 px-3.5 py-3 text-[11px] leading-relaxed text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
                {t('settings.regionNote')}
              </p>
            </CardBody>
          </Card>
        </div>
      )}

      {tab === 'data' && (
        <div className="grid gap-4 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardHeader
              title={t('settings.dataOverview')}
              subtitle={t('settings.dataOverviewHint')}
              icon={Database}
            />
            <CardBody className="space-y-4">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {storage.counts.map((entry) => (
                  <div
                    key={entry.label}
                    className="rounded-xl border border-slate-200/80 px-3 py-2.5 dark:border-slate-800"
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      {entry.label}
                    </p>
                    <p className="mt-1 text-sm font-bold text-slate-800 dark:text-slate-100">
                      {formatNumber(entry.value)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 px-3.5 py-3 dark:bg-slate-800/50">
                <div>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                    {t('settings.localStorage')}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {t('settings.storageUsed', {
                      size: (storage.bytes / 1024).toFixed(1),
                    })}
                  </p>
                </div>
                <Button variant="outline" size="sm" leftIcon={Download} onClick={exportBackup}>
                  {t('settings.exportBackup')}
                </Button>
              </div>

              <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 dark:border-amber-500/20 dark:bg-amber-500/10">
                <p className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-300">
                  <AlertTriangle className="h-4 w-4" />
                  {t('settings.dangerZone')}
                </p>
                <p className="mt-1 text-[11px] leading-relaxed text-amber-700/80 dark:text-amber-300/80">
                  {t('settings.dangerZoneHint')}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    variant="danger"
                    size="sm"
                    leftIcon={RotateCcw}
                    onClick={() => setConfirming('data')}
                  >
                    {t('settings.resetDemoData')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={RotateCcw}
                    onClick={() => setConfirming('settings')}
                  >
                    {t('settings.resetPreferences')}
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title={t('settings.aboutWorkspace')}
              subtitle={t('settings.aboutWorkspaceHint')}
              icon={Store}
            />
            <CardBody className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">{t('settings.version')}</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">v1.0.0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">{t('settings.storageMode')}</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {t('settings.localBrowser')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">{t('settings.backend')}</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {t('settings.noneDemo')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">{t('settings.currency')}</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {draft.currency}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">{t('settings.taxRate')}</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {draft.taxRate}%
                </span>
              </div>
              <div className="rounded-xl bg-indigo-50/70 px-3.5 py-3 text-[11px] leading-relaxed text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
                {t('settings.demoDataNote')}
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      <ConfirmDialog
        open={confirming === 'data'}
        onClose={() => setConfirming(null)}
        onConfirm={handleResetData}
        title={t('settings.resetDataTitle')}
        description={t('settings.resetDataDescription')}
        confirmLabel={t('settings.resetDemoData')}
      />
      <ConfirmDialog
        open={confirming === 'settings'}
        onClose={() => setConfirming(null)}
        onConfirm={handleResetSettings}
        title={t('settings.resetSettingsTitle')}
        description={t('settings.resetSettingsDescription')}
        confirmLabel={t('settings.resetPreferences')}
      />
    </div>
  )
}
