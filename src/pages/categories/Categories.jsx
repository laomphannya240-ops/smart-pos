import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import {
  Boxes,
  MoreHorizontal,
  Pencil,
  Plus,
  SearchX,
  Tags,
  Trash2,
  TrendingUp,
} from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { StatCard } from '../../components/ui/StatCard'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge, StatusBadge } from '../../components/ui/Badge'
import { SearchInput } from '../../components/ui/Input'
import { Dropdown, DropdownItem } from '../../components/ui/Dropdown'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { EmptyState } from '../../components/ui/EmptyState'
import { CategoryFormModal } from '../../components/forms/CategoryForm'
import { useDataStore } from '../../store/useDataStore'
import { useCurrency } from '../../hooks/useCurrency'
import { useDelayedReady } from '../../hooks/useDelayedReady'
import { useTableControls } from '../../hooks/useTableControls'
import { cn } from '../../utils/cn'

export function Categories() {
  const { t } = useTranslation()
  const money = useCurrency()
  const categories = useDataStore((state) => state.categories)
  const products = useDataStore((state) => state.products)
  const deleteCategory = useDataStore((state) => state.deleteCategory)
  const ready = useDelayedReady(240)

  const { query, setQuery, resetFilters } = useTableControls()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)

  const rows = useMemo(() => {
    const term = query.trim().toLowerCase()
    return categories
      .filter((category) => !term || category.name.toLowerCase().includes(term))
      .map((category) => {
        const own = products.filter((product) => product.categoryId === category.id)
        return {
          ...category,
          productCount: own.length,
          units: own.reduce((sum, product) => sum + Number(product.stock || 0), 0),
          value: own.reduce(
            (sum, product) => sum + Number(product.price || 0) * Number(product.stock || 0),
            0,
          ),
          lowStock: own.filter(
            (product) => product.status === 'active' && product.stock <= product.minStock,
          ).length,
        }
      })
  }, [categories, products, query])

  const stats = useMemo(() => {
    const active = categories.filter((category) => category.status === 'active')
    const assigned = products.filter((product) => product.categoryId).length
    return {
      active: active.length,
      assigned,
      avg: categories.length ? Math.round(products.length / categories.length) : 0,
      value: products.reduce(
        (sum, product) => sum + Number(product.price || 0) * Number(product.stock || 0),
        0,
      ),
    }
  }, [categories, products])

  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }

  function confirmDelete() {
    if (!deleting) return
    deleteCategory(deleting.id)
    toast.success(t('categories.deleted', { name: deleting.name }))
    setDeleting(null)
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title={t('categories.title')}
        description={t('categories.subtitle')}
        badge={<Badge tone="violet">{t('common.countItems', { count: categories.length })}</Badge>}
        actions={
          <Button leftIcon={Plus} onClick={openCreate}>
            {t('categories.addCategory')}
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard
          label={t('categories.totalCategories')}
          value={categories.length}
          icon={Tags}
          tone="violet"
          hint={t('categories.activeCount', { count: stats.active })}
          loading={!ready}
        />
        <StatCard
          label={t('categories.assignedProducts')}
          value={stats.assigned}
          icon={Boxes}
          tone="indigo"
          hint={t('categories.assignedHint', { count: products.length - stats.assigned })}
          loading={!ready}
        />
        <StatCard
          label={t('categories.avgProducts')}
          value={stats.avg}
          icon={TrendingUp}
          tone="emerald"
          hint={t('categories.avgHint')}
          loading={!ready}
        />
        <StatCard
          label={t('categories.retailValue')}
          value={money(stats.value)}
          icon={Tags}
          tone="amber"
          hint={t('categories.retailValueHint')}
          loading={!ready}
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t('categories.searchPlaceholder')}
          className="sm:max-w-sm"
        />
        {query && (
          <Button variant="ghost" size="sm" leftIcon={SearchX} onClick={resetFilters}>
            {t('common.resetFilters')}
          </Button>
        )}
        <p className="text-xs text-slate-400 sm:ml-auto dark:text-slate-500">
          {t('categories.showing', { count: rows.length })}
        </p>
      </div>

      {!ready ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="app-card h-48 animate-pulse" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <Card>
          <EmptyState
            icon={Tags}
            title={t('categories.noCategories')}
            description={t('categories.noCategoriesHint')}
            action={
              <Button leftIcon={Plus} onClick={openCreate}>
                {t('categories.addCategory')}
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map((category) => (
            <Card key={category.id} hover className="relative overflow-hidden p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className={cn(
                      'flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-3xl shadow-inner',
                      category.color === 'amber' &&
                        'from-amber-100 to-orange-50 dark:from-amber-500/20 dark:to-orange-500/10',
                      category.color === 'orange' &&
                        'from-orange-100 to-rose-50 dark:from-orange-500/20 dark:to-rose-500/10',
                      category.color === 'sky' &&
                        'from-sky-100 to-cyan-50 dark:from-sky-500/20 dark:to-cyan-500/10',
                      category.color === 'rose' &&
                        'from-rose-100 to-pink-50 dark:from-rose-500/20 dark:to-pink-500/10',
                      category.color === 'emerald' &&
                        'from-emerald-100 to-teal-50 dark:from-emerald-500/20 dark:to-teal-500/10',
                      category.color === 'violet' &&
                        'from-violet-100 to-purple-50 dark:from-violet-500/20 dark:to-purple-500/10',
                      category.color === 'indigo' &&
                        'from-indigo-100 to-blue-50 dark:from-indigo-500/20 dark:to-blue-500/10',
                      category.color === 'teal' &&
                        'from-teal-100 to-emerald-50 dark:from-teal-500/20 dark:to-emerald-500/10',
                      !['amber', 'orange', 'sky', 'rose', 'emerald', 'violet', 'indigo', 'teal'].includes(
                        category.color,
                      ) && 'from-slate-100 to-slate-50 dark:from-slate-700 dark:to-slate-800',
                    )}
                  >
                    {category.emoji || '🏷️'}
                  </span>
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-bold text-slate-900 dark:text-white">
                      {category.name}
                    </h3>
                    <div className="mt-1">
                      <StatusBadge status={category.status}>{t(`common.${category.status}`)}</StatusBadge>
                    </div>
                  </div>
                </div>
                <Dropdown
                  width="w-40"
                  trigger={({ toggle }) => (
                    <button
                      type="button"
                      onClick={toggle}
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
                        icon={Pencil}
                        onClick={() => {
                          setEditing(category)
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
                          setDeleting(category)
                          close()
                        }}
                      >
                        {t('common.delete')}
                      </DropdownItem>
                    </div>
                  )}
                </Dropdown>
              </div>

              <p className="mt-3 line-clamp-2 min-h-[32px] text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                {category.description || t('categories.noDescription')}
              </p>

              <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-slate-400">
                    {t('categories.products')}
                  </p>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    {category.productCount}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-slate-400">
                    {t('categories.units')}
                  </p>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    {category.units}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-slate-400">
                    {t('categories.value')}
                  </p>
                  <p className="truncate text-sm font-bold text-indigo-600 dark:text-indigo-400">
                    {money(category.value)}
                  </p>
                </div>
              </div>

              {category.lowStock > 0 && (
                <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  {t('categories.lowStockInCategory', { count: category.lowStock })}
                </p>
              )}
            </Card>
          ))}
        </div>
      )}

      <CategoryFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        category={editing}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        title={t('categories.deleteTitle')}
        description={t('categories.deleteDescription', { name: deleting?.name || '' })}
        confirmLabel={t('common.delete')}
      />
    </div>
  )
}
