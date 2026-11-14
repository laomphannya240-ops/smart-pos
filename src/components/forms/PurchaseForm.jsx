import { useEffect, useId, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import {
  ClipboardList,
  Info,
  Plus,
  Trash2,
  Truck,
} from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Input, Select, Textarea } from '../ui/Input'
import { Button } from '../ui/Button'
import { ProductThumb } from '../ui/ProductThumb'
import { useDataStore } from '../../store/useDataStore'
import { useCurrency } from '../../hooks/useCurrency'
import { round } from '../../utils/format'

function emptyLine() {
  return { key: `line-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, productId: '', qty: 1, cost: '' }
}

export function PurchaseFormModal({ open, onClose, onSaved }) {
  const { t } = useTranslation()
  const money = useCurrency()
  const formId = useId()
  const suppliers = useDataStore((state) => state.suppliers)
  const products = useDataStore((state) => state.products)
  const addPurchase = useDataStore((state) => state.addPurchase)
  const [lines, setLines] = useState([emptyLine()])
  const [lineError, setLineError] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { supplierId: '', status: 'draft', note: '' } })

  useEffect(() => {
    if (!open) return
    setLines([emptyLine()])
    setLineError('')
    reset({
      supplierId: suppliers[0]?.id || '',
      status: 'draft',
      note: '',
    })
  }, [open, reset, suppliers])

  const productMap = useMemo(() => new Map(products.map((product) => [product.id, product])), [products])

  const total = round(
    lines.reduce((sum, line) => sum + Number(line.cost || 0) * Number(line.qty || 0), 0),
  )
  const totalUnits = lines.reduce((sum, line) => sum + (Number(line.qty) || 0), 0)

  function updateLine(key, patch) {
    setLines((current) => current.map((line) => (line.key === key ? { ...line, ...patch } : line)))
  }

  function changeProduct(key, productId) {
    const product = productMap.get(productId)
    updateLine(key, { productId, cost: product ? String(product.costPrice) : '' })
    setLineError('')
  }

  function removeLine(key) {
    setLines((current) => (current.length === 1 ? current : current.filter((line) => line.key !== key)))
  }

  function onSubmit(values) {
    const validLines = lines.filter((line) => line.productId && Number(line.qty) > 0)
    if (validLines.length === 0) {
      setLineError(t('purchases.itemsRequired'))
      return
    }

    const items = validLines.map((line) => {
      const product = productMap.get(line.productId)
      return {
        productId: line.productId,
        name: product?.name || '',
        emoji: product?.emoji || '📦',
        qty: Number(line.qty),
        cost: round(Number(line.cost) || 0),
      }
    })

    const purchase = addPurchase({
      supplierId: values.supplierId,
      status: values.status,
      note: values.note.trim(),
      items,
    })
    toast.success(t('purchases.created', { number: purchase.number }))
    onSaved?.(purchase)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('purchases.addPurchase')}
      description={t('purchases.formHint')}
      icon={ClipboardList}
      size="2xl"
      footer={
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t('purchases.formTotal', { count: totalUnits, amount: money(total) })}
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" form={formId} loading={isSubmitting}>
              {t('purchases.addPurchase')}
            </Button>
          </div>
        </div>
      }
    >
      <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label={t('purchases.supplier')}
            required
            placeholder={t('purchases.selectSupplier')}
            error={errors.supplierId?.message}
            options={suppliers
              .filter((supplier) => supplier.status === 'active')
              .map((supplier) => ({ value: supplier.id, label: supplier.name }))}
            {...register('supplierId', { required: t('validation.supplierRequired') })}
          />
          <Select
            label={t('common.status')}
            hint={t('purchases.statusHint')}
            {...register('status')}
          >
            <option value="draft">{t('status.draft')}</option>
            <option value="ordered">{t('status.ordered')}</option>
          </Select>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 bg-slate-50/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/40">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                <Truck className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                  {t('purchases.orderItems')}
                </p>
                <p className="text-[10px] text-slate-400">{t('purchases.orderItemsHint')}</p>
              </div>
            </div>
            <Button
              type="button"
              size="xs"
              variant="soft"
              leftIcon={Plus}
              onClick={() => setLines((current) => [...current, emptyLine()])}
            >
              {t('purchases.addItem')}
            </Button>
          </div>

          <div className="hidden items-center gap-2 border-b border-slate-100 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 md:flex">
            <span className="flex-1">{t('purchases.product')}</span>
            <span className="w-20 text-center">{t('purchases.qty')}</span>
            <span className="w-28 text-center">{t('purchases.unitCost')}</span>
            <span className="w-24 text-right">{t('common.total')}</span>
            <span className="w-8" />
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {lines.map((line) => {
              const product = productMap.get(line.productId)
              const lineTotal = (Number(line.cost) || 0) * (Number(line.qty) || 0)
              return (
                <div key={line.key} className="flex flex-col gap-2 px-4 py-3 md:flex-row md:items-center">
                  <div className="flex min-w-0 flex-1 items-center gap-2.5">
                    <ProductThumb product={product || { emoji: '📦' }} size="sm" tone="indigo" />
                    <Select
                      containerClassName="min-w-0 flex-1"
                      value={line.productId}
                      onChange={(event) => changeProduct(line.key, event.target.value)}
                      options={products.map((entry) => ({
                        value: entry.id,
                        label: `${entry.name} · ${entry.sku}`,
                      }))}
                      placeholder={t('purchases.selectProduct')}
                      className="h-9 text-xs"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      containerClassName="w-16 shrink-0 sm:w-20"
                      type="number"
                      min="1"
                      value={line.qty}
                      onChange={(event) => updateLine(line.key, { qty: event.target.value })}
                      className="h-9 text-center text-xs"
                      aria-label={t('purchases.qty')}
                    />
                    <Input
                      containerClassName="min-w-0 flex-1 sm:w-28 sm:flex-none"
                      type="number"
                      min="0"
                      step="0.01"
                      value={line.cost}
                      onChange={(event) => updateLine(line.key, { cost: event.target.value })}
                      className="h-9 text-center text-xs"
                      aria-label={t('purchases.unitCost')}
                    />
                    <span className="min-w-[3.5rem] text-right text-xs font-semibold text-slate-800 dark:text-slate-100 md:w-24">
                      {money(lineTotal)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeLine(line.key)}
                      disabled={lines.length === 1}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-500 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-rose-500/10"
                      aria-label={t('common.remove')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {lineError && (
            <p className="border-t border-rose-100 bg-rose-50 px-4 py-2 text-xs font-medium text-rose-600 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400">
              {lineError}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/60 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/30">
            <span className="text-[11px] text-slate-400">
              {t('purchases.itemsCount', { count: lines.filter((line) => line.productId).length })}
            </span>
            <div className="text-right">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                {t('purchases.purchaseTotal')}
              </p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">{money(total)}</p>
            </div>
          </div>
        </div>

        <Textarea
          label={t('common.notes')}
          placeholder={t('purchases.notesPlaceholder')}
          rows={2}
          {...register('note')}
        />

        <div className="flex items-start gap-2 rounded-xl bg-amber-50/80 px-3.5 py-3 text-[11px] leading-relaxed text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          {t('purchases.stockNote')}
        </div>
      </form>
    </Modal>
  )
}
