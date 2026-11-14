import { useEffect, useId, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import {
  Barcode,
  ImagePlus,
  Package,
  RefreshCw,
  Tag,
  Trash2,
  Upload,
} from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Input, Select, Textarea } from '../ui/Input'
import { Button } from '../ui/Button'
import { ProductThumb } from '../ui/ProductThumb'
import { useDataStore } from '../../store/useDataStore'

function randomBarcode() {
  return `885${String(Math.floor(Math.random() * 1e10)).padStart(10, '0')}`
}

export function ProductFormModal({ open, onClose, product = null }) {
  const { t } = useTranslation()
  const formId = useId()
  const fileRef = useRef(null)
  const categories = useDataStore((state) => state.categories)
  const products = useDataStore((state) => state.products)
  const addProduct = useDataStore((state) => state.addProduct)
  const updateProduct = useDataStore((state) => state.updateProduct)
  const [image, setImage] = useState('')
  const [emoji, setEmoji] = useState('📦')

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm()

  useEffect(() => {
    if (!open) return
    setImage(product?.image || '')
    setEmoji(product?.emoji || '📦')
    reset({
      name: product?.name || '',
      sku: product?.sku || '',
      barcode: product?.barcode || '',
      categoryId: product?.categoryId || categories[0]?.id || '',
      description: product?.description || '',
      costPrice: product?.costPrice ?? '',
      price: product?.price ?? '',
      stock: product?.stock ?? 0,
      minStock: product?.minStock ?? 5,
      status: product?.status || 'active',
    })
  }, [open, product, reset, categories])

  function handleFile(event) {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error(t('products.imageTypeError'))
      return
    }
    if (file.size > 1.5 * 1024 * 1024) {
      toast.error(t('products.imageSizeError'))
      return
    }
    const reader = new FileReader()
    reader.onload = () => setImage(String(reader.result))
    reader.readAsDataURL(file)
    event.target.value = ''
  }

  function onSubmit(values) {
    const duplicate = products.find(
      (entry) =>
        entry.id !== product?.id &&
        (entry.sku.toLowerCase() === values.sku.trim().toLowerCase() ||
          (values.barcode && String(entry.barcode) === String(values.barcode).trim())),
    )
    if (duplicate) {
      toast.error(t('products.duplicateSku'))
      return
    }

    const payload = {
      ...values,
      name: values.name.trim(),
      sku: values.sku.trim().toUpperCase(),
      barcode: String(values.barcode || '').trim(),
      costPrice: Number(values.costPrice),
      price: Number(values.price),
      stock: Number(values.stock),
      minStock: Number(values.minStock),
      image,
      emoji,
    }

    if (product) {
      updateProduct(product.id, payload)
      toast.success(t('products.updated'))
    } else {
      addProduct(payload)
      toast.success(t('products.created'))
    }
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={product ? t('products.editProduct') : t('products.addProduct')}
      description={t('products.formHint')}
      icon={Package}
      size="xl"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" form={formId} loading={isSubmitting}>
            {product ? t('common.saveChanges') : t('products.addProduct')}
          </Button>
        </div>
      }
    >
      <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/30 sm:flex-row sm:items-center">
          <ProductThumb
            product={{ image, emoji, name: 'Preview' }}
            size="xl"
            tone="indigo"
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              {t('products.productImage')}
            </p>
            <p className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">
              {t('products.imageHint')}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleFile}
                className="hidden"
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                leftIcon={Upload}
                onClick={() => fileRef.current?.click()}
              >
                {t('products.uploadImage')}
              </Button>
              {image && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  leftIcon={Trash2}
                  onClick={() => setImage('')}
                >
                  {t('common.remove')}
                </Button>
              )}
              <span className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <ImagePlus className="h-3.5 w-3.5" />
                {t('products.orEmoji')}
              </span>
              <input
                value={emoji}
                onChange={(event) => setEmoji(event.target.value.slice(0, 4))}
                className="h-8 w-14 rounded-lg border border-slate-200 bg-white text-center text-base outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900"
                aria-label={t('products.emoji')}
              />
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label={t('products.productName')}
            placeholder={t('products.namePlaceholder')}
            icon={Tag}
            required
            error={errors.name?.message}
            {...register('name', {
              required: t('validation.nameRequired'),
              minLength: { value: 2, message: t('validation.nameMin') },
            })}
          />
          <Input
            label={t('products.sku')}
            placeholder="BEV-001"
            required
            error={errors.sku?.message}
            {...register('sku', {
              required: t('validation.skuRequired'),
              pattern: {
                value: /^[A-Za-z0-9-]+$/,
                message: t('validation.skuInvalid'),
              },
            })}
          />
          <Input
            label={t('products.barcode')}
            placeholder="8850000000000"
            icon={Barcode}
            error={errors.barcode?.message}
            trailing={
              <button
                type="button"
                onClick={() =>
                  setValue('barcode', randomBarcode(), { shouldValidate: true })
                }
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800"
                title={t('products.generateBarcode')}
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            }
            {...register('barcode')}
          />
          <Select
            label={t('common.category')}
            required
            options={categories.map((category) => ({
              value: category.id,
              label: category.name,
            }))}
            placeholder={t('products.selectCategory')}
            error={errors.categoryId?.message}
            {...register('categoryId', { required: t('validation.categoryRequired') })}
          />
          <Input
            label={t('products.costPrice')}
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            required
            error={errors.costPrice?.message}
            {...register('costPrice', {
              required: t('validation.costRequired'),
              min: { value: 0, message: t('validation.amountPositive') },
            })}
          />
          <Input
            label={t('products.sellingPrice')}
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            required
            error={errors.price?.message}
            {...register('price', {
              required: t('validation.priceRequired'),
              min: { value: 0, message: t('validation.amountPositive') },
            })}
          />
          <Input
            label={t('products.stockQuantity')}
            type="number"
            min="0"
            required
            error={errors.stock?.message}
            {...register('stock', {
              required: t('validation.stockRequired'),
              min: { value: 0, message: t('validation.stockMin') },
            })}
          />
          <Input
            label={t('products.minimumStock')}
            type="number"
            min="0"
            required
            hint={t('products.minStockHint')}
            error={errors.minStock?.message}
            {...register('minStock', {
              required: t('validation.stockRequired'),
              min: { value: 0, message: t('validation.stockMin') },
            })}
          />
          <Select label={t('common.status')} {...register('status')}>
            <option value="active">{t('common.active')}</option>
            <option value="inactive">{t('common.inactive')}</option>
          </Select>
          <div className="hidden sm:block" />
          <Textarea
            label={t('common.description')}
            placeholder={t('products.descriptionPlaceholder')}
            containerClassName="sm:col-span-2"
            rows={3}
            {...register('description')}
          />
        </div>
      </form>
    </Modal>
  )
}
