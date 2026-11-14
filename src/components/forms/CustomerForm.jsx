import { useEffect, useId } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { Mail, MapPin, Phone, User, UserPlus } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Input, Textarea } from '../ui/Input'
import { Button } from '../ui/Button'
import { useDataStore } from '../../store/useDataStore'

export function CustomerFormModal({ open, onClose, customer = null, onSaved }) {
  const { t } = useTranslation()
  const formId = useId()
  const customers = useDataStore((state) => state.customers)
  const addCustomer = useDataStore((state) => state.addCustomer)
  const updateCustomer = useDataStore((state) => state.updateCustomer)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm()

  useEffect(() => {
    if (!open) return
    reset({
      name: customer?.name || '',
      phone: customer?.phone || '',
      email: customer?.email || '',
      address: customer?.address || '',
      notes: customer?.notes || '',
    })
  }, [open, customer, reset])

  function onSubmit(values) {
    const duplicate = customers.find(
      (entry) =>
        entry.id !== customer?.id &&
        values.phone &&
        entry.phone.replace(/\s/g, '') === values.phone.replace(/\s/g, ''),
    )
    if (duplicate) {
      toast.error(t('customers.duplicatePhone'))
      return
    }

    let saved
    if (customer) {
      updateCustomer(customer.id, values)
      saved = { ...customer, ...values }
      toast.success(t('customers.updated'))
    } else {
      saved = addCustomer(values)
      toast.success(t('customers.created'))
    }
    onSaved?.(saved)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={customer ? t('customers.editCustomer') : t('customers.addCustomer')}
      description={t('customers.formHint')}
      icon={customer ? User : UserPlus}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" form={formId} loading={isSubmitting}>
            {customer ? t('common.saveChanges') : t('customers.addCustomer')}
          </Button>
        </div>
      }
    >
      <form id={formId} onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2" noValidate>
        <Input
          label={t('common.fullName')}
          placeholder={t('customers.namePlaceholder')}
          icon={User}
          required
          error={errors.name?.message}
          {...register('name', { required: t('validation.nameRequired') })}
        />
        <Input
          label={t('common.phone')}
          placeholder="+855 12 345 678"
          icon={Phone}
          required
          error={errors.phone?.message}
          {...register('phone', {
            required: t('validation.phoneRequired'),
            pattern: {
              value: /^[+()\d\s-]{7,20}$/,
              message: t('validation.phoneInvalid'),
            },
          })}
        />
        <Input
          label={t('common.email')}
          type="email"
          placeholder="customer@email.com"
          icon={Mail}
          error={errors.email?.message}
          {...register('email', {
            pattern: {
              value: /^$|^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: t('validation.emailInvalid'),
            },
          })}
        />
        <Input
          label={t('common.address')}
          placeholder={t('customers.addressPlaceholder')}
          icon={MapPin}
          error={errors.address?.message}
          {...register('address')}
        />
        <Textarea
          label={t('common.notes')}
          placeholder={t('customers.notesPlaceholder')}
          containerClassName="sm:col-span-2"
          rows={2}
          {...register('notes')}
        />
      </form>
    </Modal>
  )
}
