import { useEffect, useId } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { Tags } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Input, Select, Textarea } from '../ui/Input'
import { Button } from '../ui/Button'
import { useDataStore } from '../../store/useDataStore'
import { cn } from '../../utils/cn'

const colors = ['indigo', 'violet', 'emerald', 'amber', 'orange', 'sky', 'rose', 'teal']

const swatch = {
  indigo: 'bg-indigo-500',
  violet: 'bg-violet-500',
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  orange: 'bg-orange-500',
  sky: 'bg-sky-500',
  rose: 'bg-rose-500',
  teal: 'bg-teal-500',
}

export function CategoryFormModal({ open, onClose, category = null }) {
  const { t } = useTranslation()
  const formId = useId()
  const addCategory = useDataStore((state) => state.addCategory)
  const updateCategory = useDataStore((state) => state.updateCategory)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm()

  useEffect(() => {
    if (!open) return
    reset({
      name: category?.name || '',
      emoji: category?.emoji || '🏷️',
      color: category?.color || 'indigo',
      description: category?.description || '',
      status: category?.status || 'active',
    })
  }, [open, category, reset])

  const selectedColor = watch('color')

  function onSubmit(values) {
    const payload = { ...values, name: values.name.trim() }
    if (category) {
      updateCategory(category.id, payload)
      toast.success(t('categories.updated'))
    } else {
      addCategory(payload)
      toast.success(t('categories.created'))
    }
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={category ? t('categories.editCategory') : t('categories.addCategory')}
      description={t('categories.formHint')}
      icon={Tags}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" form={formId} loading={isSubmitting}>
            {category ? t('common.saveChanges') : t('categories.addCategory')}
          </Button>
        </div>
      }
    >
      <form id={formId} onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2" noValidate>
        <Input
          label={t('categories.categoryName')}
          placeholder={t('categories.namePlaceholder')}
          required
          error={errors.name?.message}
          {...register('name', {
            required: t('validation.nameRequired'),
            minLength: { value: 2, message: t('validation.nameMin') },
          })}
        />
        <Input
          label={t('categories.icon')}
          placeholder="🏷️"
          hint={t('categories.iconHint')}
          className="text-center text-lg"
          {...register('emoji')}
        />
        <div className="space-y-1.5 sm:col-span-2">
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            {t('categories.color')}
          </p>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setValue('color', color)}
                className={cn(
                  'h-8 w-8 rounded-full border-2 transition',
                  swatch[color],
                  selectedColor === color
                    ? 'scale-110 border-white ring-2 ring-slate-400 dark:ring-slate-500'
                    : 'border-transparent opacity-70 hover:opacity-100',
                )}
                aria-label={color}
              />
            ))}
          </div>
        </div>
        <Textarea
          label={t('common.description')}
          placeholder={t('categories.descriptionPlaceholder')}
          containerClassName="sm:col-span-2"
          rows={3}
          {...register('description')}
        />
        <Select label={t('common.status')} {...register('status')}>
          <option value="active">{t('common.active')}</option>
          <option value="inactive">{t('common.inactive')}</option>
        </Select>
      </form>
    </Modal>
  )
}
