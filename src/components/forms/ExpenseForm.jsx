import { useEffect, useId } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { CalendarDays, Wallet } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Input, Select, Textarea } from '../ui/Input'
import { Button } from '../ui/Button'
import { useDataStore } from '../../store/useDataStore'

export const expenseCategories = [
  'Rent',
  'Salaries',
  'Utilities',
  'Supplies',
  'Marketing',
  'Maintenance',
  'Transport',
  'Other',
]

function toDateInput(value) {
  if (!value) return new Date().toISOString().slice(0, 10)
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return new Date().toISOString().slice(0, 10)
  return date.toISOString().slice(0, 10)
}

export function ExpenseFormModal({ open, onClose, expense = null }) {
  const { t } = useTranslation()
  const formId = useId()
  const addExpense = useDataStore((state) => state.addExpense)
  const updateExpense = useDataStore((state) => state.updateExpense)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm()

  useEffect(() => {
    if (!open) return
    reset({
      category: expense?.category || expenseCategories[0],
      amount: expense?.amount ?? '',
      description: expense?.description || '',
      date: toDateInput(expense?.date),
    })
  }, [open, expense, reset])

  function onSubmit(values) {
    const payload = {
      category: values.category,
      amount: Number(values.amount),
      description: values.description.trim(),
      date: new Date(`${values.date}T12:00:00`).toISOString(),
    }
    if (expense) {
      updateExpense(expense.id, payload)
      toast.success(t('expenses.updated'))
    } else {
      addExpense(payload)
      toast.success(t('expenses.created'))
    }
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={expense ? t('expenses.editExpense') : t('expenses.addExpense')}
      description={t('expenses.formHint')}
      icon={Wallet}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" form={formId} loading={isSubmitting}>
            {expense ? t('common.saveChanges') : t('expenses.addExpense')}
          </Button>
        </div>
      }
    >
      <form id={formId} onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2" noValidate>
        <Select
          label={t('expenses.category')}
          required
          error={errors.category?.message}
          {...register('category', { required: t('validation.categoryRequired') })}
        >
          {expenseCategories.map((category) => (
            <option key={category} value={category}>
              {t(`expenseCategory.${category.toLowerCase()}`)}
            </option>
          ))}
        </Select>
        <Input
          label={t('expenses.amount')}
          type="number"
          min="0.01"
          step="0.01"
          placeholder="0.00"
          required
          error={errors.amount?.message}
          {...register('amount', {
            required: t('validation.amountRequired'),
            min: { value: 0.01, message: t('validation.amountPositive') },
          })}
        />
        <Input
          label={t('expenses.date')}
          type="date"
          icon={CalendarDays}
          required
          error={errors.date?.message}
          {...register('date', { required: t('validation.dateRequired') })}
        />
        <div className="hidden sm:block" />
        <Textarea
          label={t('common.description')}
          placeholder={t('expenses.descriptionPlaceholder')}
          containerClassName="sm:col-span-2"
          rows={3}
          required
          error={errors.description?.message}
          {...register('description', { required: t('validation.descriptionRequired') })}
        />
      </form>
    </Modal>
  )
}
